import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';

@Injectable()
export class RouteService {
  constructor(private readonly routeRepo: RouteRepository) { }

  // LẤY DANH SÁCH TẤT CẢ TUYẾN ĐƯỜNG
  async getAllRoutes() {
    return this.routeRepo.findAll();
  }

  // LẤY CHI TIẾT MỘT TUYẾN ĐƯỜNG THEO ID
  async getRouteById(id: number) {
    const route = await this.routeRepo.findById(id);
    if (!route) throw new NotFoundException(`Route #${id} not found`);
    return route;
  }

  // TẠO MỚI MỘT TUYẾN ĐƯỜNG
  async createRoute(data: any) {
    return this.routeRepo.create(data);
  }

  // CẬP NHẬT TUYẾN ĐƯỜNG
  async updateRoute(id: number, data: any) {
    await this.getRouteById(id); // check tồn tại
    return this.routeRepo.update(id, data);
  }

  // XÓA TUYẾN ĐƯỜNG
  async deleteRoute(id: number) {
    await this.getRouteById(id);
    return this.routeRepo.delete(id);
  }
}