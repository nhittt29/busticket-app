// src/modules/booking.module.ts (nếu chưa có thì tạo mới)
import { Module } from '@nestjs/common';
import { BookingController } from '../controllers/booking.controller';
import { BookingService } from '../services/booking.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService],
  exports: [BookingService],
})
export class BookingModule {}