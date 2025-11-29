// src/controllers/dropoff-point.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { DropoffPointService } from '../services/dropoff-point.service';
import { CreateDropoffPointDto, UpdateDropoffPointDto } from '../dtos/dropoff-point.dto';

@Controller('schedules')
export class DropoffPointController {
  constructor(private readonly service: DropoffPointService) { }

  // LẤY DANH SÁCH ĐIỂM TRẢ KHÁCH CỦA MỘT CHUYẾN XE
  @Get(':id/dropoff-points')
  async getDropoffPoints(@Param('id', ParseIntPipe) scheduleId: number) {
    return this.service.getByScheduleId(scheduleId);
  }

  // THÊM ĐIỂM TRẢ KHÁCH MỚI CHO MỘT CHUYẾN XE
  @Post(':id/dropoff-points')
  @HttpCode(201)
  async create(
    @Param('id', ParseIntPipe) scheduleId: number,
    @Body() dto: CreateDropoffPointDto,
  ) {
    return this.service.create(scheduleId, dto);
  }

  // CẬP NHẬT THÔNG TIN ĐIỂM TRẢ KHÁCH (ĐỊA CHỈ, GIỜ DỰ KIẾN, GHI CHÚ...)
  @Patch('dropoff-points/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDropoffPointDto,
  ) {
    return this.service.update(id, dto);
  }

  // XÓA ĐIỂM TRẢ KHÁCH KHỎI CHUYẾN XE
  @Delete('dropoff-points/:id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return null;
  }
}