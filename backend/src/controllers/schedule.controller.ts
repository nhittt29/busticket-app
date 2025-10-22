import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() dto: any) {
    return this.scheduleService.create(dto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findById(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.scheduleService.update(+id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.scheduleService.delete(+id);
  }
}
