import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from '../controllers/ticket.controller';
import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { TicketPaymentRepository } from '../repositories/ticket-payment.repository';
import { UserRepository } from '../repositories/user.repository';

// Entities
import { Ticket } from '../entities/Ticket.entity';
import { Seat } from '../entities/Seat.entity';
import { Schedule } from '../entities/Schedule.entity';
import { PaymentHistory } from '../entities/PaymentHistory.entity';
import { TicketPayment } from '../entities/TicketPayment.entity';
import { User } from '../entities/User.entity';
import { Bus } from '../entities/Bus.entity'; // For schedules

// External Modules
import { BullModule } from '@nestjs/bull';
import { UserModule } from './user.module';
import { ZaloPayModule } from './zalopay.module';
import { VnPayModule } from './vnpay.module';
import { NotificationModule } from './notification.module';
import { HttpModule } from '@nestjs/axios';
import { QrController } from '../controllers/qr.controller';
import { PromotionsModule } from './promotions.module';

// Services
import { MomoService } from '../services/momo.service';
import { EmailService } from '../services/email.service';
import { QrService } from '../services/qr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Seat, Schedule, PaymentHistory, TicketPayment, User, Bus]),
    BullModule.registerQueue({
      name: 'ticket',
    }),
    UserModule,
    forwardRef(() => ZaloPayModule),
    VnPayModule,
    NotificationModule,
    HttpModule,
    PromotionsModule,
  ],
  controllers: [TicketController, QrController],
  providers: [
    TicketService,
    TicketRepository,
    SeatRepository,
    ScheduleRepository,
    PaymentHistoryRepository,
    TicketPaymentRepository,
    UserRepository,
    MomoService,
    EmailService,
    QrService,
  ],
  exports: [TicketService, TicketRepository],
})
export class TicketModule { }