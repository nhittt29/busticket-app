import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepository) { }

  // LẤY DANH SÁCH TẤT CẢ NHÀ XE
  findAll() {
    return this.brandRepo.findAll();
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT NHÀ XE THEO ID
  async findOne(id: number) {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  // TẠO MỚI MỘT NHÀ XE
  create(dto: CreateBrandDto) {
    return this.brandRepo.create(dto);
  }

  // CẬP NHẬT THÔNG TIN NHÀ XE
  update(id: number, dto: UpdateBrandDto) {
    return this.brandRepo.update(id, dto);
  }

  // XÓA NHÀ XE
  delete(id: number) {
    return this.brandRepo.delete(id);
  }
}