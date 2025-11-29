import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepository) { }

  // LẤY DANH SÁCH TẤT CẢ NHÀ XE / HÃNG XE TRONG HỆ THỐNG
  findAll() {
    return this.brandRepo.findAll();
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT NHÀ XE THEO ID – NÉM LỖI 404 NẾU KHÔNG TỒN TẠI
  async findOne(id: number) {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  // TẠO MỚI MỘT NHÀ XE / HÃNG XE (DÙNG TRONG ADMIN)
  create(dto: CreateBrandDto) {
    return this.brandRepo.create(dto);
  }

  // CẬP NHẬT THÔNG TIN NHÀ XE (TÊN, LOGO, THÔNG TIN LIÊN HỆ, MÔ TẢ...)
  update(id: number, dto: UpdateBrandDto) {
    return this.brandRepo.update(id, dto);
  }

  // XÓA NHÀ XE KHỎI HỆ THỐNG (CẨN THẬN – SẼ ẢNH HƯỞNG ĐẾN XE VÀ LỊCH TRÌNH)
  delete(id: number) {
    return this.brandRepo.delete(id);
  }
}