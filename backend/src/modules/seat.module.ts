// src/modules/seat.module.ts
import { Module } from '@nestjs/common';
import { SeatController } from '../controllers/seat.controller';
import { SeatService } from '../services/seat.service';
import { SeatRepository } from '../repositories/seat.repository';
import { PrismaService } from '../services/prisma.service'; // THÊM

@Module({
  controllers: [SeatController],
  providers: [SeatService, SeatRepository, PrismaService], // THÊM PrismaService
  exports: [SeatService],
})
export class SeatModule {}