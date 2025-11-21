import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { CreateScheduleDto } from '../dtos/schedule.dto';

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

  // ĐÃ XÓA HÀM getSeats() HOÀN TOÀN – KHÔNG DÙNG NỮA!
  // → Giờ chỉ dùng SeatService.getSeatsBySchedule()

  async deleteSchedule(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    await this.scheduleRepo.deleteTicketsByScheduleId(id);
    return this.scheduleRepo.deleteSchedule(id);
  }
}