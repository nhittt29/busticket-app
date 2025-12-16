// src/services/booking.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ReminderInfoDto } from '../dtos/reminder-info.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(private prisma: PrismaService) { }


  // LẤY THÔNG TIN NHẮC NHỞ KHÁCH HÀNG TRƯỚC GIỜ XE CHẠY (DÙNG CHO SMS / ZALO OA / PUSH NOTIFICATION)
  async getReminderInfo(scheduleId: number): Promise<ReminderInfoDto> {
    // Add logging as requested (approximately, since this is triggered by API, not a processor)
    // Using console.log or Logger if available. Since this file doesn't have Logger injected, I'll use console.log or simple logic.
    // However, to strictly follow "like this" format, I should probably inject Logger.
    // But for now, let's just implement the logic.

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

    if (schedule) {
      this.logger.log(`[Departure Reminder] Frontend requested info for Schedule #${scheduleId} to schedule notification. Bus: ${schedule.bus.name}, Departs: ${schedule.departureAt}`);
    }


    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    return {
      departureAt: schedule.departureAt.toISOString(),
      arrivalAt: schedule.arrivalAt.toISOString(),
      busName: schedule.bus.name,
      from: schedule.route.startPoint,
      to: schedule.route.endPoint,
      seatNumbers: schedule.tickets.map((t) =>
        t.seat.seatNumber.toString().padStart(2, '0'),
      ),
    };
  }
}
