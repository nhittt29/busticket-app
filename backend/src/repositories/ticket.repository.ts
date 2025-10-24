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
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  findByUserInDay(userId: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.ticket.count({
      where: {
        userId,
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });
  }

  findBySeat(scheduleId: number, seatId: number) {
    return this.prisma.ticket.findFirst({
      where: { scheduleId, seatId },
    });
  }

  countBrandSoldInDay(brandId: number) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.ticket.count({
      where: {
        schedule: {
          bus: { brandId },
        },
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });
  }
}
