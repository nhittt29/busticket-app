import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from '../controllers/booking.controller';
import { BookingService } from '../services/booking.service';
import { Schedule } from '../entities/Schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule { }