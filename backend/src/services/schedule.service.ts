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

  async getSeats(scheduleId: number) {
    const seats = await this.scheduleRepo.getSeatsBySchedule(scheduleId);
    if (!seats) throw new NotFoundException('Schedule not found');

    // TỰ ĐỘNG TÍNH isAvailable
    const mappedSeats = seats.map(seat => ({
      seatId: seat.seatId,
      seatNumber: seat.seatNumber,
      code: seat.code,
      isBooked: seat.isBooked,
      isAvailable: !seat.isBooked, // TỰ ĐỘNG: nếu đã đặt → false
    }));

    // TỰ ĐỘNG CẬP NHẬT status CHO SCHEDULE
    const availableCount = mappedSeats.filter(s => s.isAvailable).length;
    const totalSeats = mappedSeats.length;

    let status: ScheduleStatus = ScheduleStatus.UPCOMING;
    if (availableCount === 0) {
      status = ScheduleStatus.FULL;
    } else if (availableCount < totalSeats * 0.3) {
      status = ScheduleStatus.FEW_SEATS;
    }

    // CẬP NHẬT VÀO DB
    await this.scheduleRepo.updateScheduleStatus(scheduleId, status);

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