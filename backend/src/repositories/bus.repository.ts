import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from '../entities/Bus.entity';
import { Seat } from '../entities/Seat.entity';
import { CreateBusDto, UpdateBusDto } from '../dtos/bus.dto';

@Injectable()
export class BusRepository {
  constructor(
    @InjectRepository(Bus)
    private readonly busRepo: Repository<Bus>,
    @InjectRepository(Seat)
    private readonly seatRepo: Repository<Seat>,
  ) { }

  // LẤY DANH SÁCH TẤT CẢ XE BUÝT KÈM THÔNG TIN HÃNG, LỊCH TRÌNH VÀ GHẾ
  async findAll() {
    return this.busRepo.find({
      relations: ['brand', 'schedules', 'seats'],
      order: { id: 'ASC' },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT XE BUÝT THEO ID
  async findById(id: number) {
    return this.busRepo.findOne({
      where: { id },
      relations: ['brand', 'schedules', 'seats'],
    });
  }

  // TẠO MỚI MỘT XE BUÝT + TỰ ĐỘNG TẠO ĐỦ GHẾ
  async create(data: CreateBusDto) {
    // Bước 1: Tạo xe
    const bus = this.busRepo.create({
      name: data.name,
      licensePlate: data.licensePlate,
      seatCount: data.seatCount,
      category: data.category,
      seatType: data.seatType,
      berthType: data.berthType,
      brandId: data.brandId,
    });
    const savedBus = await this.busRepo.save(bus);

    // Bước 2: Tạo ghế
    const seatsData = Array.from({ length: data.seatCount }).map((_, i) => {
      const seatNum = i + 1;
      let floor: number | null = null;
      let roomType: string | null = null; // Changed 'SINGLE'|... to string to match Enitity type usually

      if (data.seatType === 'BERTH') {
        const isUpper = seatNum % 2 === 0;
        floor = isUpper ? 2 : 1;
        roomType = data.berthType === 'SINGLE' ? 'SINGLE' : 'DOUBLE';
      }

      return this.seatRepo.create({
        seatNumber: seatNum,
        code: `BUS${savedBus.id}-${String(seatNum).padStart(2, '0')}`,
        busId: savedBus.id,
        price: data.price,
        floor: floor || undefined,
        roomType: roomType || undefined,
      });
    });

    // Save all seats
    await this.seatRepo.save(seatsData);

    return this.findById(savedBus.id);
  }

  // CẬP NHẬT THÔNG TIN XE BUÝT
  async update(id: number, data: UpdateBusDto) {
    await this.busRepo.update(id, data);
    return this.findById(id);
  }

  // XÓA XE BUÝT KHỎI HỆ THỐNG
  async delete(id: number) {
    // Manually delete related seats first (if DB definition doesn't cascade)
    // Assuming Schedules might restrict delete, but repo instruction implies force delete intent or safe delete
    // We will delete seats associated with this bus
    await this.seatRepo.delete({ busId: id });

    // Check if schedules exist? Leaving it to DB foreign key error if exists, matching Prisma behavior usually

    await this.busRepo.delete(id);
    return { id }; // Prisma delete returns the object, TypeORM delete returns result. Return minimal info or check finding it first?
    // Current Prisma logic returned the Deleted Object. 
    // Usually logic just needs confirmation. I'll return { id } or null. 
  }
}