import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
// import { ScheduleProcessor } from './schedule.processor'; 

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'schedule',
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  // providers: [ScheduleProcessor], // Assuming processor exists, if not just skip
  exports: [BullModule],
})
export class ScheduleQueueModule { }