import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';

@Injectable()
export class BusRepository {
  constructor(private readonly prisma: PrismaService) { }

  // LẤY DANH SÁCH TẤT CẢ XE BUÝT KÈM THÔNG TIN HÃNG, LỊCH TRÌNH VÀ GHẾ
  findAll() {
    return this.prisma.bus.findMany({
      include: {
        brand: true,
        schedules: true,
        seats: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT XE BUÝT THEO ID (BAO GỒM HÃNG, LỊCH CHẠY, DANH SÁCH GHẾ)
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

  // TẠO MỚI MỘT XE BUÝT + TỰ ĐỘNG TẠO ĐỦ GHẾ THEO LOẠI XE (GIƯỜNG NẰM / GHẾ NGỒI)
  async create(data: CreateBusDto) {
    // Bước 1: Tạo xe
    const bus = await this.prisma.bus.create({
      data: {
        name: data.name,
        licensePlate: data.licensePlate,
        seatCount: data.seatCount,
        category: data.category,
        seatType: data.seatType,
        berthType: data.berthType,
        brandId: data.brandId,
      },
    });

    // Bước 2: Tạo ghế với giá do bạn gán
    const seatsData = Array.from({ length: data.seatCount }).map((_, i) => {
      const seatNum = i + 1;
      let floor: number | null = null;
      let roomType: 'SINGLE' | 'DOUBLE' | null = null;

      if (data.seatType === 'BERTH') {
        const isUpper = seatNum % 2 === 0;
        floor = isUpper ? 2 : 1;
        roomType = data.berthType === 'SINGLE' ? 'SINGLE' : 'DOUBLE';
      }

      return {
        seatNumber: seatNum,
        code: `BUS${bus.id}-${String(seatNum).padStart(2, '0')}`,
        busId: bus.id,
        price: data.price,
        floor,
        roomType,
      };
    });

    await this.prisma.seat.createMany({ data: seatsData });
    return this.findById(bus.id);
  }

  // CẬP NHẬT THÔNG TIN XE BUÝT (TÊN, BIỂN SỐ, LOẠI GHẾ, HÃNG XE...)
  update(id: number, data: UpdateBusDto) {
    return this.prisma.bus.update({
      where: { id },
      data,
    });
  }

  // XÓA XE BUÝT KHỎI HỆ THỐNG (SẼ XÓA CẢ GHẾ VÀ LỊCH TRÌNH LIÊN QUAN - DÙNG CẨN THẬN)
  delete(id: number) {
    return this.prisma.bus.delete({
      where: { id },
    });
  }
}