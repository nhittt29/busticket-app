// src/queues/schedule.processor.ts
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { ScheduleStatus } from '../models/Ticket';
import { SCHEDULE_QUEUE, UPDATE_STATUS_JOB } from './schedule.queue';
import { In, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Processor(SCHEDULE_QUEUE)
export class ScheduleProcessor {
  private readonly logger = new Logger(ScheduleProcessor.name);

  constructor(private readonly scheduleRepo: ScheduleRepository) { }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.log('Cron job trigger: Kiểm tra trạng thái chuyến xe (Mỗi 5 phút)');
    await this.handleUpdateStatus();
  }

  @Process(UPDATE_STATUS_JOB)
  async handleUpdateStatus(job?: Job<unknown>) {
    const now = new Date();
    this.logger.log(`Bắt đầu kiểm tra cập nhật trạng thái chuyến xe – ${now.toLocaleString('vi-VN')}`);

    // 1. UPCOMING -> ONGOING
    // Use repo find with relations
    // TypeORM find options
    const upcomingSchedules = await this.scheduleRepo.find({
      where: {
        status: ScheduleStatus.UPCOMING,
        departureAt: LessThanOrEqual(now),
      },
      relations: ['bus', 'route'],
      order: { departureAt: 'ASC' },
    });

    // 2. ONGOING -> COMPLETED
    const ongoingSchedules = await this.scheduleRepo.find({
      where: {
        status: ScheduleStatus.ONGOING,
        arrivalAt: LessThanOrEqual(now),
      },
      relations: ['bus', 'route'],
      order: { arrivalAt: 'ASC' },
    });

    // 3. Update
    let upcomingCount = 0;
    if (upcomingSchedules.length > 0) {
      const ids = upcomingSchedules.map(s => s.id);
      await this.scheduleRepo.update({ id: In(ids) }, { status: ScheduleStatus.ONGOING });
      upcomingCount = upcomingSchedules.length;
    }

    let ongoingCount = 0;
    if (ongoingSchedules.length > 0) {
      const ids = ongoingSchedules.map(s => s.id);
      await this.scheduleRepo.update({ id: In(ids) }, { status: ScheduleStatus.COMPLETED });
      ongoingCount = ongoingSchedules.length;
    }

    // LOG DETAILS
    if (upcomingSchedules.length > 0) {
      this.logger.warn('CHUYẾN XE BẮT ĐẦU KHỞI HÀNH – ĐANG DI CHUYỂN');
      upcomingSchedules.forEach(s => {
        this.logger.log(
          `→ [ID: ${s.id}] ${s.route.startPoint} → ${s.route.endPoint} | ` +
          `Xe: ${s.bus.name} (${s.bus.licensePlate}) | ` +
          `Giờ đi: ${s.departureAt.toLocaleString('vi-VN')}`,
        );
      });
    }

    if (ongoingSchedules.length > 0) {
      this.logger.warn('CHUYẾN XE ĐÃ ĐẾN NƠI – HOÀN THÀNH');
      ongoingSchedules.forEach(s => {
        this.logger.log(
          `→ [ID: ${s.id}] ${s.route.startPoint} → ${s.route.endPoint} | ` +
          `Xe: ${s.bus.name} (${s.bus.licensePlate}) | ` +
          `Đến nơi: ${s.arrivalAt.toLocaleString('vi-VN')}`,
        );
      });
    }

    // Summary
    const totalUpdated = upcomingCount + ongoingCount;
    if (totalUpdated > 0) {
      this.logger.log(
        `ĐÃ CẬP NHẬT TRẠNG THÁI: ${upcomingCount} chuyến → ĐANG DI CHUYỂN | ` +
        `${ongoingCount} chuyến → HOÀN THÀNH | Tổng: ${totalUpdated} chuyến`,
      );
    } else {
      this.logger.verbose('Không có chuyến xe nào cần cập nhật trạng thái lúc này.');
    }
  }
}