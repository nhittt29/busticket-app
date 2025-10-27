import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PrismaService } from '../services/prisma.service';
import { TicketStatus } from '../models/Ticket';

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

    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Seat invalid for this schedule');

    const seatBooked = await this.ticketRepo.checkSeatBooked(scheduleId, seatId);
    if (seatBooked) throw new BadRequestException('Seat already booked/paid');

    const userTickets = await this.ticketRepo.findByUserInDay(userId, new Date());
    if (userTickets >= 8)
      throw new BadRequestException('Max 8 tickets per day reached');

    const brandTickets = await this.ticketRepo.countBrandSoldInDay(
      schedule.bus.brandId,
    );
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
      throw new BadRequestException('Brand daily limit reached');

    return await this.ticketRepo.create(dto);
  }

  async payTicket(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status === TicketStatus.PAID)
      throw new BadRequestException('Ticket already paid');

    const diffMinutes =
      (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60);

    if (diffMinutes > 15) {
      await this.ticketRepo.update(id, { status: TicketStatus.CANCELLED });
      throw new BadRequestException('Payment expired > 15m. Ticket cancelled');
    }

    return this.ticketRepo.update(id, {
      status: TicketStatus.PAID,
    });
  }

  async cancel(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const diffDays =
      (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 3600 * 24);

    if (diffDays > 2)
      throw new BadRequestException('Cancel allowed within 2 days only');

    await this.ticketRepo.update(id, { status: TicketStatus.CANCELLED });

    return { message: 'Cancel success', ticketId: id };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }
}
