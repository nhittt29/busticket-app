import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
  findOne(@Param('id') id: number) {
    return this.scheduleService.getScheduleById(Number(id));
  }

  // ✅ API lấy danh sách ghế theo schedule
  @Get(':id/seats')
  getSeats(@Param('id') id: string) {
    return this.scheduleService.getSeats(Number(id));
  }
}
