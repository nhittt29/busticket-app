import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { TicketStatus } from '../models/Ticket';

@Injectable()
export class TicketRepository {
  constructor(private prisma: PrismaService) {}

  create(data: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        ...data,
        status: TicketStatus.BOOKED,
      },
    });
  }

  findById(id: number) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: { seat: true },
    });
  }

  update(id: number, data: any) {
    return this.prisma.ticket.update({
      where: { id },
      data,
    });
  }

  checkSeatBooked(scheduleId: number, seatId: number) {
    return this.prisma.ticket.findFirst({
      where: {
        scheduleId,
        seatId,
        status: { in: [TicketStatus.BOOKED, TicketStatus.PAID] },
      },
    });
  }

  findUserBookedToday(userId: number) {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return this.prisma.ticket.count({
      where: { userId, createdAt: { gte: start, lt: end } },
    });
  }

  getTicketsByUser(userId: number) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: { schedule: true, seat: true },
    });
  }

  countBrandSoldToday(brandId: number) {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return this.prisma.ticket.count({
      where: {
        schedule: { bus: { brandId } },
        createdAt: { gte: start, lt: end },
      },
    });
  }
}
