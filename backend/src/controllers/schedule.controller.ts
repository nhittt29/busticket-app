// src/schedules/controllers/schedule.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  NotFoundException,
  Query,
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

  // TÌM KIẾM THEO NƠI ĐI, NƠI ĐẾN, NGÀY
  @Get()
  findAll(
    @Query('startPoint') startPoint?: string,
    @Query('endPoint') endPoint?: string,
    @Query('date') date?: string,
  ) {
    return this.scheduleService.getAllSchedules({ startPoint, endPoint, date });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.getScheduleById(Number(id));
  }

  // LẤY GHẾ THEO SCHEDULE
  @Get(':id/seats/by-schedule')
  getSeatsBySchedule(@Param('id') id: string) {
    return this.scheduleService.getSeats(Number(id));
  }

  // XÓA SCHEDULE
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.scheduleService.deleteSchedule(Number(id));
    return { message: 'Xóa lịch trình thành công', data: deleted };
  }
}