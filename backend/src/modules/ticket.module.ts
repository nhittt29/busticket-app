// src/modules/ticket.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { PrismaService } from '../services/prisma.service';
import { TicketProcessor } from '../queues/ticket.processor';
import { TicketController } from '../controllers/ticket.controller';
import { QrController } from '../controllers/qr.controller'; // THÊM DÒNG NÀY
import { MomoService } from '../services/momo.service';
import { EmailService } from '../services/email.service';
import { QrService } from '../services/qr.service';
import { ZaloPayModule } from './zalopay.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ticket',
    }),
    ZaloPayModule,
  ],
  controllers: [TicketController, QrController], // THÊM QrController
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