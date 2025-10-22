import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ScheduleStatus } from '@prisma/client';

@Injectable()
export class ScheduleRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.schedule.create({ data });
  }

  async findAll() {
    return this.prisma.schedule.findMany({
      include: {
        route: { include: { brand: true } },
        bus: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: {
        route: { include: { brand: true } },
        bus: true,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.schedule.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.schedule.delete({ where: { id } });
  }
}
