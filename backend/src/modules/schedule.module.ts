import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleController } from '../controllers/schedule.controller';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { ScheduleCronService } from '../services/schedule.cron';
import { Schedule } from '../entities/Schedule.entity';
import { Ticket } from '../entities/Ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Ticket])],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository, TicketRepository, ScheduleCronService],
  exports: [ScheduleService, ScheduleRepository], // Exported ScheduleRepository so ScheduleQueueModule can use it
})
export class ScheduleModule { }
