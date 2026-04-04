import * as oracledb from 'oracledb';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { DataSource } from 'typeorm';
import { TicketRepository } from '../repositories/ticket.repository';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { PromotionsService } from './promotions.service';
import { PaymentHistoryRepository } from '../repositories/payment-history.repository';
import { TicketPaymentRepository } from '../repositories/ticket-payment.repository';
import { UserRepository } from '../repositories/user.repository';
import { PromotionsRepository } from '../repositories/promotions.repository';
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
import { Ticket } from '../entities/Ticket.entity';
import { TicketPayment } from '../entities/TicketPayment.entity';

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
    private readonly promotionsRepo: PromotionsRepository,
    private readonly promotionsService: PromotionsService,
    private readonly momoService: MomoService,
    private readonly emailService: EmailService,
    private readonly qrService: QrService,
    private readonly vnpayService: VnPayService,
    @Inject(forwardRef(() => ZaloPayService)) private readonly zaloPayService: ZaloPayService,
    private readonly notificationService: NotificationService,
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateTicketDto, host?: string): Promise<CreateResponse> {
    const { userId, scheduleId, seatId, price, paymentMethod, dropoffPointId, dropoffAddress, promotionId, discountAmount } = dto;

    try {
      return await this.dataSource.transaction(async (manager) => {
      const schedule = await this.scheduleRepo.getScheduleById(scheduleId);
      if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

      const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / 3600000;
      if (diffHours < 1) throw new BadRequestException('Chỉ được đặt vé trước 1 giờ khởi hành');

      const seat = await this.seatRepo.findById(seatId);
      if (!seat || seat.busId !== schedule.busId)
        throw new BadRequestException('Ghế không thuộc xe của lịch trình này');

      const userTickets = await this.ticketRepo.findUserBookedToday(userId);
      if (userTickets >= 8) throw new BadRequestException('Chỉ được đặt tối đa 8 vé/ngày');

      // Validate Promotion if provided
      let validatedPromotionId: number | null = null;
      let validatedDiscountAmount = 0;

      if (promotionId) {
        const promotion = await this.promotionsRepo.findById(promotionId);
        if (!promotion) throw new BadRequestException('Mã khuyến mãi không tồn tại');

        const validation = await this.promotionsService.applyPromotion(promotion.code, price + (dropoffPointId != null ? 0 : 150000), userId);
        validatedPromotionId = promotion.id;
        validatedDiscountAmount = validation.discountAmount;
      }

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

      const totalAmount = Math.max(0, price + surcharge - validatedDiscountAmount);

      // 1. Tạo PaymentHistory bên trong transaction
      const paymentGroup = await manager.getRepository(PaymentHistory).save(
        manager.getRepository(PaymentHistory).create({
          method: paymentMethod || AppPaymentMethod.MOMO,
          amount: totalAmount,
          status: 'PENDING',
          promotionId: validatedPromotionId || undefined,
          discountAmount: validatedDiscountAmount,
        })
      ) as PaymentHistory;

      // 2. Tạo Ticket bên trong transaction
      const ticket = await manager.getRepository(Ticket).save(
        manager.getRepository(Ticket).create({
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
        })
      ) as Ticket;

      await manager.getRepository(TicketPayment).save(
        manager.getRepository(TicketPayment).create({
          ticketId: ticket.id,
          paymentId: paymentGroup.id
        })
      );

      // Bull Queue Jobs (Không cần transaction vì là side-effect an toàn)
      await this.ticketQueue.add('hold-expire', { ticketId: ticket.id }, { delay: 15 * 60 * 1000 });
      await this.ticketQueue.add('payment-reminder', { ticketId: ticket.id }, { delay: 10 * 60 * 1000 });

      let paymentResponse: any = null;
      const user = await this.userRepo.findById(userId);

      if (paymentMethod === AppPaymentMethod.ZALOPAY) {
        const res = await this.zaloPayService.createOrder(paymentGroup.id, totalAmount, user?.email || 'unknown@user.com', host);
        if (res.return_code === 1) {
          paymentResponse = { payUrl: res.order_url, zpTransToken: res.zp_trans_token, transactionId: res.app_trans_id };
        } else {
          throw new BadRequestException(`ZaloPay Error: ${res.return_message}`);
        }
      } else if (paymentMethod === AppPaymentMethod.VNPAY) {
        paymentResponse = { payUrl: this.vnpayService.createPaymentUrl(paymentGroup.id, totalAmount, '127.0.0.1', host) };
      } else {
        paymentResponse = await this.momoService.createPayment(paymentGroup.id, totalAmount, `Thanh toán vé xe #${ticket.id}`, host);
      }

      if (paymentResponse?.payUrl) {
        const updateData: any = { payUrl: paymentResponse.payUrl };
        if (paymentResponse.transactionId) updateData.transactionId = paymentResponse.transactionId;
        await manager.getRepository(PaymentHistory).update(paymentGroup.id, updateData);
      }

      return {
        message: 'Đặt vé thành công.',
        ticket: ticket as any,
        payment: paymentResponse,
      };
    });
    } catch (error) {
      if (error.message && error.message.includes('ORA-20001')) {
        throw new ConflictException('Lỗi mạng: Tranh chấp vé. Ghế này vừa được một người khác đặt chớp nhoáng trước bạn!');
      }
      throw error;
    }
  }

  async createBulk(dtos: CreateTicketDto[], totalAmountFromClient: number, promotionId?: number, discountAmount?: number, host?: string): Promise<BulkCreateResponse> {
    if (dtos.length === 0) throw new BadRequestException('Empty tickets list');
    const firstDto = dtos[0];

    try {
      return await this.dataSource.transaction(async (manager) => {
      // Validate Promotion if provided
      let validatedPromotionId: number | null = null;
      let validatedDiscountAmount = 0;

      if (promotionId) {
        const promotion = await this.promotionsRepo.findById(promotionId);
        if (!promotion) throw new BadRequestException('Mã khuyến mãi không tồn tại');

        const baseTotal = dtos.reduce((sum, d) => sum + d.price, 0);
        const estimatedSurcharge = dtos.length * (firstDto.dropoffPointId != null ? 0 : 150000);

        const validation = await this.promotionsService.applyPromotion(promotion.code, baseTotal + estimatedSurcharge, firstDto.userId);
        validatedPromotionId = promotion.id;
        validatedDiscountAmount = validation.discountAmount;
      }

      const schedule = await this.scheduleRepo.getScheduleById(firstDto.scheduleId);
      if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

      // ✅ Sắp xếp dtos theo seatId để tránh Deadlock khi 2 giao dịch mua trùng 2 ghế nhưng nghịch thứ tự
      const sortedDtos = [...dtos].sort((a, b) => a.seatId - b.seatId);



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

      // Calculate Base Total and final amount
      let calculatedTotal = dtos.reduce((sum, d) => sum + d.price, 0) + (surcharge * dtos.length);
      calculatedTotal = Math.max(0, calculatedTotal - validatedDiscountAmount);

      const paymentGroup = await manager.getRepository(PaymentHistory).save(
        manager.getRepository(PaymentHistory).create({
          method: firstDto.paymentMethod || AppPaymentMethod.MOMO,
          amount: calculatedTotal,
          status: 'PENDING',
          promotionId: validatedPromotionId || undefined,
          discountAmount: validatedDiscountAmount,
        })
      ) as PaymentHistory;

      const createdTickets: any[] = [];
      for (const dto of dtos) {
        const ticket = await manager.getRepository(Ticket).save(
          manager.getRepository(Ticket).create({
            userId: dto.userId,
            scheduleId: dto.scheduleId,
            seatId: dto.seatId,
            price: dto.price,
            surcharge: surcharge,
            totalPrice: dto.price + surcharge,
            status: TicketStatus.BOOKED,
            paymentMethod: dto.paymentMethod,
            dropoffPointId: finalDropoffPointId,
            dropoffAddress: finalDropoffAddress,
            paymentHistoryId: paymentGroup.id
          })
        ) as Ticket;
        await manager.getRepository(TicketPayment).save(
          manager.getRepository(TicketPayment).create({ ticketId: ticket.id, paymentId: paymentGroup.id })
        );
        createdTickets.push(ticket);
        
        // Add timeout jobs
        await this.ticketQueue.add('hold-expire', { ticketId: ticket.id }, { delay: 15 * 60 * 1000 });
      }

      let paymentResponse: any = null;
      const user = await this.userRepo.findById(firstDto.userId);

      if (firstDto.paymentMethod === AppPaymentMethod.ZALOPAY) {
        const res = await this.zaloPayService.createOrder(paymentGroup.id, calculatedTotal, user?.email || 'unknown@user.com', host);
        if (res.return_code === 1) {
          paymentResponse = { payUrl: res.order_url, zpTransToken: res.zp_trans_token, transactionId: res.app_trans_id };
        }
      } else if (firstDto.paymentMethod === AppPaymentMethod.VNPAY) {
        paymentResponse = { payUrl: this.vnpayService.createPaymentUrl(paymentGroup.id, calculatedTotal, '127.0.0.1', host) };
      } else {
        paymentResponse = await this.momoService.createPayment(paymentGroup.id, calculatedTotal, 'Thanh toan ve tap the', host);
      }

      if (paymentResponse?.payUrl) {
        const updateData: any = { payUrl: paymentResponse.payUrl };
        if (paymentResponse.transactionId) updateData.transactionId = paymentResponse.transactionId;
        await manager.getRepository(PaymentHistory).update(paymentGroup.id, updateData);
      }

      return {
        tickets: createdTickets as any[],
        payment: paymentResponse
      };
    });
    } catch (error) {
      if (error.message && error.message.includes('ORA-20001')) {
        throw new ConflictException('Lỗi mạng: Tranh chấp vé. Một ghế bạn chọn vừa được người khác đặt trước vài giây!');
      }
      throw error;
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

    // Increment Promotion usage if applicable
    if (paymentHistory.promotionId) {
      await this.promotionsRepo.incrementUsage(paymentHistory.promotionId);
      this.logger.log(`📈 Incremented usage count for Promotion #${paymentHistory.promotionId}`);
    }

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

  async getCancellationInfo(id: number) {
    const ticket: any = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    const departureAt = new Date(ticket.schedule.departureAt);
    const now = new Date();
    const diffMs = departureAt.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let isCancelable = true;
    let cancellationFee = 0;
    let refundAmount = 0;
    let message = 'Có thể hủy vé';

    if (diffHours < 2) {
      isCancelable = false;
      message = 'Không thể hủy vé vì chuyến đi khởi hành trong vòng 2 giờ tới';
    } else {
      if (ticket.status === TicketStatus.PAID) {
        if (diffHours >= 24) {
          cancellationFee = ticket.totalPrice * 0.10;
        } else {
          // Between 2 and 24 hours
          cancellationFee = ticket.totalPrice * 0.30;
        }
        refundAmount = ticket.totalPrice - cancellationFee;
        message = 'Bạn sẽ bị trừ phí hủy vé theo quy định';
      } else if (ticket.status === TicketStatus.BOOKED) {
        cancellationFee = 0;
        refundAmount = 0;
        message = 'Hủy vé miễn phí (chưa thanh toán)';
      } else {
        isCancelable = false;
        message = `Không thể hủy vé ở trạng thái ${ticket.status}`;
      }
    }

    return {
      ticketId: ticket.id,
      isCancelable,
      cancellationFee,
      refundAmount,
      message,
      status: ticket.status
    };
  }

  async cancel(id: number) {
    const info = await this.getCancellationInfo(id);

    if (!info.isCancelable) {
      throw new BadRequestException(info.message);
    }

    const updateData: any = {
      status: TicketStatus.CANCELLED,
      cancellationFee: info.cancellationFee,
      refundAmount: info.refundAmount,
      isRefunded: false // explicitly set false when cancelled
    };

    await this.ticketRepo.update(id, updateData);

    // Release the seat
    const ticket: any = await this.ticketRepo.findById(id);
    if (ticket && ticket.seatId) {
      await this.seatRepo.updateAvailability(ticket.seatId, true);
    }

    // TODO: Later on, if there's a real refund API logic with MoMo/ZaloPay, trigger it here.

    return {
      message: 'Hủy vé thành công',
      cancellationFee: info.cancellationFee,
      refundAmount: info.refundAmount
    };
  }

  async processRefund(id: number) {
    const ticket: any = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    if (ticket.status !== TicketStatus.CANCELLED) {
      throw new BadRequestException('Chỉ có thể hoàn tiền cho vé đã bị hủy');
    }

    if (ticket.refundAmount <= 0) {
      throw new BadRequestException('Vé này không có số tiền cần hoàn');
    }

    if (ticket.isRefunded) {
      throw new BadRequestException('Vé này đã được hoàn tiền rồi');
    }

    await this.ticketRepo.update(id, { isRefunded: true });

    return { message: 'Đã xác nhận hoàn tiền thành công' };
  }

  async getAllTickets() {
    return this.ticketRepo.findAllForAdmin();
  }

  async getAllBookingsForAdmin() {
    return this.ticketRepo.findAllForAdmin();
  }
  async getBookingById(id: number) {
    return this.getTicketById(id);
  }
  async getTicketById(id: number) { return this.ticketRepo.findById(id); }

  async getTicketsByBrand(brandId: number) {
    return this.ticketRepo.findByBrandId(brandId);
  }

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
    this.logger.log(`ZaloPay Redirect Query: ${JSON.stringify(query)}`);

    // ZaloPay can send apptransid or app_trans_id depending on the version/environment
    const appTransId = query.apptransid || query.app_trans_id;

    if (!appTransId) {
      this.logger.error('❌ ZaloPay Redirect missing apptransid/app_trans_id');
      return { success: false, message: 'Missing Transaction ID' };
    }

    try {
      // Query status from ZaloPay Server to be absolutely sure
      const status = await this.zaloPayService.queryStatus(appTransId) as any;
      
      // return_code 1 means SUCCESS
      if (status.return_code === 1) {
        const payment = await this.paymentHistoryRepo.findByTransactionId(appTransId);
        
        if (payment && payment.id) {
          // Update status in DB if not already done by IPN/Callback
          await this.payTicket(payment.id, AppPaymentMethod.ZALOPAY, appTransId);
          return { success: true, paymentHistoryId: payment.id };
        } else {
          this.logger.error(`❌ ZaloPay success but PaymentHistory record not found for: ${appTransId}`);
          return { success: false, message: 'Giao dịch thành công nhưng không tìm thấy thông tin đơn hàng.' };
        }
      }
      
      this.logger.warn(`⚠️ ZaloPay status check failed: ${status.return_message}`);
      return { success: false, message: status.return_message || 'Thanh toán không thành công.' };
    } catch (e) {
      this.logger.error(`❌ ZaloPay Verification Failed: ${e.message}`);
      return { success: false, message: 'Lỗi xác thực thanh toán.' };
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

  async getAdminTicketReports() {
    this.logger.log('Fetching ticket reports via Oracle View V_TICKET_DETAILS');
    const reports = await this.dataSource.query('SELECT * FROM V_TICKET_DETAILS');
    return reports;
  }

  async findTicketsByDate(date: string) {
    this.logger.log(`Executing Ultra-Stable JSON Procedure: ${date}`);
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      const connection = (queryRunner as any).databaseConnection;

      if (!connection) {
        throw new Error('Native Oracle connection not available');
      }

      // Passing date as string directly to the procedue (Ultimate Fix)
      const result: any = await connection.execute(
        `BEGIN P_TICKETS_BY_DATE(:p_json, :p_date); END;`,
        {
          p_json: { type: oracledb.DB_TYPE_CLOB, dir: oracledb.BIND_OUT },
          p_date: { val: date, type: oracledb.STRING, dir: oracledb.BIND_IN }
        }
      );
      
      const lob = result.outBinds.p_json;
      let jsonStr = '[]';
      
      if (lob) {
          // Read CLOB content
          jsonStr = await lob.getData();
      }
      
      const data = JSON.parse(jsonStr);
      this.logger.log(`[ORACLE JSON SUCCESS] Received ${data.length} records`);
      return data;
    } catch (error) {
      this.logger.error(`[ORACLE JSON ERROR] ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}