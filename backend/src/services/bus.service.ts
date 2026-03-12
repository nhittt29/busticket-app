import { Injectable, NotFoundException } from '@nestjs/common';
import { BusRepository } from '../repositories/bus.repository';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';

@Injectable()
export class BusService {
  constructor(
    private readonly busRepo: BusRepository,
  ) { }

  async findAll() {
    return this.busRepo.findAll();
  }

  async findByBrandId(brandId: number) {
    return this.busRepo.findByBrandId(brandId);
  }

  async findOne(id: number) {
    return this.busRepo.findById(id);
  }

  async create(dto: CreateBusDto) {
    return this.busRepo.create(dto);
  }

  async update(id: number, dto: UpdateBusDto) {
    return this.busRepo.update(id, dto);
  }

  async delete(id: number) {
    return this.busRepo.delete(id);
  }

  // LẤY DANH SÁCH GHẾ CỦA MỘT XE BUÝT THEO ID
  async getSeatsByBus(busId: number) {
    // Using Repository findById instead of direct Prisma access
    const bus = await this.busRepo.findById(busId);

    if (!bus) {
      throw new Error(`Không tìm thấy xe có id = ${busId}`);
    }
    // bus.seats should be loaded because findById includes relations

    return {
      busId: bus.id,
      busName: bus.name,
      licensePlate: bus.licensePlate,
      category: bus.category,
      seatType: bus.seatType,
      totalSeats: bus.seatCount,
      seats: (bus.seats || []).map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        code: s.code,
        isAvailable: s.isAvailable,
      })),
    };
  }
}