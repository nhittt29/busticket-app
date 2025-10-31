// src/schedules/controllers/schedule.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { CreateScheduleDto } from '../dtos/schedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.createSchedule(dto);
  }

  @Get()
  findAll() {
    return this.scheduleService.getAllSchedules();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.getScheduleById(Number(id));
  }

  @Get(':id/seats')
  getSeats(@Param('id') id: string) {
    return this.scheduleService.getSeats(Number(id));
  }

  // XÓA SCHEDULE
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.scheduleService.deleteSchedule(Number(id));
    return { message: 'Xóa lịch trình thành công', data: deleted };
  }
}