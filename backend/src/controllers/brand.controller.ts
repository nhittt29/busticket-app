import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BrandService } from '../services/brand.service';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  // LẤY DANH SÁCH TẤT CẢ CÁC NHÀ XE / HÃNG XE
  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT NHÀ XE THEO ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(Number(id));
  }

  // TẠO MỚI MỘT NHÀ XE / HÃNG XE
  @Post()
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  // CẬP NHẬT THÔNG TIN NHÀ XE THEO ID
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(Number(id), dto);
  }

  // XÓA NHÀ XE THEO ID (SOFT DELETE HOẶC HARD DELETE TÙY SERVICE)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.brandService.delete(Number(id));
  }
}