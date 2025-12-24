import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { TicketStatus } from '../models/Ticket';

import { NotificationService } from '../services/notification.service';

@Processor('ticket')
export class TicketProcessor {
  private readonly logger = new Logger(TicketProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) { }

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

    // 🔔 Gửi thông báo: Vé bị hủy
    if (ticket.userId) {
      await this.notificationService.create({
        userId: ticket.userId,
        title: 'Vé đã bị hủy ❌',
        message: `Vé #${ticketId} đã tự động hủy do quá hạn thanh toán. Vui lòng đặt lại vé mới.`,
        type: 'TICKET_CANCELLED',
      });
    }
  }

  /**
   * ✅ Nhắc nhở thanh toán (10 phút sau khi đặt)
   */
  @Process('payment-reminder')
  async handlePaymentReminder(job: Job<{ ticketId: number }>) {
    const { ticketId } = job.data;
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket || ticket.status === TicketStatus.PAID || ticket.status === TicketStatus.CANCELLED) return;

    // 🔔 Gửi thông báo: Nhắc thanh toán
    if (ticket.userId) {
      await this.notificationService.create({
        userId: ticket.userId,
        title: 'Sắp hết hạn thanh toán ⏳',
        message: `Vé #${ticketId} sẽ bị hủy trong 5 phút nữa. Thanh toán ngay để giữ chỗ!`,
        type: 'PAYMENT_REMINDER',
      });
    }
  }
}
