import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepository) {}

  findAll() {
    return this.brandRepo.findAll();
  }

  findOne(id: number) {
    const brand = this.brandRepo.findOne(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  create(dto: CreateBrandDto) {
    return this.brandRepo.create(dto);
  }

  update(id: number, dto: UpdateBrandDto) {
    return this.brandRepo.update(id, dto);
  }

  delete(id: number) {
    return this.brandRepo.delete(id);
  }
}
