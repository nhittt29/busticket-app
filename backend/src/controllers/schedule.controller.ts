import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { CreateScheduleDto } from '../dtos/schedule.dto';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  // TẠO MỚI MỘT CHUYẾN XE (LỊCH TRÌNH) TRONG HỆ THỐNG
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.createSchedule(dto);
  }

  // TÌM KIẾM CHUYẾN XE THEO ĐIỂM ĐI - ĐIỂM ĐẾN - NGÀY (DÙNG CHO KHÁCH HÀNG ĐẶT VÉ)
  @Get()
  findAll(
    @Query('startPoint') startPoint?: string,
    @Query('endPoint') endPoint?: string,
    @Query('date') date?: string,
  ) {
    return this.scheduleService.getAllSchedules({ startPoint, endPoint, date });
  }

  // LẤY TOÀN BỘ CHUYẾN XE (KHÔNG LỌC) - DÀNH RIÊNG CHO ADMIN QUẢN LÝ
  @Get('admin')
  findAllForAdmin() {
    return this.scheduleService.getAllSchedulesForAdmin();
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT CHUYẾN XE THEO ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.getScheduleById(Number(id));
  }

  // XÓA CHUYẾN XE KHỎI HỆ THỐNG (ADMIN ONLY - THƯỜNG LÀ SOFT DELETE)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.scheduleService.deleteSchedule(Number(id));
    return { message: 'Xóa lịch trình thành công', data: deleted };
  }
}