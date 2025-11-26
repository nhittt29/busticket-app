// src/app.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaService } from './services/prisma.service';
import { UserRepository } from './repositories/user.repository';

import { BusModule } from './modules/bus.module';
import { BrandModule } from './modules/brand.module';
import { RouteModule } from './modules/route.module';
import { ScheduleModule } from './modules/schedule.module';
import { TicketModule } from './modules/ticket.module';
import { SeatModule } from './modules/seat.module';
import { BookingModule } from './modules/booking.module';
import { DropoffPointModule } from './modules/dropoff-point.module';
import { TicketQueueModule } from './queues/ticket-queue.module';
import { ScheduleQueueModule } from './queues/schedule-queue.module';

@Module({
  imports: [
    // Kết nối Redis cho tất cả Bull queues (giữ nguyên như cũ)
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),

    // NestJS Schedule (nếu bạn vẫn muốn dùng Cron truyền thống – giữ nguyên)
    NestScheduleModule.forRoot(),

    // CÁC MODULE NGHIỆP VỤ (giữ nguyên thứ tự cũ)
    BusModule,
    BrandModule,
    RouteModule,
    ScheduleModule,
    TicketModule,
    SeatModule,
    BookingModule,
    DropoffPointModule,

    // QUEUE MODULES – CHỈ THÊM 2 DÒNG NÀY VÀO CUỐI → HOÀN HẢO
    TicketQueueModule,      // Đã có sẵn – giữ nguyên
    ScheduleQueueModule,    // MỚI THÊM – TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI CHUYẾN XE
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserRepository],
})
export class AppModule {}