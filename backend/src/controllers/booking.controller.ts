// src/controllers/booking.controller.ts
import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { ReminderInfoDto } from '../dtos/reminder-info.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('reminder-info/:scheduleId')
  async getReminderInfo(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ): Promise<ReminderInfoDto> {
    return this.bookingService.getReminderInfo(scheduleId);
  }
}