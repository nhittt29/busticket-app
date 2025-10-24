import { Module } from '@nestjs/common';
import { TicketController } from '../controllers/ticket.controller';
import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, PrismaService],
  exports: [TicketService],
})
export class TicketModule {}
