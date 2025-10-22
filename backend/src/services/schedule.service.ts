import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepo: ScheduleRepository) {}

  async create(dto: any) {
    return this.scheduleRepo.create(dto);
  }

  async findAll() {
    return this.scheduleRepo.findAll();
  }

  async findById(id: number) {
    const schedule = await this.scheduleRepo.findById(id);
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async update(id: number, dto: any) {
    return this.scheduleRepo.update(id, dto);
  }

  async delete(id: number) {
    return this.scheduleRepo.delete(id);
  }
}
