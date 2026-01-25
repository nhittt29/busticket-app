import { Body, Controller, Delete, Get, Param, Post, Query, Redirect, Logger, BadRequestException } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PaymentMethod } from '../models/Ticket';
import { BulkCreateResponse } from '../dtos/ticket.response.dto';
// import { PrismaService } from '../services/prisma.service'; // REMOVED
import { ZaloPayService } from '../services/zalopay.service';
import { Inject, forwardRef } from '@nestjs/common';

@Controller('tickets')
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(
    private readonly ticketService: TicketService,
    // private readonly prism: PrismaService, // REMOVED
    @Inject(forwardRef(() => ZaloPayService)) private readonly zaloPayService: ZaloPayService,
  ) { }

  @Post('zalopay/callback')
  zalopayCallback(@Body() data: any) {
    this.logger.log(`ZaloPay Callback Received: ${JSON.stringify(data)}`);
    return this.zaloPayService.handleCallback(data);
  }

  @Get('zalopay/redirect')
  async zalopayRedirect(@Query() query: any) {
    const result = await this.ticketService.handleZaloPayRedirect(query);
    if (result.success) {
      return { url: `busticket://payment-success?paymentId=${result.paymentHistoryId}` };
    }
    return { url: `busticket://payment-failed?message=${encodeURIComponent(result.message || 'Unknown Error')}` };
  }

  // CHỦ ĐỘNG KIỂM TRA TRẠNG THÁI THANH TOÁN ZALOPAY (POLLING)
  @Post(':id/check-zalopay')
  async checkZaloPayStatus(@Param('id') id: string) {
    // Logic moved to Service or minimal wrapper here using Service
    // Since TicketService has access to Repos, better there.
    // But ZaloPayService has queryStatus?
    // ZaloPayService is injected here.

    const paymentHistoryId = Number(id);
    return this.ticketService.checkZaloPayStatus(paymentHistoryId);
  }

  @Get()
  async findAll() {
    return this.ticketService.getAllTickets();
  }

  @Get('bookings')
  async getAllBookings() {
    return this.ticketService.getAllBookingsForAdmin();
  }

  @Get('bookings/:id')
  async getBookingById(@Param('id') id: string) {
    return this.ticketService.getBookingById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Post('bulk')
  async createBulk(@Body() dto: {
    tickets: CreateTicketDto[];
    totalAmount: number;
    promotionId?: number;
    discountAmount?: number;
  }): Promise<BulkCreateResponse> {
    return this.ticketService.createBulk(dto.tickets, dto.totalAmount, dto.promotionId, dto.discountAmount);
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return this.ticketService.getTicketById(Number(id));
  }

  @Redirect()
  @Get('momo/redirect')
  async momoRedirect(@Query() query: any) {
    const result = await this.ticketService.handleMomoRedirect(query);
    if (!result.success) {
      return { url: `busticket://payment-failed` };
    }
    return { url: `busticket://payment-success?paymentId=${result.paymentHistoryId}` };
  }

  @Post('momo/callback')
  momoCallback(@Body() data: any) {
    return this.ticketService.handleMomoCallback(data);
  }

  @Get('vnpay/return')
  async vnpayReturn(@Query() query: any) {
    const result = await this.ticketService.handleVnPayReturn(query);
    if (result.success) {
      return { url: `busticket://payment-success?paymentId=${result.paymentHistoryId}` };
    }
    return { url: `busticket://payment-failed?message=${encodeURIComponent(result.message || 'Unknown Error')}` };
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.ticketService.cancel(Number(id));
  }

  @Post(':id/pay')
  pay(@Param('id') id: string) {
    return this.ticketService.payTicket(Number(id), PaymentMethod.CASH);
  }

  @Get('user/:userId')
  getUserTickets(@Param('userId') userId: string) {
    return this.ticketService.getTicketsByUser(Number(userId));
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.ticketService.getStatus(Number(id));
  }

  @Get(':id/payment')
  async getPaymentHistory(@Param('id') id: string) {
    return this.ticketService.getPaymentHistory(Number(id));
  }

  @Get('/payments/history/:paymentHistoryId')
  async getPaymentDetailByHistoryId(@Param('paymentHistoryId') id: string) {
    return this.ticketService.getPaymentDetailByHistoryId(Number(id));
  }
}