import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatController } from '../controllers/seat.controller';
import { SeatService } from '../services/seat.service';
import { SeatRepository } from '../repositories/seat.repository';
import { Seat } from '../entities/Seat.entity';
import { Schedule } from '../entities/Schedule.entity';
import { SeatLock } from '../entities/SeatLock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Schedule, SeatLock])],
  controllers: [SeatController],
  providers: [SeatService, SeatRepository],
  exports: [SeatService],
})
export class SeatModule { }