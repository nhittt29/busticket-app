import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PrismaService } from '../services/prisma.service';
import { TicketStatus } from '../models/Ticket';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prisma: PrismaService,
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
  ) {}

  /**
   * ✅ 1. Đặt vé mới
   * - Check ghế, brand, limit
   * - Tạo ticket ở trạng thái BOOKED
   * - Đưa job vào queue Redis (15 phút tự hủy nếu chưa thanh toán)
   */
  async create(dto: CreateTicketDto) {
    const { userId, scheduleId, seatId } = dto;

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bus: { include: { brand: true } } },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Seat invalid for this schedule');

    const seatBooked = await this.ticketRepo.checkSeatBooked(scheduleId, seatId);
    if (seatBooked)
      throw new BadRequestException('Seat already booked or paid');

    const userTickets = await this.ticketRepo.findUserBookedToday(userId);
    if (userTickets >= 8)
      throw new BadRequestException('Max 8 tickets per day reached');

    const brandTickets = await this.ticketRepo.countBrandSoldToday(
      schedule.bus.brandId,
    );
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
      throw new BadRequestException('Brand daily limit reached');

    // ✅ Tạo vé BOOKED
    const ticket = await this.ticketRepo.create(dto);

    // ✅ Đưa vào Redis Queue: 15 phút sẽ tự hủy nếu chưa thanh toán
    await this.ticketQueue.add(
      'hold-expire',
      { ticketId: ticket.id },
      { delay: 15 * 60 * 1000 },
        // ======================================================
        // delay: 15 * 60 * 1000 (15 phút)
        // delay: 30 * 1000 (30s)
        // ======================================================
    );

    this.logger.log(
      `🎟️ Ticket #${ticket.id} booked. Hold 15 mins before payment.`,
    );

    return ticket;
  }

  /**
   * ✅ 2. Thanh toán vé
   * - Chỉ thanh toán trước giờ khởi hành ≥ 1 tiếng
   * - Cập nhật trạng thái PAID
   * - Khóa ghế vĩnh viễn
   * - Xóa job trong Redis queue
   */
  async payTicket(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status === TicketStatus.PAID)
      throw new BadRequestException('Ticket already paid');

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: ticket.scheduleId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const diffHours =
      (new Date(schedule.departureAt).getTime() - Date.now()) / (1000 * 3600);
    if (diffHours < 1)
      throw new BadRequestException(
        'Payment not allowed if less than 1 hour before departure',
      );

    // ✅ Cập nhật trạng thái vé + khóa ghế
    await this.prisma.$transaction([
      this.ticketRepo.update(id, { status: TicketStatus.PAID }),
      this.prisma.seat.update({
        where: { id: ticket.seatId },
        data: { isAvailable: false },
      }),
    ]);

    // ✅ Xóa job trong Redis queue
    const jobs = await this.ticketQueue.getDelayed();
    for (const job of jobs) {
      if (job.data.ticketId === id) await job.remove();
    }

    this.logger.log(`💳 Ticket #${id} paid successfully.`);
    return { message: 'Payment successful', ticketId: id };
  }

  /**
   * ✅ 3. Hủy vé
   * - Chỉ cho phép hủy trước 2 tiếng khởi hành
   * - Mở lại ghế
   */
  async cancel(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: ticket.scheduleId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const diffHours =
      (new Date(schedule.departureAt).getTime() - Date.now()) / (1000 * 3600);
    if (diffHours < 2)
      throw new BadRequestException(
        'Cancel not allowed if less than 2 hours before departure',
      );

    // ✅ Trả ghế + update trạng thái
    await this.prisma.$transaction([
      this.ticketRepo.update(id, { status: TicketStatus.CANCELLED }),
      this.prisma.seat.update({
        where: { id: ticket.seatId },
        data: { isAvailable: true },
      }),
    ]);

    this.logger.log(`❌ Ticket #${id} cancelled by user.`);
    return { message: 'Cancel success', ticketId: id };
  }

  /**
   * ✅ 4. Lấy danh sách vé theo user
   */
  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }
}
