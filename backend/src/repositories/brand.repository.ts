import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/Brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) { }

  // LẤY DANH SÁCH TẤT CẢ NHÀ XE KÈM DANH SÁCH XE
  async findAll() {
    return this.brandRepo.find({
      relations: ['buses'],
      order: { id: 'ASC' },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT NHÀ XE THEO ID
  async findOne(id: number) {
    return this.brandRepo.findOne({
      where: { id },
      relations: ['buses'],
    });
  }

  // TẠO MỚI MỘT NHÀ XE
  async create(data: CreateBrandDto) {
    const brand = this.brandRepo.create(data);
    return this.brandRepo.save(brand);
  }

  // CẬP NHẬT THÔNG TIN NHÀ XE
  async update(id: number, data: UpdateBrandDto) {
    await this.brandRepo.update(id, data);
    return this.findOne(id);
  }

  // XÓA NHÀ XE
  async delete(id: number) {
    await this.brandRepo.delete(id);
    return { id };
  }
}