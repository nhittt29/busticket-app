// src/services/ticket.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PrismaService } from '../services/prisma.service';
import {
  TicketStatus,
  PaymentMethod as AppPaymentMethod,
} from '../models/Ticket';
import { MomoService } from './momo.service';
import { EmailService } from './email.service';
import { QrService } from './qr.service';
import { ZaloPayService } from './zalopay.service';
import {
  CreateResponse,
  BulkCreateResponse,
  PaymentHistoryResponse,
} from '../dtos/ticket.response.dto';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prism: PrismaService,
    private readonly momoService: MomoService,
    private readonly emailService: EmailService,
    private readonly qrService: QrService,
    private readonly zaloPayService: ZaloPayService,
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
  ) { }

  // ĐẶT VÉ LẺ – KIỂM TRA TOÀN DIỆN: GIỜ KHỞI HÀNH, GHẾ TRÙNG, GIỚI HẠN NGÀY, PHỤ THU TRẢ KHÁCH
  async create(dto: CreateTicketDto): Promise<CreateResponse> {
    const { userId, scheduleId, seatId, price, paymentMethod, dropoffPointId, dropoffAddress } = dto;

    const schedule = await this.prism.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        bus: { include: { brand: true } },
        dropoffPoints: { orderBy: { order: 'asc' } },
      },
    });
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

    const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / 3600000;
    if (diffHours < 1) throw new BadRequestException('Chỉ được đặt vé trước 1 giờ khởi hành');

    const seat = await this.prism.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Ghế không thuộc xe của lịch trình này');

    const seatBooked = await this.ticketRepo.checkSeatBooked(scheduleId, seatId);
    if (seatBooked) throw new BadRequestException('Ghế đã được đặt');

    const userTickets = await this.ticketRepo.findUserBookedToday(userId);
    if (userTickets >= 8) throw new BadRequestException('Chỉ được đặt tối đa 8 vé/ngày');

    const brandTickets = await this.ticketRepo.countBrandSoldToday(schedule.bus.brandId);
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
      throw new BadRequestException('Hãng xe đã đạt giới hạn vé trong ngày');

    // XỬ LÝ ĐIỂM TRẢ + PHỤ THU
    let surcharge = 0;
    let finalDropoffPointId: number | null = null;
    let finalDropoffAddress: string | null = null;

    if (dropoffPointId != null) {
      const point = schedule.dropoffPoints.find(p => p.id === dropoffPointId);
      if (!point) throw new BadRequestException('Điểm trả không hợp lệ');
      surcharge = point.surcharge;
      finalDropoffPointId = point.id;
    } else if (dropoffAddress && dropoffAddress.trim() !== '') {
      surcharge = 150000;
      finalDropoffAddress = dropoffAddress.trim();
    } else {
      const defaultPoint = schedule.dropoffPoints.find(p => p.isDefault);
      finalDropoffPointId = defaultPoint?.id ?? null;
    }

    const totalAmount = price + surcharge;

    const paymentGroup = await this.prism.paymentHistory.create({
      data: {
        method: paymentMethod || AppPaymentMethod.MOMO,
        amount: totalAmount,
        status: 'PENDING',
      },
    });

    const ticket = await this.prism.ticket.create({
      data: {
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
      },
    });

    await this.prism.ticketPayment.create({
      data: { ticketId: ticket.id, paymentId: paymentGroup.id },
    });

    await this.ticketQueue.add(
      'hold-expire',
      { ticketId: ticket.id },
      { delay: 15 * 60 * 1000 },
    );

    let paymentResponse: any = null;

    if (paymentMethod === AppPaymentMethod.ZALOPAY) {
      const user = await this.prism.user.findUnique({ where: { id: userId } });
      const res = await this.zaloPayService.createOrder(
        paymentGroup.id,
        totalAmount,
        user?.email || 'unknown@user.com'
      );
      if (res.return_code === 1) {
        paymentResponse = { payUrl: res.order_url, zpTransToken: res.zp_trans_token };
      } else {
        console.log('ZALOPAY ORDER FAILED:', res);
        throw new BadRequestException(`ZaloPay Error: ${res.return_message}`);
      }
    } else {
      paymentResponse = await this.momoService.createPayment(
        paymentGroup.id,
        totalAmount,
        `Thanh toán vé xe #${ticket.id}${surcharge > 0 ? ' + trả khách' : ''}`,
      );
    }

    if (paymentResponse && paymentResponse.payUrl) {
      await this.prism.paymentHistory.update({
        where: { id: paymentGroup.id },
        data: { payUrl: paymentResponse.payUrl },
      });
    }

    return {
      message: 'Đặt vé thành công. Vui lòng thanh toán trong 15 phút.',
      ticket,
      payment: paymentResponse,
    };
  }

  // ĐẶT NHIỀU VÉ CÙNG LÚC (CHỌN NHIỀU GHẾ) – TỐI ƯU CHO ĐẶT VÉ ONLINE
  async createBulk(
    dtos: CreateTicketDto[],
    totalAmountFromClient: number,
    promotionId?: number,
    discountAmount?: number,
  ): Promise<BulkCreateResponse> {
    if (dtos.length === 0) throw new BadRequestException('Danh sách vé trống');

    const firstDto = dtos[0];
    const schedule = await this.prism.schedule.findUnique({
      where: { id: firstDto.scheduleId },
      include: {
        bus: { include: { brand: true } },
        dropoffPoints: { orderBy: { order: 'asc' } },
      },
    });
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

    const dropoffPointId = firstDto.dropoffPointId;
    const dropoffAddress = firstDto.dropoffAddress?.trim();

    let surchargePerTicket = 0;
    let finalDropoffPointId: number | null = null;
    let finalDropoffAddress: string | null = null;

    if (dropoffPointId != null) {
      const point = schedule.dropoffPoints.find(p => p.id === dropoffPointId);
      if (!point) throw new BadRequestException('Điểm trả không hợp lệ');
      surchargePerTicket = point.surcharge;
      finalDropoffPointId = point.id;
    } else if (dropoffAddress && dropoffAddress !== '') {
      surchargePerTicket = 150000;
      finalDropoffAddress = dropoffAddress;
    } else {
      const defaultPoint = schedule.dropoffPoints.find(p => p.isDefault);
      finalDropoffPointId = defaultPoint?.id ?? null;
    }

    let calculatedTotal = dtos.reduce((sum, d) => sum + d.price, 0) + (surchargePerTicket * dtos.length);

    // Áp dụng giảm giá nếu có
    if (discountAmount && discountAmount > 0) {
      calculatedTotal -= discountAmount;
      if (calculatedTotal < 0) calculatedTotal = 0;
    }

    const paymentGroup = await this.prism.paymentHistory.create({
      data: {
        method: firstDto.paymentMethod || AppPaymentMethod.MOMO,
        amount: calculatedTotal,
        status: 'PENDING',
        promotionId: promotionId || null,
        discountAmount: discountAmount || 0,
      },
    });

    const createdTickets: any[] = [];

    for (const dto of dtos) {
      const diffHours = (new Date(schedule.departureAt).getTime() - Date.now()) / 3600000;
      if (diffHours < 1) throw new BadRequestException('Chỉ được đặt vé trước 1 giờ khởi hành');

      const seat = await this.prism.seat.findUnique({ where: { id: dto.seatId } });
      if (!seat || seat.busId !== schedule.busId)
        throw new BadRequestException('Ghế không thuộc xe');

      const seatBooked = await this.ticketRepo.checkSeatBooked(dto.scheduleId, dto.seatId);
      if (seatBooked) throw new BadRequestException('Ghế đã được đặt');

      const userTickets = await this.ticketRepo.findUserBookedToday(dto.userId);
      if (userTickets >= 8) throw new BadRequestException('Chỉ được đặt tối đa 8 vé/ngày');

      const brandTickets = await this.ticketRepo.countBrandSoldToday(schedule.bus.brandId);
      if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
        throw new BadRequestException('Hãng xe đã đạt giới hạn vé trong ngày');

      const ticketTotal = dto.price + surchargePerTicket;

      const ticket = await this.prism.ticket.create({
        data: {
          userId: dto.userId,
          scheduleId: dto.scheduleId,
          seatId: dto.seatId,
          price: dto.price,
          surcharge: surchargePerTicket,
          totalPrice: ticketTotal,
          status: TicketStatus.BOOKED,
          paymentMethod: dto.paymentMethod || AppPaymentMethod.MOMO,
          dropoffPointId: finalDropoffPointId,
          dropoffAddress: finalDropoffAddress,
          paymentHistoryId: paymentGroup.id,
        },
      });

      await this.prism.ticketPayment.create({
        data: { ticketId: ticket.id, paymentId: paymentGroup.id },
      });

      await this.ticketQueue.add(
        'hold-expire',
        { ticketId: ticket.id },
        { delay: 15 * 60 * 1000 },
      );

      createdTickets.push(ticket);
    }



    let paymentResponse: any = null;

    if (dtos[0].paymentMethod === AppPaymentMethod.ZALOPAY) {
      const user = await this.prism.user.findUnique({ where: { id: dtos[0].userId } });
      const res = await this.zaloPayService.createOrder(
        paymentGroup.id,
        calculatedTotal,
        user?.email || 'unknown@user.com'
      );
      if (res.return_code === 1) {
        paymentResponse = { payUrl: res.order_url, zpTransToken: res.zp_trans_token };
      } else {
        console.log('ZALOPAY ORDER FAILED:', res);
        throw new BadRequestException(`ZaloPay Error: ${res.return_message} (Code: ${res.return_code}, SubCode: ${res.sub_return_code})`);
      }
    } else {
      paymentResponse = await this.momoService.createPayment(
        paymentGroup.id,
        calculatedTotal,
        `Thanh toán ${dtos.length} vé${surchargePerTicket > 0 ? ' + trả khách' : ''} - ${calculatedTotal.toLocaleString('vi-VN')}đ`,
      );
    }

    if (paymentResponse && paymentResponse.payUrl) {
      await this.prism.paymentHistory.update({
        where: { id: paymentGroup.id },
        data: { payUrl: paymentResponse.payUrl },
      });
    }

    return {
      tickets: createdTickets,
      payment: paymentResponse,
    };
  }

  // XỬ LÝ REDIRECT TỪ MOMO SAU KHI KHÁCH THANH TOÁN (THÀNH CÔNG / THẤT BẠI)
  async handleMomoRedirect(query: any) {
    this.logger.log(`MoMo Redirect: ${JSON.stringify(query)}`);
    const { resultCode, orderId, transId } = query;
    if (resultCode !== '0') {
      return { success: false, message: 'Thanh toán thất bại' };
    }
    const match = orderId?.match(/^TICKET_(\d+)_\d+$/);
    if (!match) throw new BadRequestException('orderId không hợp lệ');
    const paymentHistoryId = Number(match[1]);
    try {
      await this.payTicket(paymentHistoryId, AppPaymentMethod.MOMO, transId);
      return { success: true, paymentHistoryId };
    } catch (error) {
      this.logger.error(`payTicket failed for payment #${paymentHistoryId}:`, error);
      throw error;
    }
  }

  // NHẬN CALLBACK (IPN) TỪ MOMO – XÁC NHẬN THANH TOÁN TỪ SERVER MOMO (AN TOÀN NHẤT)
  async handleMomoCallback(data: any) {
    this.logger.log(`MoMo IPN: ${JSON.stringify(data)}`);
    if (data.resultCode !== 0) {
      return { success: false, message: data.message || 'Thanh toán thất bại' };
    }
    const match = data.orderId.match(/^TICKET_(\d+)_\d+$/);
    if (!match) {
      return { success: false, message: 'orderId không hợp lệ' };
    }
    const paymentHistoryId = Number(match[1]);
    const payment = await this.prism.paymentHistory.findUnique({
      where: { id: paymentHistoryId },
    });
    if (!payment) return { success: false, message: 'Không tìm thấy đơn thanh toán' };
    if (payment.status === 'SUCCESS') {
      return { success: true, paymentHistoryId };
    }
    try {
      await this.payTicket(paymentHistoryId, AppPaymentMethod.MOMO, data.transId);
      return { success: true, paymentHistoryId };
    } catch (error) {
      this.logger.error(`payTicket failed in callback:`, error);
      return { success: false, message: 'Xử lý thanh toán thất bại' };
    }
  }

  // XỬ LÝ THANH TOÁN THÀNH CÔNG – CẬP NHẬT TRẠNG THÁI, TẠO QR, GỬI EMAIL, HỦY JOB HẾT HẠN
  async payTicket(paymentHistoryId: number, method: AppPaymentMethod, transId?: string) {
    this.logger.log(`Thanh toán nhóm vé từ paymentHistoryId #${paymentHistoryId}`);
    const paymentHistory = await this.prism.paymentHistory.findUnique({
      where: { id: paymentHistoryId },
      include: {
        ticketPayments: {
          include: {
            ticket: {
              include: {
                seat: true,
                user: true,
                schedule: { include: { route: true, bus: true } },
              },
            },
          },
        },
      },
    });
    if (!paymentHistory) throw new NotFoundException('Không tìm thấy đơn thanh toán');
    if (paymentHistory.status === 'SUCCESS')
      throw new BadRequestException('Đơn đã được thanh toán');

    const groupTickets = paymentHistory.ticketPayments.map(tp => tp.ticket);
    if (groupTickets.length === 0)
      throw new NotFoundException('Không có vé trong nhóm');

    const firstTicket = groupTickets[0];
    const diffHours = (new Date(firstTicket.schedule.departureAt).getTime() - Date.now()) / 3600000;
    if (diffHours < 1)
      throw new BadRequestException('Chỉ được thanh toán trước 1 giờ khởi hành');

    const qrCodeUrl = await this.qrService.generateSecureTicketQR(paymentHistoryId);

    await this.prism.paymentHistory.update({
      where: { id: paymentHistoryId },
      data: {
        method,
        transactionId: transId,
        status: 'SUCCESS',
        qrCode: qrCodeUrl,
        paidAt: new Date(),
      },
    });

    const ticketIds = groupTickets.map(t => t.id);
    await this.prism.$transaction([
      ...ticketIds.map(id =>
        this.prism.ticket.update({
          where: { id },
          data: { status: TicketStatus.PAID },
        })
      ),
      ...groupTickets.map(t =>
        this.prism.seat.update({
          where: { id: t.seatId },
          data: { isAvailable: false },
        })
      ),
    ]);

    const jobs = await this.ticketQueue.getDelayed();
    for (const job of jobs) {
      if (ticketIds.includes(job.data.ticketId)) await job.remove();
    }

    if (firstTicket.user?.email) {
      try {
        await this.emailService.sendUnifiedTicketEmail(
          firstTicket.user.email,
          groupTickets,
          paymentHistoryId,
          qrCodeUrl,
        );
      } catch (error) {
        this.logger.error('Gửi email thất bại:', error);
      }
    }

    return {
      message: `Thanh toán thành công ${groupTickets.length} vé!`,
      paymentHistoryId,
      qrCode: qrCodeUrl,
    };
  }

  // HỦY VÉ (HỖ TRỢ CẢ VÉ ĐÃ THANH TOÁN VÀ CHƯA THANH TOÁN)
  // Đã cập nhật chính sách cho BrandId = 2 (Phương Trang)
  async cancel(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            bus: true // Cần thông tin xe để lấy brandId
          }
        },
        paymentHistory: true
      },
    });

    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    const brandId = ticket.schedule.bus.brandId;
    const now = new Date();
    const departure = new Date(ticket.schedule.departureAt);
    const diffHours = (departure.getTime() - now.getTime()) / 3600000; // Số giờ còn lại trước khi chạy

    // LOGIC RIÊNG CHO PHƯƠNG TRANG (BRAND ID = 2)
    if (brandId === 2) {
      // 1. Nếu vé ĐÃ THANH TOÁN (PAID)
      if (ticket.status === TicketStatus.PAID) {
        if (diffHours < 4) {
          throw new BadRequestException('Phương Trang: Không thể hủy vé trong vòng 4 giờ trước giờ khởi hành.');
        }

        let refundRate = 0;
        let feeRate = 0;

        if (diffHours >= 24) {
          // Hủy trước 24h: Phí 10%
          feeRate = 0.1;
          refundRate = 0.9;
        } else {
          // Từ 4h - 24h: Phí 30%
          feeRate = 0.3;
          refundRate = 0.7;
        }

        const refundAmount = ticket.totalPrice * refundRate;
        const feeAmount = ticket.totalPrice * feeRate;

        // Thực hiện hủy
        await this.prism.$transaction([
          this.prism.ticket.update({
            where: { id },
            data: { status: TicketStatus.CANCELLED },
          }),
          this.prism.seat.update({
            where: { id: ticket.seatId },
            data: { isAvailable: true },
          }),
          // TODO: Tạo record Refund transaction nếu cần
        ]);

        // Có thể gọi Payment Service để hoàn tiền thật (MoMo Refund API) ở đây

        return {
          message: `Hủy vé thành công. Phí hủy ${feeRate * 100}%. Hoàn tiền: ${refundAmount.toLocaleString('vi-VN')}đ`,
          refundAmount,
          feeAmount
        };
      }

      // 2. Nếu vé CHƯA THANH TOÁN (BOOKED)
      // Giữ nguyên logic cũ hoặc cho phép hủy thoải mái trước 4h?
      // Tạm thời áp dụng luật cũ: Hủy trước 2h (hoặc theo luật 4h cho đồng bộ)
      if (ticket.status === TicketStatus.BOOKED) {
        if (diffHours < 2) throw new BadRequestException('Chỉ được hủy vé đặt chỗ trước 2 giờ khởi hành');

        await this.prism.$transaction([
          this.prism.ticket.update({
            where: { id },
            data: { status: TicketStatus.CANCELLED },
          }),
          this.prism.seat.update({
            where: { id: ticket.seatId },
            data: { isAvailable: true },
          }),
        ]);
        return { message: 'Hủy vé đặt chỗ thành công (Không mất phí).' };
      }

    } else {
      // LOGIC CHO CÁC HÃNG KHÁC (Mặc định như cũ)
      if (ticket.status !== TicketStatus.BOOKED)
        throw new BadRequestException('Chỉ hỗ trợ hủy vé đang chờ thanh toán cho hãng xe này');

      if (diffHours < 2)
        throw new BadRequestException('Chỉ được hủy trước 2 giờ');

      await this.prism.$transaction([
        this.prism.ticket.update({
          where: { id },
          data: { status: TicketStatus.CANCELLED },
        }),
        this.prism.seat.update({
          where: { id: ticket.seatId },
          data: { isAvailable: true },
        }),
      ]);
      return { message: 'Hủy vé thành công' };
    }

    throw new BadRequestException('Trạng thái vé không hợp lệ để hủy');
  }

  // LẤY DANH SÁCH VÉ CỦA NGƯỜI DÙNG – TRANG "VÉ CỦA TÔI" TRÊN APP/WEB
  async getTicketsByUser(userId: number) {
    const tickets = await this.ticketRepo.getTicketsByUser(userId);
    return tickets.map(ticket => ({
      ...ticket,
      dropoffInfo: this.formatDropoffInfo(ticket),
    }));
  }

  // LẤY TRẠNG THÁI HIỆN TẠI CỦA MỘT VÉ (BOOKED / PAID / CANCELLED...)
  async getStatus(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, createdAt: true },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');
    return ticket;
  }

  // LẤY THÔNG TIN THANH TOÁN + VÉ (DÙNG CHO TRANG CHI TIẾT VÉ)
  async getPaymentHistory(ticketId: number): Promise<PaymentHistoryResponse> {
    const payment = await this.prism.paymentHistory.findFirst({
      where: { ticketPayments: { some: { ticketId } } },
      include: {
        ticketPayments: {
          include: {
            ticket: {
              include: {
                user: { select: { name: true, phone: true } },
                seat: { select: { seatNumber: true } },
                schedule: {
                  include: {
                    route: { select: { startPoint: true, endPoint: true } },
                    bus: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!payment || payment.ticketPayments.length === 0)
      throw new NotFoundException('Không tìm thấy lịch sử thanh toán');

    const ticketsInGroup = payment.ticketPayments.map(tp => tp.ticket);
    const departure = new Date(ticketsInGroup[0].schedule.departureAt);

    return {
      ticketCode: `V${String(payment.id).padStart(6, '0')}`,
      route: `${ticketsInGroup[0].schedule.route.startPoint} to ${ticketsInGroup[0].schedule.route.endPoint}`,
      departureTime: `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}, ${departure.toLocaleDateString('vi-VN')}`,
      seatNumber: ticketsInGroup.length === 1 ? String(ticketsInGroup[0].seat.seatNumber) : `${ticketsInGroup.length} ghế`,
      price: `${payment.amount.toLocaleString('vi-VN')}đ`,
      paymentMethod: this.formatPaymentMethod(payment.method),
      status: payment.status === 'SUCCESS' ? 'Đã thanh toán' : 'Thất bại',
      paidAt: payment.paidAt
        ? `${payment.paidAt.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${payment.paidAt.toLocaleDateString('vi-VN')}`
        : '—',
      transactionId: payment.transactionId || '—',
      qrCode: payment.qrCode ?? null,
      paymentHistoryId: payment.id,
      ticketIds: ticketsInGroup.map(t => t.id),
      discountAmount: payment.discountAmount || 0,
    };
  }

  // LẤY CHI TIẾT THANH TOÁN THEO PAYMENT HISTORY ID (DÙNG CHO QR, XÁC NHẬN, IN VÉ)
  async getPaymentDetailByHistoryId(paymentHistoryId: number): Promise<any> {
    // Updated to support retrieving tickets via direct relation 'tickets' OR 'ticketPayments'
    const payment = await this.prism.paymentHistory.findUnique({
      where: { id: paymentHistoryId },
      include: {
        ticketPayments: {
          include: {
            ticket: {
              include: {
                seat: { select: { seatNumber: true } },
                schedule: {
                  include: {
                    route: { select: { startPoint: true, endPoint: true } },
                  },
                },
                dropoffPoint: true,
              },
            },
          },
        },
        tickets: { // Add this include
          include: {
            seat: { select: { seatNumber: true } },
            schedule: {
              include: {
                route: { select: { startPoint: true, endPoint: true } },
              },
            },
            dropoffPoint: true,
          },
        }
      },
    });

    if (!payment)
      throw new NotFoundException('Không tìm thấy thông tin thanh toán theo paymentHistoryId');

    // Merge tickets from both relations (deduplicate by ID if necessary, though they should be consistent)
    let ticketsInGroup = payment.ticketPayments.map(tp => tp.ticket);

    // Fallback: If ticketPayments is empty, try using the direct 'tickets' relation
    if (ticketsInGroup.length === 0 && payment.tickets.length > 0) {
      ticketsInGroup = payment.tickets;
    }

    if (ticketsInGroup.length === 0)
      throw new NotFoundException('Không có vé nào trong đơn thanh toán này');

    const firstTicket = ticketsInGroup[0];
    const departure = new Date(firstTicket.schedule.departureAt);

    const sortedSeats = ticketsInGroup
      .map(t => t.seat.seatNumber)
      .sort((a, b) => a - b)
      .join(', ');

    const dropoffInfo = this.formatDropoffInfo(firstTicket);

    const promotion = payment.promotionId
      ? await this.prism.promotion.findUnique({ where: { id: payment.promotionId } })
      : null;

    return {
      startPoint: firstTicket.schedule.route.startPoint,
      endPoint: firstTicket.schedule.route.endPoint,
      departureTime: departure.toISOString(),
      price: payment.amount.toString(),
      qrCode: payment.qrCode,
      status: payment.status === 'SUCCESS' ? 'Đã thanh toán' : 'Chưa thanh toán',
      paidAt: payment.paidAt?.toISOString() || null,
      transactionId: payment.transactionId || null,
      paymentMethod: this.formatPaymentMethod(payment.method),
      ticketCode: `V${String(payment.id).padStart(6, '0')}`,
      seatList: sortedSeats,
      seatCount: ticketsInGroup.length,
      ticketIds: ticketsInGroup.map(t => t.id),
      dropoffInfo: {
        type: dropoffInfo.type,
        display: dropoffInfo.display,
        address: dropoffInfo.address,
        surcharge: dropoffInfo.surcharge,
        surchargeText: dropoffInfo.surchargeText,
      },
      promotionId: payment.promotionId,
      discountAmount: payment.discountAmount,
      promotionCode: promotion?.code,
      promotionDescription: promotion?.description,
    };
  }

  // LẤY TẤT CẢ VÉ TRONG HỆ THỐNG (DÀNH CHO ADMIN HOẶC DEBUG)
  async getAllTickets() {
    const tickets = await this.prism.ticket.findMany({
      include: {
        user: true,
        schedule: {
          include: {
            route: true,
            bus: { include: { brand: true } },
            dropoffPoints: true,
            // ĐÃ XÓA bulkTicketId
          },
        },
        seat: true,
      },
      orderBy: { id: 'asc' },
    });
    return tickets;
  }

  // CHUYỂN ĐỔI TÊN PHƯƠNG THỨC THANH TOÁN SANG TIẾNG VIỆT
  private formatPaymentMethod(method: any): string {
    const map: Record<string, string> = {
      CASH: 'Tiền mặt',
      CREDIT_CARD: 'Thẻ tín dụng',
      MOMO: 'MoMo',
      ZALOPAY: 'ZaloPay',
    };
    return map[method] || method;
  }

  // LẤY CHI TIẾT MỘT VÉ THEO ID – DÙNG CHO TRANG XEM VÉ, IN VÉ
  async getTicketById(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: {
              include: { brand: true },
            },
            bus: { include: { brand: true } },
            dropoffPoints: true,
          },
        },
        seat: true,
        user: true,
        paymentHistory: true,
        dropoffPoint: true,
      },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    return {
      ...ticket,
      dropoffInfo: this.formatDropoffInfo(ticket),
    };
  }

  // FORMAT THÔNG TIN ĐIỂM TRẢ KHÁCH (TRẢ TẬN NƠI / ĐIỂM TRẢ / BẾN ĐÍCH)
  private formatDropoffInfo(ticket: any) {
    if (ticket.dropoffAddress) {
      return {
        type: 'tannoi',
        display: 'Trả tận nơi',
        address: ticket.dropoffAddress,
        surcharge: ticket.surcharge || 150000,
        surchargeText: '+150.000đ',
      };
    }

    if (ticket.dropoffPoint) {
      const point = ticket.dropoffPoint;
      return {
        type: 'diemtra',
        display: point.name,
        address: point.address || point.name,
        surcharge: point.surcharge || 0,
        surchargeText: point.surcharge > 0 ? `+${(point.surcharge / 1000).toFixed(0)}k` : 'Miễn phí',
      };
    }

    return {
      type: 'default',
      display: 'Bến xe đích',
      address: ticket.schedule?.route?.endPoint || 'Bến xe',
      surcharge: 0,
      surchargeText: 'Miễn phí',
    };
  }

  // LẤY DANH SÁCH BOOKING CHO ADMIN – HIỂN THỊ THEO NHÓM THANH TOÁN
  async getAllBookingsForAdmin() {
    const bookings = await this.prism.paymentHistory.findMany({
      include: {
        tickets: {
          include: {
            user: true,
            schedule: {
              include: {
                route: true,
                bus: { include: { brand: true } },
                dropoffPoints: true,
              },
            },
            seat: true,
            dropoffPoint: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(booking => {
      const firstTicket = booking.tickets[0];
      if (!firstTicket) return null;

      return {
        id: booking.id,
        ticketCode: `V${String(booking.id).padStart(6, '0')}`,
        user: firstTicket.user,
        schedule: firstTicket.schedule,
        seatCount: booking.tickets.length,
        seatList: booking.tickets.map(t => t.seat.seatNumber).sort((a, b) => a - b).join(', '),
        totalPrice: booking.amount,
        status: booking.status === 'SUCCESS' ? TicketStatus.PAID : (booking.status === 'PENDING' ? TicketStatus.BOOKED : TicketStatus.CANCELLED),
        createdAt: booking.createdAt,
        paymentMethod: booking.method,
        tickets: booking.tickets,
        promotionId: booking.promotionId,
        discountAmount: booking.discountAmount,
      };
    }).filter(Boolean);
  }

  // LẤY CHI TIẾT MỘT BOOKING THEO ID – DÀNH CHO ADMIN XEM ĐƠN
  async getBookingById(id: number) {
    const booking = await this.prism.paymentHistory.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            user: true,
            schedule: {
              include: {
                route: true,
                bus: { include: { brand: true } },
                dropoffPoints: true,
              },
            },
            seat: true,
            dropoffPoint: true,
          },
        },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const firstTicket = booking.tickets[0];
    if (!firstTicket) throw new NotFoundException('Booking has no tickets');

    return {
      id: booking.id,
      ticketCode: `V${String(booking.id).padStart(6, '0')}`,
      user: firstTicket.user,
      schedule: firstTicket.schedule,
      seatCount: booking.tickets.length,
      seatList: booking.tickets.map(t => t.seat.seatNumber).sort((a, b) => a - b).join(', '),
      totalPrice: booking.amount,
      status: booking.status === 'SUCCESS' ? TicketStatus.PAID : (booking.status === 'PENDING' ? TicketStatus.BOOKED : TicketStatus.CANCELLED),
      createdAt: booking.createdAt,
      paymentMethod: booking.method,
      tickets: booking.tickets,
      promotionId: booking.promotionId,
      discountAmount: booking.discountAmount,
    };
  }
}