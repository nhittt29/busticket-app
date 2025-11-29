import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RouteRepository {
  constructor(private readonly prisma: PrismaService) { }

  // LẤY DANH SÁCH TẤT CẢ TUYẾN ĐƯỜNG KÈM THÔNG TIN NHÀ XE/HÃNG XE QUẢN LÝ
  async findAll() {
    return this.prisma.route.findMany({
      include: { brand: true },
      orderBy: { id: 'asc' },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT TUYẾN ĐƯỜNG THEO ID (BAO GỒM NHÀ XE QUẢN LÝ)
  async findById(id: number) {
    return this.prisma.route.findUnique({
      where: { id },
      include: { brand: true },
    });
  }

  // TẠO MỚI MỘT TUYẾN ĐƯỜNG (ĐIỂM ĐI → ĐIỂM ĐẾN, KHOẢNG CÁCH, THỜI GIAN, GIÁ VÉ, HÃNG XE)
  async create(data: Prisma.RouteCreateInput) {
    return this.prisma.route.create({ data });
  }

  // CẬP NHẬT THÔNG TIN TUYẾN ĐƯỜNG (GIÁ VÉ, THỜI GIAN ƯỚC TÍNH, TRẠNG THÁI, HÃNG XE...)
  async update(id: number, data: Prisma.RouteUpdateInput) {
    return this.prisma.route.update({
      where: { id },
      data,
    });
  }

  // XÓA TUYẾN ĐƯỜNG KHỎI HỆ THỐNG (CẨN THẬN - SẼ ẢNH HƯỞNG ĐẾN CÁC CHUYẾN XE ĐÃ TẠO)
  async delete(id: number) {
    return this.prisma.route.delete({
      where: { id },
    });
  }
}