import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';

@Injectable()
export class BusRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.bus.findMany({
      include: {
        brand: true,
        schedules: true,
        seats: true,
      },
    });
  }

  findById(id: number) {
    return this.prisma.bus.findUnique({
      where: { id },
      include: {
        brand: true,
        schedules: true,
        seats: true,
      },
    });
  }

  async create(data: CreateBusDto) {
    // Bước 1: Tạo xe
    const bus = await this.prisma.bus.create({
      data: {
        name: data.name,
        licensePlate: data.licensePlate,
        seatCount: data.seatCount,
        category: data.category,
        seatType: data.seatType,
        brandId: data.brandId,
      },
    });

    // Bước 2: Tự động tạo ghế
    const seatsData = Array.from({ length: data.seatCount }).map((_, i) => ({
      seatNumber: i + 1,
      code: `BUS${bus.id}-${String(i + 1).padStart(2, '0')}`,
      busId: bus.id,
    }));

    await this.prisma.seat.createMany({ data: seatsData });

    return this.findById(bus.id);
  }

  update(id: number, data: UpdateBusDto) {
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