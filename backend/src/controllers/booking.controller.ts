// src/controllers/booking.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { ReminderInfoDto } from '../dtos/reminder-info.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  // LẤY THÔNG TIN NHẮC NHỞ KHÁCH HÀNG TRƯỚC GIỜ XE CHẠY (SMS / ZALO OA / PUSH NOTIFICATION / COUNTDOWN)
  @Get('reminder-info/:scheduleId')
  async getReminderInfo(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ): Promise<ReminderInfoDto> {
    return this.bookingService.getReminderInfo(scheduleId);
  }
}