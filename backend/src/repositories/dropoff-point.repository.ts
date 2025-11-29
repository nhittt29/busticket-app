// src/repositories/dropoff-point.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DropoffPointRepository {
  constructor(private readonly prisma: PrismaService) { }

  // LẤY DANH SÁCH ĐIỂM TRẢ KHÁCH CỦA MỘT CHUYẾN XE - SẮP XẾP THEO THỨ TỰ DỪNG
  async findManyByScheduleId(scheduleId: number) {
    return this.prisma.dropoffPoint.findMany({
      where: { scheduleId },
      orderBy: { order: 'asc' },
    });
  }

  // TẠO MỚI MỘT ĐIỂM TRẢ KHÁCH CHO CHUYẾN XE
  async create(data: Prisma.DropoffPointCreateInput) {
    return this.prisma.dropoffPoint.create({ data });
  }

  // CẬP NHẬT THÔNG TIN ĐIỂM TRẢ KHÁCH (ĐỊA ĐIỂM, GIỜ DỰ KIẾN, GHI CHÚ, THỨ TỰ DỪNG)
  async update(id: number, data: Prisma.DropoffPointUpdateInput) {
    return this.prisma.dropoffPoint.update({
      where: { id },
      data,
    });
  }

  // XÓA ĐIỂM TRẢ KHÁCH KHỎI CHUYẾN XE
  async delete(id: number) {
    return this.prisma.dropoffPoint.delete({ where: { id } });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT ĐIỂM TRẢ KHÁCH KÈM DANH SÁCH VÉ ĐÃ CHỌN ĐIỂM NÀY
  async findUnique(id: number) {
    return this.prisma.dropoffPoint.findUnique({
      where: { id },
      include: { tickets: true },
    });
  }

  // BỎ CHỌN TẤT CẢ ĐIỂM TRẢ MẶC ĐỊNH CỦA CHUYẾN XE (DÙNG KHI SET ĐIỂM MỚI LÀM MẶC ĐỊNH)
  async resetDefault(scheduleId: number) {
    await this.prisma.dropoffPoint.updateMany({
      where: { scheduleId },
      data: { isDefault: false },
    });
  }
}