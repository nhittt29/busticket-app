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

@Module({
  imports: [
    // Kết nối Redis cho Bull queue
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),

    // Kích hoạt CronJob của NestJS Schedule
    NestScheduleModule.forRoot(),

    // Các module nghiệp vụ
    BusModule,
    BrandModule,
    RouteModule,
    ScheduleModule,
    TicketModule,
    SeatModule,
    BookingModule,
    DropoffPointModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserRepository],
})
export class AppModule {}