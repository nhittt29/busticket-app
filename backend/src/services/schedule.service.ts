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

  // ĐÃ SỬA HOÀN CHỈNH – TRẢ VỀ ĐẦY ĐỦ THÔNG TIN + SẮP XẾP ỔN ĐỊNH
  async getSeats(scheduleId: number) {
    const result = await this.scheduleRepo.getSeatsBySchedule(scheduleId);
    if (!result) throw new NotFoundException('Schedule not found');

    const { seats, tickets } = result;

    const mappedSeats = seats.map(seat => {
      const isBooked = tickets.some(t => t.seatId === seat.id);

      return {
        id: seat.id,
        seatNumber: seat.seatNumber,
        code: seat.code,
        floor: seat.floor ?? 1,
        roomType: seat.roomType ?? 'DOUBLE',
        price: Number(seat.price) || 0,
        isBooked,
        isAvailable: !isBooked,
      };
    });

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

    // ĐÃ SẮP XẾP TỪ DATABASE → TRẢ VỀ NGAY, ỔN ĐỊNH 100%
    return mappedSeats;
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