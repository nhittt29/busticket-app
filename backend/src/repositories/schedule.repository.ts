import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ScheduleStatus } from '@prisma/client';

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

  // LỌC CHÍNH XÁC: NƠI ĐI, NƠI ĐẾN, NGÀY (DD/MM/YYYY) + CHỈ HIỆN CHUYẾN CHƯA CHẠY
  // + XỬ LÝ MÚI GIỜ +07:00 & CHUYẾN ĐÊM (23:30 hôm nay → hiện ngày mai)
  async getAllSchedules(query?: {
    startPoint?: string;
    endPoint?: string;
    date?: string;
  }) {
    const where: any = { AND: [] };
    const now = new Date(); // LẤY THỜI GIAN HIỆN TẠI (UTC)

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
      // CHUẨN HÓA DD/MM/YYYY → YYYY-MM-DD + MÚI GIỜ +07:00
      const [day, month, year] = query.date.split('/');
      const localDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+07:00`);

      const startOfDay = new Date(localDate);
      startOfDay.setHours(0, 0, 0, 0);

      // CHO PHÉP CHUYẾN ĐÊM: +48 GIỜ ĐỂ BAO QUÁT 23:30 HÔM QUA
      const endOfDay = new Date(localDate);
      endOfDay.setHours(47, 59, 59, 999); // 00:00 ngày search → 23:59 ngày kế tiếp

      where.AND.push({
        departureAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    // MỚI: CHỈ HIỆN CHUYẾN CHƯA CHẠY (departureAt > now)
    where.AND.push({
      departureAt: {
        gt: now, // ẨN TẤT CẢ CHUYẾN ĐÃ CHẠY
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

  // MỚI: CẬP NHẬT TRẠNG THÁI SCHEDULE
  async updateScheduleStatus(scheduleId: number, status: ScheduleStatus) {
    return this.prisma.schedule.update({
      where: { id: scheduleId },
      data: { status },
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