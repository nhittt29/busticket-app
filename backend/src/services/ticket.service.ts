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
import { TicketStatus, PaymentMethod } from '../models/Ticket';
import { MomoService } from './momo.service';
import { EmailService } from './email.service';
import { QrService } from './qr.service';
import { CreateResponse, BulkCreateResponse } from '../dtos/ticket.response.dto';

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

    const ticket = await this.ticketRepo.create(dto);

    await this.ticketQueue.add('hold-expire', { ticketId: ticket.id }, { delay: 15 * 60 * 1000 });

    const momoResponse = await this.momoService.createPayment(ticket.id, price);

    return {
      message: 'Đặt vé thành công. Vui lòng thanh toán trong 15 phút.',
      ticket,
      payment: momoResponse,
    };
  }

  async createBulk(dtos: CreateTicketDto[], totalAmount: number): Promise<BulkCreateResponse> {
    const results: CreateResponse[] = [];
    for (const dto of dtos) {
      const result = await this.create(dto);
      results.push(result);
    }

    const firstTicketId = results[0].ticket.id;
    const momoResponse = await this.momoService.createPayment(
      firstTicketId,
      totalAmount,
      `Thanh toán ${results.length} vé xe - ${totalAmount.toLocaleString('vi-VN')}đ`
    );

    return {
      tickets: results.map(r => r.ticket),
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
      await this.payTicket(ticketId, PaymentMethod.MOMO, transId);
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
      await this.payTicket(ticketId, PaymentMethod.MOMO, data.transId);
      return { success: true, ticketId };
    } catch (error) {
      this.logger.error(`payTicket failed in callback for ticket #${ticketId}:`, error);
      return { success: false, message: 'Xử lý thanh toán thất bại' };
    }
  }

  async payTicket(id: number, method: PaymentMethod, transId?: string) {
    this.logger.log(`Bắt đầu thanh toán vé #${id} - method: ${method}, transId: ${transId}`);

    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: true, // ĐÃ THÊM: LẤY startPoint, endPoint
            bus: {
              include: {
                brand: true,
              },
            },
          },
        },
        seat: true,
        user: true,
      },
    });

    if (!ticket) throw new NotFoundException('Vé không tồn tại');
    if (ticket.status === TicketStatus.PAID)
      throw new BadRequestException('Vé đã thanh toán');

    const diffHours = (new Date(ticket.schedule.departureAt).getTime() - Date.now()) / 3600000;
    if (diffHours < 1) throw new BadRequestException('Chỉ được thanh toán trước 1 giờ');

    const qrCodeUrl = await this.qrService.generateSecureTicketQR(id);

    const payment = await this.prism.paymentHistory.create({
      data: {
        ticketId: id,
        method,
        amount: ticket.price,
        transactionId: transId,
        status: 'SUCCESS',
        qrCode: qrCodeUrl,
      },
    });

    await this.prism.$transaction([
      this.prism.ticket.update({
        where: { id },
        data: { status: TicketStatus.PAID, paymentId: payment.id },
      }),
      this.prism.seat.update({
        where: { id: ticket.seatId },
        data: { isAvailable: false },
      }),
    ]);

    const jobs = await this.ticketQueue.getDelayed();
    for (const job of jobs) {
      if (job.data.ticketId === id) await job.remove();
    }

    if (ticket.user?.email) {
      try {
        await this.emailService.sendTicketEmail(ticket.user.email, ticket, qrCodeUrl);
      } catch {}
    }

    return { message: 'Thanh toán thành công', ticketId: id, qrCode: qrCodeUrl };
  }

  async cancel(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: { schedule: true },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    const diffHours = (new Date(ticket.schedule.departureAt).getTime() - Date.now()) / 3600000;
    if (diffHours < 2) throw new BadRequestException('Chỉ được hủy trước 2 giờ');

    await this.prism.$transaction([
      this.prism.ticket.update({ where: { id }, data: { status: TicketStatus.CANCELLED } }),
      this.prism.seat.update({ where: { id: ticket.seatId }, data: { isAvailable: true } }),
    ]);

    return { message: 'Hủy vé thành công', ticketId: id };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }

  async getStatus(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, paymentId: true, createdAt: true },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');
    return ticket;
  }

  async getPaymentHistory(ticketId: number) {
    return this.prism.paymentHistory.findUnique({
      where: { ticketId },
      include: { ticket: { include: { user: true, schedule: true } } },
    });
  }

  // ĐÃ THÊM HÀM NÀY → SỬA LỖI 2339
  async getTicketById(id: number) {
    const ticket = await this.prism.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: true, // LẤY startPoint, endPoint
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