import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { CreateScheduleDto } from '../dtos/schedule.dto';
import { ScheduleStatus } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepo: ScheduleRepository) {}

  async createSchedule(dto: CreateScheduleDto) {
    return this.scheduleRepo.createSchedule(dto);
  }

  async getAllSchedules(query: {
    startPoint?: string;
    endPoint?: string;
    date?: string;
  }) {
    return this.scheduleRepo.getAllSchedules(query);
  }

  async getScheduleById(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  // HOÀN HẢO: Ghế ngồi KHÔNG có floor/roomType + trả thêm thông tin loại xe
  async getSeats(scheduleId: number) {
    const result = await this.scheduleRepo.getSeatsBySchedule(scheduleId);
    if (!result) throw new NotFoundException('Schedule not found');

    const { busCategory, busSeatType, busBerthType, seats, tickets } = result;

    const isSleeperDoubleBerth =
      busCategory === 'SLEEPER' &&
      busSeatType === 'BERTH' &&
      busBerthType === 'DOUBLE';

    // Tách ghế theo tầng để đánh số liên tục (chỉ cho giường nằm)
    const floor1Seats = seats.filter(s => s.floor === 1);
    const floor2Seats = seats.filter(s => s.floor === 2);

    const mappedSeats = seats.map(seat => {
      const isBooked = tickets.some(t => t.seatId === seat.id);

      let displayCode = seat.code; // Mặc định dùng code gốc

      // Chỉ tạo A01/B01 cho xe giường nằm DOUBLE
      if (isSleeperDoubleBerth && seat.floor !== null) {
        if (seat.floor === 1) {
          const order = floor1Seats.indexOf(seat) + 1;
          displayCode = `A${order.toString().padStart(2, '0')}`;
        } else if (seat.floor === 2) {
          const order = floor2Seats.indexOf(seat) + 1;
          displayCode = `B${order.toString().padStart(2, '0')}`;
        }
      }

      // Cơ bản cho mọi loại xe
      const baseSeat = {
        id: seat.id,
        seatNumber: seat.seatNumber,
        code: seat.code,
        displayCode,
        price: Number(seat.price) || 0,
        isBooked,
        isAvailable: !isBooked,
      };

      // CHỈ xe giường nằm DOUBLE mới có floor + roomType
      if (isSleeperDoubleBerth) {
        return {
          ...baseSeat,
          floor: seat.floor,
          roomType: seat.roomType ?? 'DOUBLE',
        };
      }

      // Xe ghế ngồi, limousine, VIP... → KHÔNG có floor, roomType
      return baseSeat;
    });

    // Sắp xếp đẹp: A01 → A17 → B01 → B17
    mappedSeats.sort((a, b) => a.displayCode.localeCompare(b.displayCode));

    // Cập nhật trạng thái chuyến
    const availableCount = mappedSeats.filter(s => s.isAvailable).length;
    const totalSeats = mappedSeats.length;
    let status: ScheduleStatus = ScheduleStatus.UPCOMING;

    if (availableCount === 0) {
      status = ScheduleStatus.FULL;
    } else if (availableCount < totalSeats * 0.3) {
      status = ScheduleStatus.FEW_SEATS;
    }

    await this.scheduleRepo.updateScheduleStatus(scheduleId, status);

    // TRẢ VỀ ĐẦY ĐỦ THÔNG TIN LOẠI XE CHO FRONTEND
    return {
      busCategory,
      busSeatType,
      busBerthType,
      seats: mappedSeats,
    };
  }

  async deleteSchedule(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    await this.scheduleRepo.deleteTicketsByScheduleId(id);
    return this.scheduleRepo.deleteSchedule(id);
  }
}