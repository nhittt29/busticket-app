import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/Route.entity';

@Injectable()
export class RouteRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
  ) { }

  // LẤY DANH SÁCH TẤT CẢ TUYẾN ĐƯỜNG KÈM THÔNG TIN NHÀ XE
  async findAll() {
    return this.routeRepo.find({
      relations: ['brand'],
      order: { id: 'ASC' },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT TUYẾN ĐƯỜNG
  async findById(id: number) {
    return this.routeRepo.findOne({
      where: { id },
      relations: ['brand'],
    });
  }

  // TẠO MỚI MỘT TUYẾN ĐƯỜNG
  async create(data: any) { // Type matching Prisma Input strictly is hard, using any/partial
    const route = this.routeRepo.create(data);
    return this.routeRepo.save(route);
  }

  // CẬP NHẬT THÔNG TIN TUYẾN ĐƯỜNG
  async update(id: number, data: any) {
    await this.routeRepo.update(id, data);
    return this.findById(id);
  }

  // XÓA TUYẾN ĐƯỜNG
  async delete(id: number) {
    await this.routeRepo.delete(id);
    return { id };
  }
}