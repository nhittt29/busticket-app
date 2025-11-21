// src/repositories/dropoff-point.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DropoffPointRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByScheduleId(scheduleId: number) {
    return this.prisma.dropoffPoint.findMany({
      where: { scheduleId },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: Prisma.DropoffPointCreateInput) {
    return this.prisma.dropoffPoint.create({ data });
  }

  async update(id: number, data: Prisma.DropoffPointUpdateInput) {
    return this.prisma.dropoffPoint.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.dropoffPoint.delete({ where: { id } });
  }

  async findUnique(id: number) {
    return this.prisma.dropoffPoint.findUnique({
      where: { id },
      include: { tickets: true },
    });
  }

  async resetDefault(scheduleId: number) {
    await this.prisma.dropoffPoint.updateMany({
      where: { scheduleId },
      data: { isDefault: false },
    });
  }
}