import { Module } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { PrismaService } from '../services/prisma.service';
import { TicketProcessor } from '../queues/ticket.processor';
import { TicketQueueModule } from '../queues/ticket-queue.module';
import { TicketController } from '../controllers/ticket.controller';

@Module({
  imports: [TicketQueueModule],
  controllers: [TicketController],
  providers: [
    TicketService,
    TicketRepository,
    PrismaService,
    TicketProcessor,
  ],
})
export class TicketModule {}
