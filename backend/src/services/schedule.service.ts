import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { CreateScheduleDto } from '../dtos/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepo: ScheduleRepository) {}

  async createSchedule(dto: CreateScheduleDto) {
    return this.scheduleRepo.createSchedule(dto);
  }

  async getAllSchedules() {
    return this.scheduleRepo.getAllSchedules();
  }

  async getScheduleById(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  // ✅ Lấy ghế theo lịch trình
  async getSeats(scheduleId: number) {
    const seats = await this.scheduleRepo.getSeatsBySchedule(scheduleId);
    if (!seats) throw new NotFoundException('Schedule not found');
    return seats;
  }
}
