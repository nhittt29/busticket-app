// src/controllers/seat.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SeatService } from '../services/seat.service';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get('by-schedule/:scheduleId')
  async getSeatsBySchedule(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.seatService.getSeatsBySchedule(scheduleId);
  }
}