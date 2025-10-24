import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandRepository {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      include: { buses: true },
    });
  }

  findOne(id: number) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: { buses: true },
    });
  }

  create(data: CreateBrandDto) {
    return this.prisma.brand.create({
      data,
    });
  }

  update(id: number, data: UpdateBrandDto) {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
