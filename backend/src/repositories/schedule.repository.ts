// src/schedules/repositories/schedule.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSchedule(dto: any) {
    return this.prisma.schedule.create({
      data: {
        busId: dto.busId,
        routeId: dto.routeId,
        departureAt: dto.departureAt,
        arrivalAt: dto.arrivalAt,
        status: dto.status || 'UPCOMING',
      },
    });
  }

  // LỌC CHÍNH XÁC: NƠI ĐI, NƠI ĐẾN, NGÀY
  async getAllSchedules(query?: {
    startPoint?: string;
    endPoint?: string;
    date?: string;
  }) {
    const where: any = { AND: [] };

    if (query?.startPoint) {
      where.AND.push({
        route: {
          startPoint: {
            contains: query.startPoint,
            mode: 'insensitive',
          },
        },
      });
    }

    if (query?.endPoint) {
      where.AND.push({
        route: {
          endPoint: {
            contains: query.endPoint,
            mode: 'insensitive',
          },
        },
      });
    }

    if (query?.date) {
      const startOfDay = new Date(query.date);
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      where.AND.push({
        departureAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    return this.prisma.schedule.findMany({
      where,
      include: {
        bus: {
          include: { brand: true },
        },
        route: true,
      },
      orderBy: { departureAt: 'asc' },
    });
  }

  async getScheduleById(id: number) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: {
        bus: true,
        route: true,
      },
    });
  }

  async getSeatsBySchedule(scheduleId: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        bus: {
          include: { seats: true },
        },
        tickets: true,
      },
    });

    if (!schedule) return null;

    return schedule.bus.seats.map(seat => ({
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      code: seat.code,
      isBooked: schedule.tickets.some(t => t.seatId === seat.id),
    }));
  }

  async deleteTicketsByScheduleId(scheduleId: number) {
    return this.prisma.ticket.deleteMany({
      where: { scheduleId },
    });
  }

  async deleteSchedule(id: number) {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}