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
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
  ) {}

  async create(dto: CreateTicketDto): Promise<CreateResponse> {
    const { userId, scheduleId, seatId, price } = dto;
    const schedule = await this.prism.schedule.findUnique({
      where: { id: scheduleId },
      include: { bus: { include: { brand: true } } },
    });
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');
    const diffHours =
      (new Date(schedule.departureAt).getTime() - Date.now()) / 3600000;
    if (diffHours < 1)
      throw new BadRequestException('Chỉ được đặt vé trước 1 giờ khởi hành');
    const seat = await this.prism.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.busId !== schedule.busId)
      throw new BadRequestException('Ghế không thuộc xe của lịch trình này');
    const seatBooked = await this.ticketRepo.checkSeatBooked(scheduleId, seatId);
    if (seatBooked) throw new BadRequestException('Ghế đã được đặt');
    const userTickets = await this.ticketRepo.findUserBookedToday(userId);
    if (userTickets >= 8)
      throw new BadRequestException('Chỉ được đặt tối đa 8 vé/ngày');
    const brandTickets = await this.ticketRepo.countBrandSoldToday(
      schedule.bus.brandId,
    );
    if (brandTickets >= schedule.bus.brand.dailyTicketLimit)
      throw new BadRequestException('Hãng xe đã đạt giới hạn vé trong ngày');

    const ticket = await this.ticketRepo.create(dto);
    await this.ticketQueue.add(
      'hold-expire',
      { ticketId: ticket.id },
      { delay: 15 * 60 * 1000 },
    );
    const momoResponse = await this.momoService.createPayment(ticket.id, price);
    return {
      message: 'Đặt vé thành công. Vui lòng thanh toán trong 15 phút.',
      ticket,
      payment: momoResponse,
    };
  }

  async createBulk(
    dtos: CreateTicketDto[],
    totalAmount: number,
  ): Promise<BulkCreateResponse> {
    if (dtos.length === 0) throw new BadRequestException('Danh sách vé trống');

    const firstDto = { ...dtos[0] };
    const firstResult = await this.create(firstDto);
    const bulkTicketId = firstResult.ticket.id;

    const results = [firstResult];

    for (let i = 1; i < dtos.length; i++) {
      const dto = { ...dtos[i], bulkTicketId };
      const result = await this.create(dto);
      results.push(result);
    }

    const momoResponse = await this.momoService.createPayment(
      bulkTicketId,
      totalAmount,
      `Thanh toán ${dtos.length} vé xe - ${totalAmount.toLocaleString('vi-VN')}đ`,
    );

    return {
      tickets: results.map((r) => r.ticket),
      payment: momoResponse,
    };
  }

  async handleMomoRedirect(query: any) {
    this.logger.log(`MoMo Redirect: ${JSON.stringify(query)}`);
    const { resultCode, orderId, transId } = query;
    if (resultCode !== '0') {
      this.logger.warn(`MoMo redirect failed: resultCode=${resultCode}`);
      return { success: false, message: 'Thanh toán thất bại' };
    }
    const match = orderId?.match(/^TICKET_(\d+)_\d+$/);
    if (!match) {
      this.logger.error(`Invalid orderId: ${orderId}`);
      throw new BadRequestException('orderId không hợp lệ');
    }
    const ticketId = Number(match[1]);
    try {
      await this.payTicket(ticketId, AppPaymentMethod.MOMO, transId);
      return { success: true, ticketId };
    } catch (error) {
      this.logger.error(`payTicket failed for ticket #${ticketId}:`, error);
      throw error;
    }
  }

  async handleMomoCallback(data: any) {
    this.logger.log(`MoMo IPN: ${JSON.stringify(data)}`);
    if (data.resultCode !== 0) {
      this.logger.warn(`MoMo callback failed: ${data.message}`);
      return { success: false, message: data.message || 'Thanh toán thất bại' };
    }
    const match = data.orderId.match(/^TICKET_(\d+)_\d+$/);
    if (!match) {
      this.logger.error(`Invalid orderId in callback: ${data.orderId}`);
      return { success: false, message: 'orderId không hợp lệ' };
    }
    const ticketId = Number(match[1]);
    const ticket = await this.prism.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      this.logger.error(`Ticket not found: ${ticketId}`);
      return { success: false, message: 'Vé không tồn tại' };
    }
    if (ticket.status === TicketStatus.PAID) {
      this.logger.log(`Ticket #${ticketId} already paid`);
      return { success: true, ticketId };
    }
    try {
      await this.payTicket(ticketId, AppPaymentMethod.MOMO, data.transId);
      return { success: true, ticketId };
    } catch (error) {
      this.logger.error(
        `payTicket failed in callback for ticket #${ticketId}:`,
        error,
      );
      return { success: false, message: 'Xử lý thanh toán thất bại' };
    }
  }

  async payTicket(id: number, method: AppPaymentMethod, transId?: string) {
    this.logger.log(
      `Bắt đầu thanh toán nhóm vé từ vé đầu #${id} - method: ${method}, transId: ${transId}`,
    );

    const firstTicket = await this.prism.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: true,
            bus: true,
          },
        },
        seat: true,
        user: true,
      },
    });
    if (!firstTicket) throw new NotFoundException('Vé không tồn tại');
    if (firstTicket.status === TicketStatus.PAID)
      throw new BadRequestException('Vé đã thanh toán');

    const diffHours =
      (new Date(firstTicket.schedule.departureAt).getTime() - Date.now()) /
      3600000;
    if (diffHours < 1)
      throw new BadRequestException('Chỉ được thanh toán trước 1 giờ');

    // SỬA: DÙNG bulkTicketId HOẶC id
    const groupTickets = await this.prism.ticket.findMany({
      where: {
        OR: [
          { id: firstTicket.id },
          { bulkTicketId: firstTicket.id },
        ],
        status: TicketStatus.BOOKED,
      },
      include: {
        seat: true,
        user: true,
        schedule: {
          include: {
            route: true,
            bus: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    if (groupTickets.length === 0)
      throw new NotFoundException('Không tìm thấy vé để thanh toán');

    const qrCodeUrl = await this.qrService.generateSecureTicketQR(firstTicket.id);
    const totalAmount = groupTickets.reduce((sum, t) => sum + t.price, 0);
    const payment = await this.prism.paymentHistory.create({
      data: {
        ticketId: firstTicket.id,
        method,
        amount: totalAmount,
        transactionId: transId,
        status: 'SUCCESS',
        qrCode: qrCodeUrl,
      },
    });

    const ticketPaymentData = groupTickets.map((t) => ({
      ticketId: t.id,
      paymentId: payment.id,
    }));
    await this.prism.ticketPayment.createMany({ data: ticketPaymentData });

    const ticketIds = groupTickets.map(t => t.id);
    await this.prism.$transaction([
      ...ticketIds.map((tid) =>
        this.prism.ticket.update({
          where: { id: tid },
          data: { status: TicketStatus.PAID },
        })
      ),
      ...groupTickets.map((t) =>
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
        if (groupTickets.length === 1) {
          await this.emailService.sendTicketEmail(
            firstTicket.user.email,
            firstTicket,
            qrCodeUrl,
          );
        } else {
          await this.emailService.sendBulkTicketEmail(
            firstTicket.user.email,
            groupTickets,
            qrCodeUrl,
          );
        }
      } catch (error) {
        this.logger.error('Gửi email thất bại:', error);
      }
    }

    return {
      message: `Thanh toán thành công ${groupTickets.length} vé!`,
      ticketId: firstTicket.id,
      qrCode: qrCodeUrl,
    };
  }

  async cancel(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: { schedule: true },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');
    if (ticket.status !== TicketStatus.BOOKED)
      throw new BadRequestException('Chỉ được hủy vé đang chờ thanh toán');
    const diffHours =
      (new Date(ticket.schedule.departureAt).getTime() - Date.now()) / 3600000;
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
    return { message: 'Hủy vé thành công', ticketId: id };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }

  async getStatus(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, createdAt: true },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');
    return ticket;
  }

  async getPaymentHistory(ticketId: number): Promise<PaymentHistoryResponse> {
    const payment = await this.prism.paymentHistory.findFirst({
      where: {
        ticketPayments: { some: { ticketId } },
      },
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

    if (
      !payment ||
      !payment.ticketPayments ||
      payment.ticketPayments.length === 0
    )
      throw new NotFoundException('Không tìm thấy lịch sử thanh toán');

    const ticketsInGroup = payment.ticketPayments.map(tp => tp.ticket);
    const firstTicket = ticketsInGroup[0];
    const departure = new Date(firstTicket.schedule.departureAt);
    const paidAt = payment.paidAt;

    return {
      ticketCode: `V${String(firstTicket.id).padStart(6, '0')}`,
      route: `${firstTicket.schedule.route.startPoint} to ${firstTicket.schedule.route.endPoint}`,
      departureTime: `${String(departure.getHours()).padStart(
        2,
        '0',
      )}:${String(departure.getMinutes()).padStart(
        2,
        '0',
      )}, ${departure.toLocaleDateString('vi-VN')}`,
      seatNumber: String(firstTicket.seat.seatNumber), // SỬA: ép kiểu string
      price: `${firstTicket.price.toLocaleString('vi-VN')}đ`,
      paymentMethod: this.formatPaymentMethod(payment.method),
      status: payment.status === 'SUCCESS' ? 'Đã thanh toán' : 'Thất bại',
      paidAt: `${paidAt.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}, ${paidAt.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}`,
      transactionId: payment.transactionId || '—',
      qrCode: payment.qrCode ?? null, // SỬA: ?? null
      bulkTicketIds: ticketsInGroup.map(t => t.id),
    };
  }

  private formatPaymentMethod(method: any): string {
    const map: Record<string, string> = {
      CASH: 'Tiền mặt',
      CREDIT_CARD: 'Thẻ tín dụng',
      MOMO: 'MoMo',
      ZALOPAY: 'ZaloPay',
    };
    return map[method] || method;
  }

  async getTicketById(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: true,
            bus: {
              include: { brand: true },
            },
          },
        },
        seat: true,
        user: true,
      },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');
    return ticket;
  }
}