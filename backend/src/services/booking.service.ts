// src/services/booking.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ReminderInfoDto } from '../dtos/reminder-info.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  // Các hàm cũ của bạn...

  async getReminderInfo(scheduleId: number): Promise<ReminderInfoDto> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        bus: {
          select: { name: true },
        },
        route: {
          select: { startPoint: true, endPoint: true },
        },
        tickets: {
          where: { status: 'PAID' }, // chỉ lấy vé đã thanh toán
          select: {
            seat: {
              select: {
                seatNumber: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    return {
      departureAt: schedule.departureAt.toISOString(),
      busName: schedule.bus.name,
      from: schedule.route.startPoint,
      to: schedule.route.endPoint,
      seatNumbers: schedule.tickets.map((t) =>
        t.seat.seatNumber.toString().padStart(2, '0'),
      ),
    };
  }
}