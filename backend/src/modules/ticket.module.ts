import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { PrismaService } from '../services/prisma.service';
import { TicketProcessor } from '../queues/ticket.processor';
import { TicketController } from '../controllers/ticket.controller';
import { MomoService } from '../services/momo.service';

@Module({
  imports: [
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
    MomoService,
  ],
  exports: [TicketService],
})
export class TicketModule {}