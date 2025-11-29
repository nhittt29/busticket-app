import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';

@Injectable()
export class RouteService {
  constructor(private readonly routeRepo: RouteRepository) { }

  // LẤY DANH SÁCH TẤT CẢ TUYẾN ĐƯỜNG TRONG HỆ THỐNG (ADMIN + PUBLIC)
  async getAllRoutes() {
    return this.routeRepo.findAll();
  }

  // LẤY CHI TIẾT MỘT TUYẾN ĐƯỜNG THEO ID – NÉM LỖI 404 NẾU KHÔNG TỒN TẠI
  async getRouteById(id: number) {
    const route = await this.routeRepo.findById(id);
    if (!route) throw new NotFoundException(`Route #${id} not found`);
    return route;
  }

  // TẠO MỚI MỘT TUYẾN ĐƯỜNG (ĐIỂM ĐI → ĐIỂM ĐẾN, GIÁ, THỜI GIAN, NHÀ XE QUẢN LÝ)
  async createRoute(data: any) {
    return this.routeRepo.create(data);
  }

  // CẬP NHẬT TUYẾN ĐƯỜNG – TỰ ĐỘNG KIỂM TRA TỒN TẠI TRƯỚC KHI UPDATE
  async updateRoute(id: number, data: any) {
    await this.getRouteById(id); // check tồn tại
    return this.routeRepo.update(id, data);
  }

  // XÓA TUYẾN ĐƯỜNG – TỰ ĐỘNG KIỂM TRA TỒN TẠI TRƯỚC KHI XÓA (AN TOÀN DỮ LIỆU)
  async deleteRoute(id: number) {
    await this.getRouteById(id);
    return this.routeRepo.delete(id);
  }
}