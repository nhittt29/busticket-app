// src/queues/schedule.processor.ts
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ScheduleStatus } from '@prisma/client';
import { SCHEDULE_QUEUE, UPDATE_STATUS_JOB } from './schedule.queue';

@Processor(SCHEDULE_QUEUE)
export class ScheduleProcessor {
  private readonly logger = new Logger(ScheduleProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process(UPDATE_STATUS_JOB)
  async handleUpdateStatus(job: Job<unknown>) {
    const now = new Date();
    this.logger.log(`Bắt đầu kiểm tra cập nhật trạng thái chuyến xe – ${now.toLocaleString('vi-VN')}`);

    // 1. Lấy danh sách chuyến cần chuyển từ UPCOMING → ONGOING
    const upcomingSchedules = await this.prisma.schedule.findMany({
      where: {
        status: ScheduleStatus.UPCOMING,
        departureAt: { lte: now },
      },
      select: {
        id: true,
        departureAt: true,
        bus: { select: { name: true, licensePlate: true } },
        route: {
          select: {
            startPoint: true,
            endPoint: true,
          },
        },
      },
      orderBy: { departureAt: 'asc' },
    });

    // 2. Lấy danh sách chuyến cần chuyển từ ONGOING → COMPLETED
    const ongoingSchedules = await this.prisma.schedule.findMany({
      where: {
        status: ScheduleStatus.ONGOING,
        arrivalAt: { lte: now },
      },
      select: {
        id: true,
        arrivalAt: true,
        bus: { select: { name: true, licensePlate: true } },
        route: {
          select: {
            startPoint: true,
            endPoint: true,
          },
        },
      },
      orderBy: { arrivalAt: 'asc' },
    });

    // 3. Thực hiện update và log chi tiết từng chuyến
    const [upcomingResult, ongoingResult] = await Promise.all([
      upcomingSchedules.length > 0
        ? this.prisma.schedule.updateMany({
            where: {
              id: { in: upcomingSchedules.map(s => s.id) },
            },
            data: { status: ScheduleStatus.ONGOING },
          })
        : Promise.resolve({ count: 0 }),

      ongoingSchedules.length > 0
        ? this.prisma.schedule.updateMany({
            where: {
              id: { in: ongoingSchedules.map(s => s.id) },
            },
            data: { status: ScheduleStatus.COMPLETED },
          })
        : Promise.resolve({ count: 0 }),
    ]);

    // LOG SIÊU CHI TIẾT KHI CÓ CHUYẾN ĐƯỢC CẬP NHẬT

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

    // Tổng kết
    const totalUpdated = upcomingResult.count + ongoingResult.count;
    if (totalUpdated > 0) {
      this.logger.log(
        `ĐÃ CẬP NHẬT TRẠNG THÁI: ${upcomingResult.count} chuyến → ĐANG DI CHUYỂN | ` +
        `${ongoingResult.count} chuyến → HOÀN THÀNH | Tổng: ${totalUpdated} chuyến`,
      );
    } else {
      this.logger.verbose('Không có chuyến xe nào cần cập nhật trạng thái lúc này.');
    }
  }
}