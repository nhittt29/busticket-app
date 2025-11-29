import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandRepository {
  constructor(private prisma: PrismaService) { }

  // LẤY DANH SÁCH TẤT CẢ NHÀ XE / HÃNG XE KÈM DANH SÁCH XE THUỘC HÃNG
  findAll() {
    return this.prisma.brand.findMany({
      include: { buses: true },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT NHÀ XE THEO ID, BAO GỒM TẤT CẢ XE THUỘC HÃNG
  findOne(id: number) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: { buses: true },
    });
  }

  // TẠO MỚI MỘT NHÀ XE / HÃNG XE TRONG HỆ THỐNG
  create(data: CreateBrandDto) {
    return this.prisma.brand.create({
      data,
    });
  }

  // CẬP NHẬT THÔNG TIN NHÀ XE (TÊN, LOGO, MÔ TẢ, LIÊN HỆ...)
  update(id: number, data: UpdateBrandDto) {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  // XÓA NHÀ XE KHỎI HỆ THỐNG (HARD DELETE - CẨN THẬN KHI DÙNG)
  delete(id: number) {
    return this.prisma.brand.delete({ where: { id } });
  }
}