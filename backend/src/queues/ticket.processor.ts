import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull'; // ✅ dùng import type để tránh lỗi TS1272
import { Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { TicketStatus } from '../models/Ticket';

@Processor('ticket')
export class TicketProcessor {
  private readonly logger = new Logger(TicketProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ✅ Tự động hủy vé nếu sau 15 phút chưa thanh toán
   */
  @Process('hold-expire')
  async handleHoldExpire(job: Job<{ ticketId: number }>) {
    const { ticketId } = job.data;

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) return;
    if (ticket.status === TicketStatus.PAID) return;

    // ✅ Hủy vé + mở lại ghế
    await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.CANCELLED },
      }),
      this.prisma.seat.update({
        where: { id: ticket.seatId },
        data: { isAvailable: true },
      }),
    ]);

    this.logger.warn(`⏰ Ticket #${ticketId} expired after 15 mins.`);
  }
}
