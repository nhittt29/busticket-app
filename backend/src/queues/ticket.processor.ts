import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { NotificationService } from '../services/notification.service';
import { QrService } from '../services/qr.service';
import { EmailService } from '../services/email.service';
import { TicketStatus } from '../models/Ticket';

@Processor('ticket')
export class TicketProcessor {
  private readonly logger = new Logger(TicketProcessor.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly seatRepo: SeatRepository,
    private readonly paymentHistoryRepo: PaymentHistoryRepository,
    private readonly notificationService: NotificationService,
    private readonly qrService: QrService,
    private readonly emailService: EmailService,
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

  /**
   * ✅ Tạo QR & Gửi Email (Async)
   * Giúp tránh timeout khi mạng yếu (4G)
   */
  @Process('generate-assets')
  async handleGenerateAssets(job: Job<{ paymentHistoryId: number; method: string; userId: number }>) {
    const { paymentHistoryId, method, userId } = job.data;
    this.logger.log(`🔄 Processing assets for Payment #${paymentHistoryId} via ${method}...`);

    try {
      // 1. Lấy thông tin đầy đủ
      const paymentHistory = await this.paymentHistoryRepo.findByIdWithRelations(paymentHistoryId);
      if (!paymentHistory) {
        this.logger.error(`❌ PaymentHistory #${paymentHistoryId} not found`);
        return;
      }

      let groupTickets = paymentHistory.ticketPayments ? paymentHistory.ticketPayments.map(tp => tp.ticket) : [];
      if (groupTickets.length === 0 && paymentHistory.tickets) groupTickets = paymentHistory.tickets;

      if (groupTickets.length === 0) {
        this.logger.warn(`⚠️ No tickets found for Payment #${paymentHistoryId}`);
        return;
      }

      const firstTicket = groupTickets[0];

      // 2. Generate QR Logic
      // Retry handled by Bull if this throws
      const qrUrl = await this.qrService.generateSecureTicketQR(firstTicket.id);

      // 3. Send Email
      if (firstTicket.user?.email) {
        this.logger.log(`📧 Sending Ticket Email to ${firstTicket.user.email}...`);
        await this.emailService.sendUnifiedTicketEmail(
          firstTicket.user.email,
          groupTickets, // Full tickets with relations
          paymentHistoryId,
          qrUrl,
          method
        );
      } else {
        this.logger.warn(`⚠️ User has no email, skipping email send.`);
      }

      // 4. Notification
      await this.notificationService.create({
        userId: userId,
        title: 'Thanh toán thành công ✅',
        message: `Bạn đã thanh toán thành công cho ${groupTickets.length} vé. Mã vé: V${String(paymentHistoryId).padStart(6, '0')}. Kiểm tra email để nhận vé điện tử.`,
        type: 'PAYMENT'
      });

      this.logger.log(`✅ Assets generated & Email sent for Payment #${paymentHistoryId}`);

    } catch (error) {
      this.logger.error(`❌ Failed to generate assets for Payment #${paymentHistoryId}: ${error.message}`, error.stack);
      // Throw error to let Bull retry
      throw error;
    }
  }
}
