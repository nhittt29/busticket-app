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

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prisma: PrismaService,
    private readonly momoService: MomoService,
    private readonly emailService: EmailService,
    private readonly qrService: QrService,
    @InjectQueue('ticket') private readonly ticketQueue: Queue,
  ) {}

  async create(dto: CreateTicketDto): Promise<any> {
    const { userId, scheduleId, seatId, price } = dto;

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bus: { include: { brand: true } } },
    });
    if (!schedule) throw new NotFoundException('Lịch trình không tồn tại');

    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
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
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
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

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: true,
          },
        },
        seat: true,
        user: true,
      },
    });

    if (!ticket) {
      this.logger.error(`Ticket #${id} not found in payTicket`);
      throw new NotFoundException('Vé không tồn tại');
    }
    if (ticket.status === TicketStatus.PAID) {
      this.logger.warn(`Ticket #${id} already paid`);
      throw new BadRequestException('Vé đã thanh toán');
    }

    const diffHours = (new Date(ticket.schedule.departureAt).getTime() - Date.now()) / (3600000);
    if (diffHours < 1) {
      this.logger.warn(`Too close to departure: ${diffHours}h`);
      throw new BadRequestException('Chỉ được thanh toán trước 1 giờ');
    }

    // DÙNG SECURE QR
    const qrCodeUrl = await this.qrService.generateSecureTicketQR(id);

    let payment;
    try {
      payment = await this.prisma.paymentHistory.create({
        data: {
          ticketId: id,
          method,
          amount: ticket.price,
          transactionId: transId,
          status: 'SUCCESS',
          qrCode: qrCodeUrl,
        },
      });
      this.logger.log(`PaymentHistory created: #${payment.id}`);
    } catch (error) {
      this.logger.error('Failed to create PaymentHistory:', error);
      throw error;
    }

    try {
      await this.prisma.$transaction([
        this.prisma.ticket.update({
          where: { id },
          data: {
            status: TicketStatus.PAID,
            paymentId: payment.id,
          },
        }),
        this.prisma.seat.update({
          where: { id: ticket.seatId },
          data: { isAvailable: false },
        }),
      ]);
      this.logger.log(`Ticket #${id} đã chuyển thành PAID, paymentId = ${payment.id}`);
    } catch (error) {
      this.logger.error('Transaction failed:', error);
      throw error;
    }

    // XÓA JOB HỦY
    const jobs = await this.ticketQueue.getDelayed();
    for (const job of jobs) {
      if (job.data.ticketId === id) {
        await job.remove();
        this.logger.log(`Job hold-expire cho vé #${id} đã bị xóa`);
      }
    }

    // GỬI EMAIL – AN TOÀN VỚI NULL
    if (ticket.user?.email) {
      try {
        await this.emailService.sendTicketEmail(
          ticket.user.email,
          ticket, // ← ĐÃ ĐÚNG: truyền nguyên ticket (đã include user, schedule, seat)
          qrCodeUrl,
        );
        this.logger.log(`Email đã gửi đến: ${ticket.user.email}`);
      } catch (error) {
        this.logger.error(`Email failed:`, error);
        // Không throw → không làm hỏng thanh toán
      }
    } else {
      this.logger.warn(`Không gửi email: user không có email (userId: ${ticket.userId})`);
    }

    this.logger.log(`Thanh toán vé #${id} HOÀN TẤT`);
    return { message: 'Thanh toán thành công', ticketId: id, qrCode: qrCodeUrl };
  }

  async cancel(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { schedule: true },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');

    const diffHours = (new Date(ticket.schedule.departureAt).getTime() - Date.now()) / (3600000);
    if (diffHours < 2) throw new BadRequestException('Chỉ được hủy trước 2 giờ');

    await this.prisma.$transaction([
      this.prisma.ticket.update({ where: { id }, data: { status: TicketStatus.CANCELLED } }),
      this.prisma.seat.update({ where: { id: ticket.seatId }, data: { isAvailable: true } }),
    ]);

    this.logger.log(`Ticket #${id} đã được hủy`);
    return { message: 'Hủy vé thành công', ticketId: id };
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.getTicketsByUser(userId);
  }

  async getStatus(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, paymentId: true, createdAt: true },
    });
    if (!ticket) throw new NotFoundException('Vé không tồn tại');
    return ticket;
  }

  async getPaymentHistory(ticketId: number) {
    return this.prisma.paymentHistory.findUnique({
      where: { ticketId },
      include: { ticket: { include: { user: true, schedule: true } } },
    });
  }
}