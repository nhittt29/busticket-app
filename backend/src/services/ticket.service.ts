import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateTicketDto) {
    const { userId, scheduleId, seatId } = dto;

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bus: { include: { brand: true } } },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const seat = await this.prisma.seat.findUnique({
      where: { id: seatId },
    });
    if (!seat) throw new NotFoundException('Seat not found');

    if (seat.busId !== schedule.busId) {
      throw new BadRequestException(
        'Ghế không thuộc xe của lịch trình này!',
      );
    }

    if (!seat.isAvailable) {
      throw new BadRequestException('Ghế đã được đặt');
    }

    const userTickets = await this.ticketRepo.findByUserInDay(userId, new Date());
    if (userTickets >= 8) {
      throw new BadRequestException('User đã đạt giới hạn 8 vé/ngày');
    }

    const brandTickets = await this.ticketRepo.countBrandSoldInDay(schedule.bus.brandId);
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit) {
      throw new BadRequestException('Brand đã hết vé cho phép trong hôm nay');
    }

    const ticket = await this.ticketRepo.create(dto);

    await this.prisma.seat.update({
      where: { id: seatId },
      data: { isAvailable: false },
    });

    return ticket;
  }

  async cancel(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const diffDays =
      (Date.now() - new Date(ticket.createdAt).getTime()) /
      (1000 * 3600 * 24);

    if (diffDays > 2) {
      throw new BadRequestException(
        'Vé chỉ được hủy trong vòng 2 ngày sau khi đặt',
      );
    }

    // Cập nhật seat thành available
    await this.prisma.seat.update({
      where: { id: ticket.seatId },
      data: { isAvailable: true },
    });

    // Xóa vé
    await this.ticketRepo.delete(id);

    // Trả về thông báo hủy thành công
    return {
      message: 'Hủy vé thành công',
      ticketId: id,
    };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }
}
