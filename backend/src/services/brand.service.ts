import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepository) {}

  async findAll() {
    return this.brandRepo.findAll();
  }

  async findOne(id: number) {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    return this.brandRepo.create(dto);
  }

  async update(id: number, dto: UpdateBrandDto) {
    return this.brandRepo.update(id, dto);
  }

  async delete(id: number) {
    return this.brandRepo.delete(id);
  }
}
