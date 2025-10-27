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

    const seat = await this.prisma.seat.findUnique({
      where: { id: seatId },
    });
    if (!seat) throw new NotFoundException('Seat not found');

    if (seat.busId !== schedule.busId) {
      throw new BadRequestException('Seat does not belong to this schedule bus!');
    }

    if (!seat.isAvailable) {
      throw new BadRequestException('Seat already taken');
    }

    const userTickets = await this.ticketRepo.findByUserInDay(userId, new Date());
    if (userTickets >= 8) {
      throw new BadRequestException('Max 8 tickets per day reached');
    }

    const brandTickets = await this.ticketRepo.countBrandSoldInDay(schedule.bus.brandId);
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit) {
      throw new BadRequestException('Brand reached daily ticket limit');
    }

    const ticket = await this.ticketRepo.create(dto);

    await this.prisma.seat.update({
      where: { id: seatId },
      data: { isAvailable: false },
    });

    return ticket;
  }

  async payTicket(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const diffMinutes =
      (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60);

    if (diffMinutes > 15) {
      throw new BadRequestException('Payment expired (over 15 minutes)');
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

    if (diffDays > 2) {
      throw new BadRequestException('Ticket can only be canceled within 2 days');
    }

    await this.prisma.seat.update({
      where: { id: ticket.seatId },
      data: { isAvailable: true },
    });

    await this.ticketRepo.update(id, { status: TicketStatus.CANCELLED });

    return { message: 'Cancel success', ticketId: id };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }
}
