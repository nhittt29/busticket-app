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

@Module({
  imports: [
    // Kết nối Redis cho Bull queue
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),

    // MỚI: KÍCH HOẠT CRONJOB CHO SCHEDULE
    NestScheduleModule.forRoot(),

    // Các module nghiệp vụ
    BusModule,
    BrandModule,
    RouteModule,
    ScheduleModule,
    TicketModule,
    SeatModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserRepository],
})
export class AppModule {}