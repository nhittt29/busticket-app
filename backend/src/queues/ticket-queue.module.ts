import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProcessor } from './ticket.processor';
import { TicketRepository } from '../repositories/ticket.repository';
import { SeatRepository } from '../repositories/seat.repository';
// import { TicketHelper } from '../helpers/ticket.helper'; // If needed, or just repos
import { NotificationModule } from '../modules/notification.module';
import { Ticket } from '../entities/Ticket.entity';
import { Seat } from '../entities/Seat.entity';
import { Schedule } from '../entities/Schedule.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ticket',
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    TypeOrmModule.forFeature([Ticket, Seat, Schedule]),
    NotificationModule,
  ],
  providers: [TicketProcessor, TicketRepository, SeatRepository], // Removed PrismaService
  exports: [BullModule],
})
export class TicketQueueModule { }
