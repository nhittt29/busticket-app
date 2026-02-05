import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { EmailService } from './services/email.service';

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
import { UserModule } from './modules/user.module';
import { ReviewsModule } from './modules/reviews.module';
import { PromotionsModule } from './modules/promotions.module';
import { StatsModule } from './stats/stats.module';
import { ZaloPayModule } from './modules/zalopay.module';
import { NotificationModule } from './modules/notification.module';
import { VnPayModule } from './modules/vnpay.module';
import { AiModule } from './modules/ai.module';
import { UploadModule } from './modules/upload.module';

// Entities
import { User } from './entities/User.entity';
import { Role } from './entities/Role.entity';
import { Brand } from './entities/Brand.entity';
import { Bus } from './entities/Bus.entity';
import { Seat } from './entities/Seat.entity';
import { Route } from './entities/Route.entity';
import { Schedule } from './entities/Schedule.entity';
import { DropoffPoint } from './entities/DropoffPoint.entity';
import { Ticket } from './entities/Ticket.entity';
import { PaymentHistory } from './entities/PaymentHistory.entity';
import { TicketPayment } from './entities/TicketPayment.entity';
import { Review } from './entities/Review.entity';
import { Promotion } from './entities/Promotion.entity';
import { Notification } from './entities/Notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM Configuration for Oracle
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get<string>('ORACLE_HOST'),
        port: configService.get<number>('ORACLE_PORT'),
        username: configService.get<string>('ORACLE_USERNAME'),
        password: configService.get<string>('ORACLE_PASSWORD'),
        serviceName: configService.get<string>('ORACLE_SERVICE_NAME'),
        entities: [
          User, Role, Brand, Bus, Seat, Route, Schedule,
          DropoffPoint, Ticket, PaymentHistory, TicketPayment,
          Review, Promotion, Notification
        ],
        synchronize: true,
        logging: false, // Disabled query logging as requested
      }),
    }),

    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),

    NestScheduleModule.forRoot(),

    // Feature Modules
    AiModule,
    NotificationModule,
    TypeOrmModule.forFeature([User, Role]),

    BusModule,
    BrandModule,
    RouteModule,
    ScheduleModule,
    TicketModule,
    SeatModule,
    BookingModule,
    DropoffPointModule,
    TicketQueueModule,
    ScheduleQueueModule,
    UserModule,
    ReviewsModule,
    PromotionsModule,
    StatsModule,
    ZaloPayModule,
    VnPayModule,
    UploadModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, RoleRepository, EmailService],
})
export class AppModule { }