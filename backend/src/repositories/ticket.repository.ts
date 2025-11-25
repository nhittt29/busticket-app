// src/repositories/ticket.repository.ts
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
        userId: data.userId,
        scheduleId: data.scheduleId,
        seatId: data.seatId,
        price: data.price,
        status: TicketStatus.BOOKED,
        paymentMethod: data.paymentMethod,
        // ĐÃ XÓA bulkTicketId
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
      include: {
        schedule: { include: { route: true } },
        seat: true,
        paymentHistory: true,
        dropoffPoint: true,     // ĐÚNG – relation tới bảng DropoffPoint
        // dropoffAddress: true, // SAI – đây là field string trong bảng ticket, KHÔNG PHẢI relation → ĐÃ XÓA
      },
      orderBy: { createdAt: 'desc' },
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