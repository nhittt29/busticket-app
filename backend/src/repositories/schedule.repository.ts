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

  async getAllSchedules() {
    return this.prisma.schedule.findMany({
      include: {
        bus: true,
        route: true,
      },
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

  // XÓA TICKETS THEO SCHEDULE
  async deleteTicketsByScheduleId(scheduleId: number) {
    return this.prisma.ticket.deleteMany({
      where: { scheduleId },
    });
  }

  // XÓA SCHEDULE
  async deleteSchedule(id: number) {
    return this.prisma.schedule.delete({
      where: { id },
    });
  }
}