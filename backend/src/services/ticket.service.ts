import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PrismaService } from '../services/prisma.service';
import { TicketStatus } from '../models/Ticket';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { TICKET_QUEUE, AUTO_CANCEL_JOB } from '../queues/ticket.queue';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prisma: PrismaService,
    @InjectQueue(TICKET_QUEUE) private ticketQueue: Queue,
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
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Seat invalid for this schedule');

    const seatBooked = await this.ticketRepo.checkSeatBooked(
      scheduleId,
      seatId,
    );
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

    await this.prisma.seat.update({
      where: { id: seatId },
      data: { isAvailable: false },
    });

    const created = await this.ticketRepo.create(dto);

    await this.ticketQueue.add(
      AUTO_CANCEL_JOB,
      { ticketId: created.id },
      {delay: 15 * 60 * 1000},
        // ======================================================
        // delay: 15 * 60 * 1000 (15 phút)
        // delay: 30 * 1000 (30s)
        // ======================================================
    );

    return created;
  }

  async payTicket(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (ticket.status === TicketStatus.PAID)
      throw new BadRequestException('Ticket already paid');

    const jobs = await this.ticketQueue.getDelayed();
    for (const job of jobs) {
      if (job.data.ticketId === id) await job.remove();
    }

    return this.ticketRepo.update(id, { status: TicketStatus.PAID });
  }

  async cancel(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.ticketRepo.update(id, { status: TicketStatus.CANCELLED });

    await this.prisma.seat.update({
      where: { id: ticket.seatId },
      data: { isAvailable: true },
    });

    return { message: 'Cancel success', ticketId: id };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }
}
