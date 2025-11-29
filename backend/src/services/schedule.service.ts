import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { CreateScheduleDto } from '../dtos/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepo: ScheduleRepository) { }

  // TẠO MỚI MỘT CHUYẾN XE (LỊCH TRÌNH) – DÀNH CHO ADMIN/NHÀ XE
  async createSchedule(dto: CreateScheduleDto) {
    return this.scheduleRepo.createSchedule(dto);
  }

  // TÌM KIẾM CHUYẾN XE CHO KHÁCH HÀNG: THEO ĐIỂM ĐI, ĐIỂM ĐẾN, NGÀY ĐI – CHỈ HIỆN CHƯA KHỞI HÀNH
  async getAllSchedules(query: {
    startPoint?: string;
    endPoint?: string;
    date?: string;
    minPrice?: number;
    maxPrice?: number;
    startTime?: string;
    endTime?: string;
    busType?: string;
    brandId?: number;
    dropoffPoint?: string;
    sortBy?: string;
  }) {
    return this.scheduleRepo.getAllSchedules(query);
  }

  // LẤY TOÀN BỘ CHUYẾN XE (KHÔNG LỌC) – DÀNH RIÊNG CHO ADMIN QUẢN LÝ, BAO GỒM QUÁ KHỨ VÀ TƯƠNG LAI
  async getAllSchedulesForAdmin() {
    return this.scheduleRepo.getAllSchedulesForAdmin();
  }

  // LẤY CHI TIẾT MỘT CHUYẾN XE THEO ID – NÉM LỖI 404 NẾU KHÔNG TỒN TẠI
  async getScheduleById(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  // XÓA CHUYẾN XE HOÀN TOÀN – TỰ ĐỘNG XÓA TẤT CẢ VÉ ĐÃ ĐẶT TRƯỚC KHI XÓA (AN TOÀN DỮ LIỆU)
  async deleteSchedule(id: number) {
    const schedule = await this.scheduleRepo.getScheduleById(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    await this.scheduleRepo.deleteTicketsByScheduleId(id);
    return this.scheduleRepo.deleteSchedule(id);
  }
}