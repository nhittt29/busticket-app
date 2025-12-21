import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { PrismaService } from '../services/prisma.service';
import { TicketProcessor } from '../queues/ticket.processor';
import { TicketController } from '../controllers/ticket.controller';
import { QrController } from '../controllers/qr.controller';
import { MomoService } from '../services/momo.service';
import { EmailService } from '../services/email.service';
import { QrService } from '../services/qr.service';
import { NotificationModule } from './notification.module';
import { ZaloPayModule } from './zalopay.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ticket',
    }),
    HttpModule,
    forwardRef(() => ZaloPayModule),
    NotificationModule,
  ],
  controllers: [TicketController, QrController],
  providers: [
    TicketService,
    TicketRepository,
    PrismaService,
    TicketProcessor,
    MomoService,
    EmailService,
    QrService,
  ],
  exports: [TicketService],
})
export class TicketModule { }