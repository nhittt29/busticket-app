import { Module } from '@nestjs/common';
import { ScheduleController } from '../controllers/schedule.controller';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository, PrismaService],
})
export class ScheduleModule { }
