// src/queues/schedule-queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { ScheduleProcessor } from './schedule.processor';
import { PrismaService } from '../services/prisma.service';
import { SCHEDULE_QUEUE, UPDATE_STATUS_JOB } from './schedule.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SCHEDULE_QUEUE,
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  providers: [
    ScheduleProcessor,
    PrismaService, // ← Đã thêm để ScheduleProcessor dùng được
    {
      provide: 'SCHEDULE_STATUS_INIT',
      useFactory: async (queue: any) => {
        // Xóa job cũ nếu tồn tại (tránh duplicate khi restart)
        const repeatables = await queue.getRepeatableJobs();
        for (const job of repeatables) {
          if (job.id === UPDATE_STATUS_JOB || job.key.includes(UPDATE_STATUS_JOB)) {
            await queue.removeRepeatableByKey(job.key);
          }
        }

        // Tạo job chạy lặp lại mỗi 20 phút – TỐI ƯU NHẤT
        await queue.add(
          UPDATE_STATUS_JOB,
          {},
          {
            repeat: { every: 20 * 60 * 1000 }, // 20 phút
            jobId: UPDATE_STATUS_JOB,
          },
        );

        console.log('Schedule status updater đã khởi động – chạy mỗi 20 phút');
      },
      inject: [getQueueToken(SCHEDULE_QUEUE)],
    },
  ],
  exports: [BullModule],
})
export class ScheduleQueueModule {}