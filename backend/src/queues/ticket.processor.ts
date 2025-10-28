import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull'; // ✅ Thêm import type
import { PrismaService } from '../services/prisma.service';
import { TicketStatus } from '../models/Ticket';
import { TICKET_QUEUE, AUTO_CANCEL_JOB } from './ticket.queue';

@Processor(TICKET_QUEUE)
export class TicketProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process(AUTO_CANCEL_JOB)
  async handleAutoCancel(job: Job) {
    const ticketId = job.data.ticketId;
    console.log('⏳ Check auto-cancel for ticket:', ticketId);

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.status !== TicketStatus.BOOKED) return;

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.CANCELLED },
    });

    await this.prisma.seat.update({
      where: { id: ticket.seatId },
      data: { isAvailable: true },
    });

    console.log('❌ Auto Cancel completed for ticket:', ticketId);
  }
}
