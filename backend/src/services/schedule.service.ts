import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { CreateScheduleDto } from '../dtos/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepo: ScheduleRepository) {}

  // ✅ Tạo lịch trình mới
  async createSchedule(dto: CreateScheduleDto) {
    console.log('Creating schedule with DTO:', dto); // Log để debug
    return this.scheduleRepo.createSchedule(dto);
  }

  // ✅ Lấy danh sách tất cả lịch trình
  async getAllSchedules() {
    return this.scheduleRepo.getAllSchedules();
  }

  // ✅ Lấy chi tiết 1 lịch trình theo id
  async getScheduleById(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }
}