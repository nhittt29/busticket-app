import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { PrismaService } from '../services/prisma.service';
import { TicketProcessor } from '../queues/ticket.processor';
import { TicketController } from '../controllers/ticket.controller';

@Module({
  imports: [
    // ✅ Đăng ký queue “ticket” vào Bull
    BullModule.registerQueue({
      name: 'ticket',
    }),
  ],
  controllers: [TicketController],
  providers: [
    TicketService,
    TicketRepository,
    PrismaService,
    TicketProcessor,
  ],
  exports: [TicketService],
})
export class TicketModule {}
