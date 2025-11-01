// src/repositories/seat.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class SeatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSeatsByScheduleId(scheduleId: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        busId: true,
        bus: {
          select: {
            name: true,
            seatType: true,
            seatCount: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new Error(`Không tìm thấy lịch trình với ID ${scheduleId}`);
    }

    const seats = await this.prisma.seat.findMany({
      where: { busId: schedule.busId },
      include: {
        tickets: {
          where: { scheduleId: schedule.id },
          select: { id: true },
        },
      },
    });

    return {
      scheduleId: schedule.id,
      busId: schedule.busId,
      busName: schedule.bus.name,
      seatType: schedule.bus.seatType,
      totalSeats: schedule.bus.seatCount,
      seats: seats.map(seat => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        code: seat.code,
        isAvailable: seat.tickets.length === 0,
        price: seat.price,
        floor: seat.floor ?? undefined,
        roomType: seat.roomType ?? undefined,
      })),
    };
  }
}