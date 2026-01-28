import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProcessor } from './ticket.processor';
import { TicketRepository } from '../repositories/ticket.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { TicketPaymentRepository } from '../repositories/ticket-payment.repository';
import { UserRepository } from '../repositories/user.repository';
import { QrService } from '../services/qr.service';
import { EmailService } from '../services/email.service';
import { NotificationModule } from '../modules/notification.module';
import { Ticket } from '../entities/Ticket.entity';
import { Seat } from '../entities/Seat.entity';
import { Schedule } from '../entities/Schedule.entity';
import { PaymentHistory } from '../entities/PaymentHistory.entity';
import { TicketPayment } from '../entities/TicketPayment.entity';
import { User } from '../entities/User.entity';
import { Bus } from '../entities/Bus.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ticket',
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    TypeOrmModule.forFeature([
      Ticket, Seat, Schedule,
      PaymentHistory, TicketPayment, User, // Added entities
      Bus, // For Schedule relation in Email
    ]),
    NotificationModule,
  ],
  providers: [
    TicketProcessor,
    TicketRepository,
    SeatRepository,
    PaymentHistoryRepository, // Added
    TicketPaymentRepository, // Added
    UserRepository, // Added
    QrService, // Added
    EmailService, // Added
  ],
  exports: [BullModule],
})
export class TicketQueueModule { }
