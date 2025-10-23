import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateScheduleDto } from '../dtos/schedule.dto';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSchedule(dto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: {
        busId: dto.busId,
        routeId: dto.routeId,
        departureAt: dto.departureAt,
        arrivalAt: dto.arrivalAt,
        status: dto.status || 'UPCOMING',
      },
    });
  }

  async getAllSchedules() {
    return this.prisma.schedule.findMany({
      include: {
        bus: true,
        route: true,
      },
    });
  }

  async getScheduleById(id: number) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: {
        bus: true,
        route: true,
      },
    });
  }
}
