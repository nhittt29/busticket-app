import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TICKET_QUEUE } from './ticket.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TICKET_QUEUE,
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  exports: [BullModule],
})
export class TicketQueueModule {}
