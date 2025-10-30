// src/services/ticket.service.ts
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
import { MomoService } from './momo.service';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prisma: PrismaService,
    private readonly momoService: MomoService,
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
  ) {}

  async create(dto: CreateTicketDto): Promise<any> {
    const { userId, scheduleId, seatId, price } = dto;

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bus: { include: { brand: true } } },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Seat invalid for this schedule');

    const seatBooked = await this.ticketRepo.checkSeatBooked(scheduleId, seatId);
    if (seatBooked) throw new BadRequestException('Seat already booked');

    const userTickets = await this.ticketRepo.findUserBookedToday(userId);
    if (userTickets >= 8) throw new BadRequestException('Max 8 tickets per day');

    const brandTickets = await this.ticketRepo.countBrandSoldToday(schedule.bus.brandId);
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
      throw new BadRequestException('Brand daily limit reached');

    const ticket = await this.ticketRepo.create(dto);

    await this.ticketQueue.add('hold-expire', { ticketId: ticket.id }, { delay: 15 * 60 * 1000 });

    const momoResponse = await this.momoService.createPayment(ticket.id, price);

    return {
      message: 'Ticket booked. Please complete payment.',
      ticket,
      momo: momoResponse,
    };
  }

  // XỬ LÝ REDIRECT TỪ MOMO
  async handleMomoRedirect(query: any) {
    const { resultCode, orderId } = query;

    if (resultCode !== '0') {
      return { success: false, message: 'Payment failed' };
    }

    const match = orderId?.match(/^TICKET_(\d+)_\d+$/);
    if (!match) throw new BadRequestException('Invalid orderId');

    const ticketId = Number(match[1]);
    await this.payTicket(ticketId);

    return { success: true, ticketId, redirectTo: '/payment-success' };
  }

  // IPN (nếu MoMo gửi)
  async handleMomoCallback(data: any) {
    const isSandbox = process.env.MOMO_ENV === 'sandbox';
    if (!isSandbox && !this.momoService.verifySignature(data)) {
      throw new BadRequestException('Invalid MoMo signature');
    }

    if (data.resultCode !== 0) {
      return { success: false, message: data.message || 'Payment failed' };
    }

    const match = data.orderId.match(/^TICKET_(\d+)_\d+$/);
    if (!match) throw new BadRequestException('Invalid orderId format');

    const ticketId = Number(match[1]);
    await this.payTicket(ticketId);

    return { success: true, ticketId };
  }

  async payTicket(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === TicketStatus.PAID) throw new BadRequestException('Already paid');

    const schedule = await this.prisma.schedule.findUnique({ where: { id: ticket.scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / (1000 * 3600);
    if (diffHours < 1) throw new BadRequestException('Too close to departure');

    await this.prisma.$transaction([
      this.ticketRepo.update(id, { status: TicketStatus.PAID }),
      this.prisma.seat.update({ where: { id: ticket.seatId }, data: { isAvailable: false } }),
    ]);

    const jobs = await this.ticketQueue.getDelayed();
    for (const job of jobs) {
      if (job.data.ticketId === id) await job.remove();
    }

    this.logger.log(`Ticket #${id} paid successfully via MoMo.`);
    return { message: 'Payment successful', ticketId: id };
  }

  async cancel(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const schedule = await this.prisma.schedule.findUnique({ where: { id: ticket.scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / (1000 * 3600);
    if (diffHours < 2) throw new BadRequestException('Too close to departure');

    await this.prisma.$transaction([
      this.ticketRepo.update(id, { status: TicketStatus.CANCELLED }),
      this.prisma.seat.update({ where: { id: ticket.seatId }, data: { isAvailable: true } }),
    ]);

    this.logger.log(`Ticket #${id} cancelled.`);
    return { message: 'Cancelled', ticketId: id };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }

  async getStatus(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
}