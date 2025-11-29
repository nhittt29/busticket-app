import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ScheduleStatus } from '@prisma/client';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaService) { }

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

  async getAllSchedules(query?: {
    startPoint?: string;
    endPoint?: string;
    date?: string;
  }) {
    const where: any = { AND: [] };
    const now = new Date();

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
      const [day, month, year] = query.date.split('/');
      const localDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+07:00`);
      const startOfDay = new Date(localDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(localDate);
      endOfDay.setHours(47, 59, 59, 999);

      where.AND.push({
        departureAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    where.AND.push({
      departureAt: {
        gt: now,
      },
    });

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

  async getAllSchedulesForAdmin() {
    return this.prisma.schedule.findMany({
      include: {
        bus: {
          include: { brand: true },
        },
        route: true,
      },
      orderBy: { id: 'asc' },
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