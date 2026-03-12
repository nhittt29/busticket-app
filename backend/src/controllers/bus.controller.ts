import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { BusService } from '../services/bus.service';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

@Controller('buses')
export class BusController {
  constructor(private readonly busService: BusService) { }

  // LẤY DANH SÁCH TẤT CẢ XE BUÝT TRONG HỆ THỐNG
  @Get()
  getAll() {
    return this.busService.findAll();
  }

  // LẤY DANH SÁCH XE CỦA NHÀ XE ĐANG ĐĂNG NHẬP
  @Get('my-brand')
  @UseGuards(FirebaseAuthGuard)
  getMyBrandBuses(@Req() req: any) {
    const brandId = req.user?.dbUser?.brandId;
    if (!brandId) {
      throw new UnauthorizedException('Người dùng không thuộc nhà xe nào.');
    }
    return this.busService.findByBrandId(brandId);
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT XE BUÝT THEO ID
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.busService.findOne(Number(id));
  }

  // TẠO MỚI MỘT XE BUÝT (THÊM XE VÀO HỆ THỐNG)
  @Post()
  create(@Body() dto: CreateBusDto) {
    return this.busService.create(dto);
  }

  // CẬP NHẬT THÔNG TIN XE BUÝT (BIỂN SỐ, LOẠI XE, SỐ GHẾ, ...)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusDto) {
    return this.busService.update(Number(id), dto);
  }

  // XÓA XE BUÝT KHỎI HỆ THỐNG (SOFT DELETE HOẶC HARD DELETE TÙY SERVICE)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.busService.delete(Number(id));
  }

  // LẤY DANH SÁCH GHẾ CỦA MỘT XE BUÝT THEO ID (DÙNG CHO CHỌN GHẾ, HIỂN THỊ TRẠNG THÁI GHẾ)
  @Get(':id/seats')
  async getSeatsByBus(@Param('id') id: string) {
    return this.busService.getSeatsByBus(Number(id));
  }
}