import { Body, Controller, Delete, Get, Param, Post, Query, Redirect, Logger, BadRequestException, ParseIntPipe } from '@nestjs/common';
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

  @Redirect()
  @Get('zalopay/redirect')
  async zalopayRedirect(@Query() query: any) {
    const result = await this.ticketService.handleZaloPayRedirect(query);
    if (result.success) {
      // Redirect to Web Frontend
      return { url: `http://localhost:3000/payment/success?paymentId=${result.paymentHistoryId}` };
    }
    return { url: `http://localhost:3000/payment/failed?message=${encodeURIComponent(result.message || 'Unknown Error')}` };
  }

  // CHỦ ĐỘNG KIỂM TRA TRẠNG THÁI THANH TOÁN ZALOPAY (POLLING)
  @Post(':id/check-zalopay')
  async checkZaloPayStatus(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.checkZaloPayStatus(id);
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
  async getBookingById(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.getBookingById(id);
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
  async getTicketById(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.getTicketById(id);
  }

  @Redirect()
  @Get('momo/redirect')
  async momoRedirect(@Query() query: any) {
    const result = await this.ticketService.handleMomoRedirect(query);
    if (!result.success) {
      return { url: `http://localhost:3000/payment/failed` };
    }
    return { url: `http://localhost:3000/payment/success?paymentId=${result.paymentHistoryId}` };
  }

  @Post('momo/callback')
  momoCallback(@Body() data: any) {
    return this.ticketService.handleMomoCallback(data);
  }

  @Redirect()
  @Get('vnpay/return')
  async vnpayReturn(@Query() query: any) {
    const result = await this.ticketService.handleVnPayReturn(query);
    if (result.success) {
      return { url: `http://localhost:3000/payment/success?paymentId=${result.paymentHistoryId}` };
    }
    return { url: `http://localhost:3000/payment/failed?message=${encodeURIComponent(result.message || 'Unknown Error')}` };
  }

  @Delete(':id')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.cancel(id);
  }

  @Post(':id/pay')
  pay(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.payTicket(id, PaymentMethod.CASH);
  }

  @Get('user/:userId')
  getUserTickets(@Param('userId', ParseIntPipe) userId: number) {
    return this.ticketService.getTicketsByUser(userId);
  }

  @Get(':id/status')
  getStatus(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.getStatus(id);
  }

  @Get(':id/payment')
  async getPaymentHistory(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.getPaymentHistory(id);
  }

  @Get('/payments/history/:paymentHistoryId')
  async getPaymentDetailByHistoryId(@Param('paymentHistoryId', ParseIntPipe) id: number) {
    return this.ticketService.getPaymentDetailByHistoryId(id);
  }
}
