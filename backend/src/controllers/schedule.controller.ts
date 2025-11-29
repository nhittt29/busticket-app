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

  // TÌM KIẾM CHUYẾN XE CHO KHÁCH HÀNG: THEO ĐIỂM ĐI - ĐIỂM ĐẾN - NGÀY (DÙNG CHO KHÁCH HÀNG ĐẶT VÉ)
  @Get()
  findAll(
    @Query('startPoint') startPoint?: string,
    @Query('endPoint') endPoint?: string,
    @Query('date') date?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('busType') busType?: string,
    @Query('brandId') brandId?: number,
    @Query('dropoffPoint') dropoffPoint?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.scheduleService.getAllSchedules({
      startPoint,
      endPoint,
      date,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      startTime,
      endTime,
      busType,
      brandId: brandId ? Number(brandId) : undefined,
      dropoffPoint,
      sortBy,
    });
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