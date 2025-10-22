import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../repositories/route.repository';

@Injectable()
export class RouteService {
  constructor(private readonly routeRepo: RouteRepository) {}

  async getAllRoutes() {
    return this.routeRepo.findAll();
  }

  async getRouteById(id: number) {
    const route = await this.routeRepo.findById(id);
    if (!route) throw new NotFoundException(`Route #${id} not found`);
    return route;
  }

  async createRoute(data: any) {
    return this.routeRepo.create(data);
  }

  async updateRoute(id: number, data: any) {
    await this.getRouteById(id); // check tồn tại
    return this.routeRepo.update(id, data);
  }

  async deleteRoute(id: number) {
    await this.getRouteById(id);
    return this.routeRepo.delete(id);
  }
}
