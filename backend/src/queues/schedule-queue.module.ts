import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleProcessor } from './schedule.processor';
import { ScheduleModule } from '../modules/schedule.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'schedule-queue',
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    ScheduleModule, // To provide ScheduleRepository
  ],
  providers: [ScheduleProcessor],
  exports: [BullModule],
})
export class ScheduleQueueModule { }