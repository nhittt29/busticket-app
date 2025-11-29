import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { RouteService } from '../services/route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) { }

  // LẤY DANH SÁCH TẤT CẢ TUYẾN ĐƯỜNG TRONG HỆ THỐNG
  @Get()
  async findAll() {
    return this.routeService.getAllRoutes();
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT TUYẾN ĐƯỜNG THEO ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.getRouteById(id);
  }

  // TẠO MỚI MỘT TUYẾN ĐƯỜNG (ĐIỂM ĐI → ĐIỂM ĐẾN, KHOẢNG CÁCH, GIÁ VÉ...)
  @Post()
  async create(@Body() body: any) {
    return this.routeService.createRoute(body);
  }

  // CẬP NHẬT THÔNG TIN TUYẾN ĐƯỜNG (GIÁ, THỜI GIAN ƯỚC TÍNH, TRẠNG THÁI...)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.routeService.updateRoute(id, body);
  }

  // XÓA TUYẾN ĐƯỜNG KHỎI HỆ THỐNG (SOFT DELETE HOẶC HARD DELETE TÙY SERVICE)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.deleteRoute(id);
  }
}