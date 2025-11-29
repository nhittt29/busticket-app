import { Injectable } from '@nestjs/common';
import { BusRepository } from '../repositories/bus.repository';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class BusService {
  constructor(
    private readonly busRepo: BusRepository,
    private readonly prisma: PrismaService,
  ) { }

  // LẤY DANH SÁCH TẤT CẢ XE BUÝT TRONG HỆ THỐNG (KÈM THÔNG TIN HÃNG, GHẾ, LỊCH TRÌNH)
  async findAll() {
    return this.busRepo.findAll();
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT XE BUÝT THEO ID
  async findOne(id: number) {
    return this.busRepo.findById(id);
  }

  // TẠO MỚI MỘT XE BUÝT + TỰ ĐỘNG TẠO ĐỦ GHẾ THEO LOẠI XE (GIƯỜNG NẰM / GHẾ NGỒI)
  async create(dto: CreateBusDto) {
    return this.busRepo.create(dto);
  }

  // CẬP NHẬT THÔNG TIN XE BUÝT (BIỂN SỐ, LOẠI GHẾ, HÃNG XE, SỐ GHẾ...)
  async update(id: number, dto: UpdateBusDto) {
    return this.busRepo.update(id, dto);
  }

  // XÓA XE BUÝT KHỎI HỆ THỐNG (XÓA CẢ GHẾ VÀ LỊCH TRÌNH LIÊN QUAN – DÙNG CẨN THẬN)
  async delete(id: number) {
    return this.busRepo.delete(id);
  }

  // LẤY DANH SÁCH GHẾ CỦA MỘT XE BUÝT THEO ID (DÙNG CHO QUẢN LÝ XE HOẶC DEBUG)
  async getSeatsByBus(busId: number) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
      include: { seats: true },
    });

    if (!bus) {
      throw new Error(`Không tìm thấy xe có id = ${busId}`);
    }

    return {
      busId: bus.id,
      busName: bus.name,
      licensePlate: bus.licensePlate,
      category: bus.category,
      seatType: bus.seatType,
      totalSeats: bus.seatCount,
      seats: bus.seats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        code: s.code,
        isAvailable: s.isAvailable,
      })),
    };
  }
}