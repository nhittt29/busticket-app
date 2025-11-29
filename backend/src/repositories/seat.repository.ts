// src/repositories/seat.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class SeatRepository {
  constructor(private readonly prisma: PrismaService) { }

  // LẤY DANH SÁCH GHẾ + TRẠNG THÁI CỦA MỘT CHUYẾN XE THEO SCHEDULEID – DÙNG CHO CHỌN GHẾ TRÊN APP/WEB
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

    if (!schedule || !schedule.bus) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    const seats = await this.prisma.seat.findMany({
      where: { busId: schedule.busId },
      select: {
        id: true,
        seatNumber: true,
        code: true,
        price: true,
        floor: true,
        roomType: true,
        tickets: {
          where: { scheduleId: schedule.id },
          select: { id: true },
        },
      },
      // FIX VĨNH VIỄN "GHẾ NHẢY CHỖ" – ORDER TỪ DATABASE!
      orderBy: [
        { floor: 'asc' },        // Tầng dưới trước (1), tầng trên sau (2)
        { seatNumber: 'asc' },   // Số ghế tăng dần: 1, 2, 3... hoặc A1, A2...
      ],
    });

    return {
      scheduleId: schedule.id,
      busId: schedule.busId,
      busName: schedule.bus.name,
      seatType: schedule.bus.seatType,
      totalSeats: schedule.bus.seatCount,
      seats: seats.map(seat => ({
        id: seat.id,
        seatNumber: seat.seatNumber.toString(), // ép về string → an toàn tuyệt đối
        code: seat.code,
        isAvailable: seat.tickets.length === 0,
        price: Number(seat.price),
        floor: seat.floor ?? undefined,
        roomType: seat.roomType ?? undefined,
      })),
    };
  }
}