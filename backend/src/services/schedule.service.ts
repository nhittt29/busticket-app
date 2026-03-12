import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { CreateScheduleDto } from '../dtos/schedule.dto';
import { TicketRepository } from '../repositories/ticket.repository'; // Import TicketRepo

@Injectable()
export class ScheduleService {
  constructor(
    private readonly scheduleRepo: ScheduleRepository,
    private readonly ticketRepo: TicketRepository // Inject TicketRepo
  ) { }

  // TẠO MỚI MỘT CHUYẾN XE
  async createSchedule(dto: CreateScheduleDto) {
    return this.scheduleRepo.createSchedule(dto);
  }

  // TÌM KIẾM CHUYẾN XE CHO KHÁCH HÀNG
  async getAllSchedules(query: any) {
    return this.scheduleRepo.getAllSchedules(query);
  }


  // LẤY TOÀN BỘ CHUYẾN XE (KHÔNG LỌC)
  async getAllSchedulesForAdmin() {
    return this.scheduleRepo.getAllSchedulesForAdmin();
  }

  // LẤY DANH SÁCH CHUYẾN XE CỦA NHÀ XE
  async getSchedulesByBrandId(brandId: number) {
    return this.scheduleRepo.getSchedulesByBrandId(brandId);
  }

  // LẤY CHI TIẾT MỘT CHUYẾN XE
  async getScheduleById(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  // XÓA CHUYẾN XE HOÀN TOÀN
  async deleteSchedule(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    // Correctly delete tickets using ticketRepo
    await this.ticketRepo.deleteByScheduleId(id);
    // Assuming deleteByScheduleId exists or use delete({ scheduleId: id })
    // Check TicketRepo interface. It has delete(id).
    // I should use delete({ scheduleId: id }) if TypeORM repo, but TicketRepo wraps logic.
    // TicketRepo logic: Step 191/214 defines delete(id). 
    // I need to add deleteByScheduleId to TicketRepo OR use TypeORM standard delete if TicketRepo extends strict Repo.
    // TicketRepo DOES NOT extend Repository, it has `constructor(private repo: Repository)`.
    // So I must add `deleteByScheduleId` to TicketRepository.

    return this.scheduleRepo.deleteSchedule(id);
  }

  // LẤY DANH SÁCH ĐIỂM TRẢ
  async getDropoffPoints(scheduleId: number) {
    return this.scheduleRepo.getDropoffPoints(scheduleId);
  }
}