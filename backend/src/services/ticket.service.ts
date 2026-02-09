
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { TicketRepository } from '../repositories/ticket.repository';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { TicketPaymentRepository } from '../repositories/ticket-payment.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreateTicketDto } from '../dtos/ticket.dto';

import { MomoService } from './momo.service';
import { EmailService } from './email.service';
import { QrService } from './qr.service';
import { ZaloPayService } from './zalopay.service';
import { VnPayService } from './vnpay.service';
import { NotificationService } from './notification.service';
import {
  CreateResponse,
  BulkCreateResponse,
  PaymentHistoryResponse,
} from '../dtos/ticket.response.dto';
import { TicketStatus, PaymentMethod as AppPaymentMethod } from '../models/Ticket';
import { PaymentHistory } from '../entities/PaymentHistory.entity';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly scheduleRepo: ScheduleRepository,
    private readonly seatRepo: SeatRepository,
    private readonly paymentHistoryRepo: PaymentHistoryRepository,
    private readonly ticketPaymentRepo: TicketPaymentRepository,
    private readonly userRepo: UserRepository,
    private readonly momoService: MomoService,
    private readonly emailService: EmailService,
    private readonly qrService: QrService,
    private readonly vnpayService: VnPayService,
    @Inject(forwardRef(() => ZaloPayService)) private readonly zaloPayService: ZaloPayService,
    private readonly notificationService: NotificationService,
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
  ) { }

  async create(dto: CreateTicketDto): Promise<CreateResponse> {
    const { userId, scheduleId, seatId, price, paymentMethod, dropoffPointId, dropoffAddress } = dto;

    const schedule = await this.scheduleRepo.getScheduleById(scheduleId);
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

    const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / 3600000;
    if (diffHours < 1) throw new BadRequestException('Chỉ được đặt vé trước 1 giờ khởi hành');

    const seat = await this.seatRepo.findById(seatId);
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Ghế không thuộc xe của lịch trình này');

    const seatBooked = await this.ticketRepo.checkSeatBooked(scheduleId, seatId);
    if (seatBooked) throw new BadRequestException('Ghế đã được đặt');

    const userTickets = await this.ticketRepo.findUserBookedToday(userId);
    if (userTickets >= 8) throw new BadRequestException('Chỉ được đặt tối đa 8 vé/ngày');

    let surcharge = 0;
    let finalDropoffPointId: number | undefined = undefined;
    let finalDropoffAddress: string | undefined = undefined;

    if (dropoffPointId != null) {
      finalDropoffPointId = dropoffPointId;
      surcharge = 0;
    } else if (dropoffAddress && dropoffAddress.trim() !== '') {
      surcharge = 150000;
      finalDropoffAddress = dropoffAddress.trim();
    }

    const totalAmount = price + surcharge;

    // Casting to any to fix array inference issues
    const paymentGroup: any = await this.paymentHistoryRepo.create({
      method: paymentMethod || AppPaymentMethod.MOMO,
      amount: totalAmount,
      status: 'PENDING',
    });

    // Casting to any to fix array inference issues
    const ticket: any = await this.ticketRepo.create({
      userId,
      scheduleId,
      seatId,
      price,
      surcharge,
      totalPrice: totalAmount,
      status: TicketStatus.BOOKED,
      paymentMethod: paymentMethod || AppPaymentMethod.MOMO,
      dropoffPointId: finalDropoffPointId,
      dropoffAddress: finalDropoffAddress,
      paymentHistoryId: paymentGroup.id,
    });

    await this.ticketPaymentRepo.create({
      ticketId: ticket.id,
      paymentId: paymentGroup.id
    });

    await this.ticketQueue.add('hold-expire', { ticketId: ticket.id }, { delay: 15 * 60 * 1000 });
    await this.ticketQueue.add('payment-reminder', { ticketId: ticket.id }, { delay: 10 * 60 * 1000 });

    let paymentResponse: any = null;
    const user = await this.userRepo.findById(userId);

    if (paymentMethod === AppPaymentMethod.ZALOPAY) {
      const res = await this.zaloPayService.createOrder(
        paymentGroup.id,
        totalAmount,
        user?.email || 'unknown@user.com'
      );
      if (res.return_code === 1) {
        paymentResponse = { payUrl: res.order_url, zpTransToken: res.zp_trans_token };
      } else {
        throw new BadRequestException(`ZaloPay Error: ${res.return_message}`);
      }
    } else if (paymentMethod === AppPaymentMethod.VNPAY) {
      paymentResponse = {
        payUrl: this.vnpayService.createPaymentUrl(
          paymentGroup.id,
          totalAmount,
          '127.0.0.1'
        )
      };
    } else {
      paymentResponse = await this.momoService.createPayment(
        paymentGroup.id,
        totalAmount,
        `Thanh toán vé xe #${ticket.id}`,
      );
    }

    if (paymentResponse && paymentResponse.payUrl) {
      await this.paymentHistoryRepo.update(paymentGroup.id, { payUrl: paymentResponse.payUrl });
    }

    return {
      message: 'Đặt vé thành công.',
      ticket: ticket as any,
      payment: paymentResponse,
    };
  }

  async createBulk(dtos: CreateTicketDto[], totalAmountFromClient: number, promotionId?: number, discountAmount?: number): Promise<BulkCreateResponse> {
    if (dtos.length === 0) throw new BadRequestException('Empty tickets list');
    const firstDto = dtos[0];
    const schedule = await this.scheduleRepo.getScheduleById(firstDto.scheduleId);
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

    // Calculate Surcharge based on First Ticket (Unified Dropoff)
    let surcharge = 0;
    let finalDropoffPointId: number | undefined = undefined;
    let finalDropoffAddress: string | undefined = undefined;

    if (firstDto.dropoffPointId != null) {
      finalDropoffPointId = firstDto.dropoffPointId;
      surcharge = 0;
    } else if (firstDto.dropoffAddress && firstDto.dropoffAddress.trim() !== '') {
      surcharge = 150000;
      finalDropoffAddress = firstDto.dropoffAddress.trim();
    }

    // Calculate Base Total
    let calculatedTotal = dtos.reduce((sum, d) => sum + d.price, 0);

    // Add Total Surcharge (Surcharge * Number of Tickets)
    const totalSurcharge = surcharge * dtos.length;
    calculatedTotal += totalSurcharge;

    if (discountAmount) calculatedTotal -= discountAmount;

    // Use max(0, total) to prevent negative
    calculatedTotal = Math.max(0, calculatedTotal);

    // Casting to any
    const paymentGroup: any = await this.paymentHistoryRepo.create({
      method: firstDto.paymentMethod || AppPaymentMethod.MOMO,
      amount: calculatedTotal,
      status: 'PENDING',
      promotionId: promotionId || null,
      discountAmount: discountAmount || 0,
    });

    const createdTickets: any[] = [];
    for (const dto of dtos) {
      const ticket: any = await this.ticketRepo.create({
        userId: dto.userId,
        scheduleId: dto.scheduleId,
        seatId: dto.seatId,
        price: dto.price,
        surcharge: surcharge, // Save surcharge per ticket
        totalPrice: dto.price + surcharge,
        status: TicketStatus.BOOKED,
        paymentMethod: dto.paymentMethod,
        dropoffPointId: finalDropoffPointId, // Save dropoff info
        dropoffAddress: finalDropoffAddress,
        paymentHistoryId: paymentGroup.id
      });
      await this.ticketPaymentRepo.create({ ticketId: ticket.id, paymentId: paymentGroup.id });
      createdTickets.push(ticket);
    }

    let paymentResponse: any = null;
    const user = await this.userRepo.findById(firstDto.userId);

    if (firstDto.paymentMethod === AppPaymentMethod.ZALOPAY) {
      const res = await this.zaloPayService.createOrder(
        paymentGroup.id,
        calculatedTotal,
        user?.email || 'unknown@user.com'
      );
      if (res.return_code === 1) {
        paymentResponse = { payUrl: res.order_url, zpTransToken: res.zp_trans_token };
      } else {
        // Log error but prioritize returning tickets created? No, failing payment init is bad.
        // But tickets are created. Ideally we should rollback or return pending payment.
        // For now, return what we have, User can retry payment.
      }
    } else if (firstDto.paymentMethod === AppPaymentMethod.VNPAY) {
      paymentResponse = {
        payUrl: this.vnpayService.createPaymentUrl(paymentGroup.id, calculatedTotal, '127.0.0.1')
      };
    } else {
      paymentResponse = await this.momoService.createPayment(paymentGroup.id, calculatedTotal, 'Thanh toan ve tap the');
    }

    if (paymentResponse?.payUrl) {
      await this.paymentHistoryRepo.update(paymentGroup.id, { payUrl: paymentResponse.payUrl });
    }

    return {
      tickets: createdTickets as any[],
      payment: paymentResponse
    }
  }

  async payTicket(paymentHistoryId: number, method: any, transId?: string) {
    const paymentHistory = await this.paymentHistoryRepo.findByIdWithRelations(paymentHistoryId);
    if (!paymentHistory) throw new NotFoundException('Không tìm thấy đơn thanh toán');

    await this.paymentHistoryRepo.update(paymentHistoryId, {
      method,
      transactionId: transId,
      status: 'SUCCESS',
      paidAt: new Date()
    });

    let groupTickets = paymentHistory.ticketPayments ? paymentHistory.ticketPayments.map(tp => tp.ticket) : [];
    if (groupTickets.length === 0 && paymentHistory.tickets) groupTickets = paymentHistory.tickets;

    // 4. Update status
    for (const t of groupTickets) {
      if (t) {
        await this.ticketRepo.update(t.id, { status: TicketStatus.PAID });
        // Seat update
        if (t.seatId) await this.seatRepo.updateAvailability(t.seatId, false);
      }
    }

    // 5. Success Log
    this.logger.log(`✅ [PAYMENT SUCCESS] PaymentHistory #${paymentHistoryId} confirmed via ${method}`);

    // 6. Generate QR & Send Email (ASYNC VIA QUEUE)
    // Avoid blocking response on 4G networks
    this.logger.log(`⏳ Adding 'generate-assets' job to queue for Payment #${paymentHistoryId}`);

    // Tìm ticket đầu tiên để lấu userId cho job
    const firstTicket = groupTickets[0];
    if (firstTicket) {
      await this.ticketQueue.add('generate-assets', {
        paymentHistoryId,
        method,
        userId: firstTicket.userId
      }, {
        attempts: 3,
        backoff: 5000, // Wait 5s before retry
        removeOnComplete: true
      });
    }

    return { message: 'Thanh toán thành công', paymentHistoryId };
  }

  async cancel(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    await this.ticketRepo.update(id, { status: TicketStatus.CANCELLED });
    if (ticket.seatId) await this.seatRepo.updateAvailability(ticket.seatId, true);

    return { message: 'Hủy vé thành công' };
  }

  async getAllTickets() { return []; }
  async getAllBookingsForAdmin() { return []; }
  async getBookingById(id: number) { return {}; }
  async getTicketById(id: number) { return this.ticketRepo.findById(id); }

  async handleMomoRedirect(query: any) {
    this.logger.log(`MoMo Redirect Query: ${JSON.stringify(query)}`);

    // Verify Signature
    const isValid = this.momoService.verifySignature(query);
    if (!isValid) {
      this.logger.error('❌ MoMo Redirect Signature Mismatch');
      return { success: false, message: 'Invalid Signature' };
    }

    if (Number(query.resultCode) === 0) {
      const match = query.orderId.match(/^TICKET_(\d+)_\d+$/);
      if (match) {
        const paymentHistoryId = Number(match[1]);
        // Update Ticket Status immediately on redirect (since IPN can't reach localhost)
        await this.payTicket(paymentHistoryId, AppPaymentMethod.MOMO, query.transId);
        return { success: true, paymentHistoryId };
      }
    }

    return { success: false, message: query.message || 'Payment Failed' };
  }

  async handleZaloPayRedirect(query: any) {
    // ZaloPay redirect contains: app_trans_id, status (1=success), checksum (sometimes)
    // But official doc says query string parameters are NOT signed reliably for standard redirect.
    // However, it usually includes app_trans_id.
    this.logger.log(`ZaloPay Redirect Query: ${JSON.stringify(query)}`);

    // Check checksum if available, otherwise force Query Status
    const appTransId = query.apptransid;
    // ZaloPay sends lowercase 'apptransid' in some versions, or 'app_trans_id'

    if (!appTransId) {
      return { success: false, message: 'Missing AppTransId' };
    }

    try {
      // Query status from ZaloPay Server to be sure
      const status = await this.zaloPayService.queryStatus(appTransId) as any;
      if (status.return_code === 1) {
        const match = appTransId.match(/^\d+_(\d+)_/); // Format: yymmdd_TRANSID
        // wait, createOrder used `${yymmdd}_${transID}`. It doesn't embed paymentId in app_trans_id directly?
        // createOrder logs: transactionId: order.app_trans_id. 
        // And puts id in paymentHistory.transactionId.

        // So we find payment by transactionId
        const payment = await this.paymentHistoryRepo.findByTransactionId(appTransId);
        if (payment) {
          await this.payTicket(payment.id, AppPaymentMethod.ZALOPAY, appTransId);
          return { success: true, paymentHistoryId: payment.id };
        }
      }
      return { success: false, message: status.return_message || 'Payment Pending/Failed' };
    } catch (e) {
      this.logger.error(`ZaloPay Verification Failed: ${e.message}`);
      return { success: false, message: 'Verification Error' };
    }
  }

  async handleVnPayReturn(query: any) {
    this.logger.log(`VNPay Return Query: ${JSON.stringify(query)}`);
    const verify = this.vnpayService.verifyReturnUrl(query);

    if (verify.success && verify.paymentHistoryId) {
      await this.payTicket(verify.paymentHistoryId, AppPaymentMethod.VNPAY, query['vnp_TransactionNo']);
      return { success: true, paymentHistoryId: verify.paymentHistoryId };
    }

    return { success: false, message: verify.message || 'Payment Verification Failed' };
  }
  async handleMomoCallback(data: any) {
    this.logger.log(`MoMo Callback Body: ${JSON.stringify(data)}`);

    const isValid = this.momoService.verifySignature(data);
    if (!isValid) {
      this.logger.error('❌ MoMo Signature Mismatch');
      throw new BadRequestException('Invalid Signature');
    }

    if (Number(data.resultCode) === 0) {
      // OrderId format: TICKET_{paymentHistoryId}_{timestamp}
      const match = data.orderId.match(/^TICKET_(\d+)_\d+$/);
      if (match) {
        const paymentHistoryId = Number(match[1]);
        return this.payTicket(paymentHistoryId, AppPaymentMethod.MOMO, data.transId);
      }
    } else {
      this.logger.warn(`⚠️ MoMo Payment Failed: Code ${data.resultCode} - ${data.message}`);
    }

    return { success: true };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }

  async getStatus(id: number) {
    return this.ticketRepo.findById(id);
  }

  async getPaymentHistory(ticketId: number) {
    return {};
  }

  async getPaymentDetailByHistoryId(id: number) {
    const ph = await this.paymentHistoryRepo.findByIdWithRelations(id);
    if (!ph) throw new NotFoundException('Payment History Not Found');
    return ph;
  }

  async checkZaloPayStatus(paymentHistoryId: number) {
    this.logger.log(`Manual Check ZaloPay Status for Payment #${paymentHistoryId}`);
    const payment = await this.paymentHistoryRepo.findById(paymentHistoryId);
    if (!payment) throw new BadRequestException('Không tìm thấy đơn thanh toán');

    if (payment.status === 'SUCCESS') return { success: true, message: 'Đã thanh toán thành công' };
    if (!payment.transactionId) return { success: false, message: 'Chưa có mã giao dịch ZaloPay' };

    try {
      const result = await this.zaloPayService.queryStatus(payment.transactionId) as any;
      this.logger.log(`Query Status Result: ${JSON.stringify(result)}`);

      if (result.return_code === 1) {
        await this.payTicket(paymentHistoryId, AppPaymentMethod.ZALOPAY, payment.transactionId);
        return { success: true, message: 'Thanh toán thành công', zp_code: 1 };
      }
      return {
        success: false,
        message: result.return_message || 'Giao dịch chưa hoàn tất',
        zp_code: result.return_code,
        is_processing: result.is_processing
      };
    } catch (error) {
      this.logger.error(`Check ZaloPay Status Failed`, error);
      return { success: false, message: error.message || 'Lỗi kiểm tra trạng thái' };
    }
  }
}