import { Body, Controller, Delete, Get, Param, Post, Query, Redirect, Logger, BadRequestException, ParseIntPipe, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PaymentMethod } from '../models/Ticket';
import { BulkCreateResponse } from '../dtos/ticket.response.dto';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
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
  async zalopayRedirect(@Query() query: any, @Req() req: any) {
    const host = req.headers.host;
    const frontendBase = host?.replace(':4000', ':3000') || 'localhost:3000';
    
    const result = await this.ticketService.handleZaloPayRedirect(query);
    if (result.success) {
      // Redirect to Web Frontend
      return { url: `http://${frontendBase}/payment/success?paymentId=${result.paymentHistoryId}` };
    }
    return { url: `http://${frontendBase}/payment/failed?message=${encodeURIComponent(result.message || 'Unknown Error')}` };
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

  @Get('my-brand')
  @UseGuards(FirebaseAuthGuard)
  async getMyBrandTickets(@Req() req: any) {
    const brandId = req.user?.dbUser?.brandId;
    if (!brandId) {
      throw new UnauthorizedException('Người dùng không thuộc nhà xe nào.');
    }
    return this.ticketService.getTicketsByBrand(brandId);
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
  create(@Body() dto: CreateTicketDto, @Req() req: any) {
    const host = req.headers.host;
    return this.ticketService.create(dto, host);
  }

  @Post('bulk')
  async createBulk(@Body() dto: {
    tickets: CreateTicketDto[];
    totalAmount: number;
    promotionId?: number;
    discountAmount?: number;
  }, @Req() req: any): Promise<BulkCreateResponse> {
    const host = req.headers.host;
    return this.ticketService.createBulk(dto.tickets, dto.totalAmount, dto.promotionId, dto.discountAmount, host);
  }

  @Get(':id')
  async getTicketById(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.getTicketById(id);
  }

  @Redirect()
  @Get('momo/redirect')
  async momoRedirect(@Query() query: any, @Req() req: any) {
    const host = req.headers.host;
    // Host will be IP:PORT. We need the frontend port which is usually 3000.
    // If backend is on 4000, we replace it with 3000 for frontend redirect.
    const frontendBase = host?.replace(':4000', ':3000') || 'localhost:3000';
    
    const result = await this.ticketService.handleMomoRedirect(query);
    if (!result.success) {
      return { url: `http://${frontendBase}/payment/failed` };
    }
    return { url: `http://${frontendBase}/payment/success?paymentId=${result.paymentHistoryId}` };
  }

  @Post('momo/callback')
  momoCallback(@Body() data: any) {
    return this.ticketService.handleMomoCallback(data);
  }

  @Redirect()
  @Get('vnpay/return')
  async vnpayReturn(@Query() query: any, @Req() req: any) {
    const host = req.headers.host;
    const frontendBase = host?.replace(':4000', ':3000') || 'localhost:3000';

    const result = await this.ticketService.handleVnPayReturn(query);
    if (result.success) {
      return { url: `http://${frontendBase}/payment/success?paymentId=${result.paymentHistoryId}` };
    }
    return { url: `http://${frontendBase}/payment/failed?message=${encodeURIComponent(result.message || 'Unknown Error')}` };
  }

  @Get(':id/cancellation-info')
  getCancellationInfo(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.getCancellationInfo(id);
  }

  @Delete(':id')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.cancel(id);
  }

  @Post(':id/refund')
  processRefund(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.processRefund(id);
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
