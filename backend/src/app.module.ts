import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaService } from './services/prisma.service';
import { UserRepository } from './repositories/user.repository';

import { BusModule } from './modules/bus.module';
import { BrandModule } from './modules/brand.module';
import { RouteModule } from './modules/route.module';
import { ScheduleModule } from './modules/schedule.module';
import { TicketModule } from './modules/ticket.module';

@Module({
  imports: [
    // ✅ Kết nối Redis cho Bull queue
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),

    // ✅ Các module nghiệp vụ
    BusModule,
    BrandModule,
    RouteModule,
    ScheduleModule,
    TicketModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserRepository],
})
export class AppModule {}
