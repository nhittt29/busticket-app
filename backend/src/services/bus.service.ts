import { Injectable } from '@nestjs/common';
import { BusRepository } from '../repositories/bus.repository';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class BusService {
  constructor(
    private readonly busRepo: BusRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.busRepo.findAll();
  }

  async findOne(id: number) {
    return this.busRepo.findById(id);
  }

  async create(dto: CreateBusDto) {
    return this.busRepo.create(dto);
  }

  async update(id: number, dto: UpdateBusDto) {
    return this.busRepo.update(id, dto);
  }

  async delete(id: number) {
    return this.busRepo.delete(id);
  }

  // ✅ Lấy danh sách ghế theo busId
  async getSeatsByBus(busId: number) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
      include: { seats: true },
    });

    if (!bus) {
      return { message: `Không tìm thấy xe có id = ${busId}` };
    }

    return {
      busId: bus.id,
      busName: bus.name,
      totalSeats: bus.seatCount,
      seats: bus.seats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        code: s.code,
      })),
    };
  }
}
