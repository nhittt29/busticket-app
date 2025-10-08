import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';

@Injectable()
export class BusRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 Lấy tất cả xe buýt (kèm Brand & Schedule)
  findAll() {
    return this.prisma.bus.findMany({
      include: {
        brand: true,      // ✅ Lấy thông tin nhà xe
        schedules: true,  // ✅ Lấy danh sách chuyến chạy
      },
    });
  }

  // 🔹 Lấy chi tiết 1 xe buýt
  findById(id: number) {
    return this.prisma.bus.findUnique({
      where: { id },
      include: {
        brand: true,
        schedules: true,
      },
    });
  }

  // 🔹 Tạo mới 1 xe buýt
  create(data: CreateBusDto) {
    return this.prisma.bus.create({
      data,
    });
  }

  // 🔹 Cập nhật xe buýt
  update(id: number, data: UpdateBusDto) {
    return this.prisma.bus.update({
      where: { id },
      data,
    });
  }

  // 🔹 Xóa xe buýt
  delete(id: number) {
    return this.prisma.bus.delete({
      where: { id },
    });
  }
}
