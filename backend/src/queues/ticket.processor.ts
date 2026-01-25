import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { NotificationService } from '../services/notification.service';
import { TicketStatus } from '../models/Ticket'; // Ensure this enum/const is available

@Processor('ticket')
export class TicketProcessor {
  private readonly logger = new Logger(TicketProcessor.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly seatRepo: SeatRepository,
    private readonly notificationService: NotificationService,
  ) { }

  /**
   * ✅ Tự động hủy vé nếu sau 15 phút chưa thanh toán
   */
  @Process('hold-expire')
  async handleHoldExpire(job: Job<{ ticketId: number }>) {
    const { ticketId } = job.data;

    const ticket = await this.ticketRepo.findById(ticketId);

    if (!ticket) return;
    if (ticket.status === 'PAID') return; // String check if enum issue

    // ✅ Hủy vé + mở lại ghế
    // Sequential updates are fine here
    await this.ticketRepo.update(ticketId, { status: 'CANCELLED' });
    if (ticket.seatId) {
      await this.seatRepo.updateAvailability(ticket.seatId, true);
    }

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
    const ticket = await this.ticketRepo.findById(ticketId);

    if (!ticket || ticket.status === 'PAID' || ticket.status === 'CANCELLED') return;

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
