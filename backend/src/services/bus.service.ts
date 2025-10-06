import { Injectable } from '@nestjs/common';
import { BusRepository } from '../repositories/bus.repository';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';

@Injectable()
export class BusService {
  constructor(private readonly busRepo: BusRepository) {}

  // ✅ Lấy danh sách tất cả xe buýt
  async findAll() {
    return this.busRepo.findAll();
  }

  // ✅ Lấy chi tiết 1 xe buýt theo ID
  async findOne(id: number) {
    return this.busRepo.findById(id);
  }

  // ✅ Tạo mới 1 xe buýt
  async create(dto: CreateBusDto) {
    return this.busRepo.create({
      name: dto.name,
      licensePlate: dto.licensePlate,
      seatCount: dto.seatCount,
      type: dto.type,
      brandId: dto.brandId,
    });
  }

  // ✅ Cập nhật xe buýt
  async update(id: number, dto: UpdateBusDto) {
    return this.busRepo.update(id, {
      name: dto.name,
      licensePlate: dto.licensePlate,
      seatCount: dto.seatCount,
      type: dto.type,
      brandId: dto.brandId,
    });
  }

  // ✅ Xóa xe buýt
  async delete(id: number) {
    return this.busRepo.delete(id);
  }
}
