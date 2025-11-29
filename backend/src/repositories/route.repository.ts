import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RouteRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.route.findMany({
      include: { brand: true },
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.route.findUnique({
      where: { id },
      include: { brand: true },
    });
  }

  async create(data: Prisma.RouteCreateInput) {
    return this.prisma.route.create({ data });
  }

  async update(id: number, data: Prisma.RouteUpdateInput) {
    return this.prisma.route.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.route.delete({
      where: { id },
    });
  }
}
