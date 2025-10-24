import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateTicketDto } from '../dtos/ticket.dto';

@Injectable()
export class TicketRepository {
  constructor(private prisma: PrismaService) {}

  create(data: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        userId: data.userId,
        scheduleId: data.scheduleId,
        seatId: data.seatId,
        price: data.price,
      },
    });
  }

  delete(id: number) {
    return this.prisma.ticket.delete({ where: { id } });
  }

  findById(id: number) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: { seat: true }
    });
  }

  findByUserInDay(userId: number, date: Date) {
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    return this.prisma.ticket.count({
      where: {
        userId,
        createdAt: { gte: start, lt: end },
      },
    });
  }

  findBySeat(scheduleId: number, seatId: number) {
    return this.prisma.ticket.findFirst({
      where: { scheduleId, seatId },
    });
  }

  getTicketsByUser(userId: number) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: { schedule: true, seat: true },
    });
  }

  countBrandSoldInDay(brandId: number) {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return this.prisma.ticket.count({
      where: {
        schedule: {
          bus: { brandId },
        },
        createdAt: { gte: start, lt: end },
      },
    });
  }
}
