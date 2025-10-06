import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { BusType } from '@prisma/client';

@Injectable()
export class BusRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.bus.findMany({
      include: { brand: true }, // ✅ lấy luôn brand name
    });
  }

  findById(id: number) {
    return this.prisma.bus.findUnique({
      where: { id },
      include: { brand: true },
    });
  }

  create(data: {
    name: string;
    licensePlate: string;
    seatCount: number;
    type: BusType;
    brandId: number;
  }) {
    return this.prisma.bus.create({ data });
  }

  update(
    id: number,
    data: Partial<{
      name: string;
      licensePlate: string;
      seatCount: number;
      type: BusType;
      brandId: number;
    }>,
  ) {
    return this.prisma.bus.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return this.prisma.bus.delete({
      where: { id },
    });
  }
}
