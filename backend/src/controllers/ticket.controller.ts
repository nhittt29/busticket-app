// src/controllers/ticket.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Query, Redirect } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PaymentMethod } from '../models/Ticket';
import { BulkCreateResponse } from '../dtos/ticket.response.dto';
import { PrismaService } from '../services/prisma.service';

@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly prism: PrismaService,
  ) { }

  // LẤY DANH SÁCH TẤT CẢ VÉ TRONG HỆ THỐNG (DÙNG CHO ADMIN HOẶC DEBUG)
  @Get()
  async findAll() {
    return this.ticketService.getAllTickets();
  }

  // LẤY TOÀN BỘ BOOKING (ĐƠN ĐẶT VÉ) - DÀNH RIÊNG CHO ADMIN QUẢN LÝ
  @Get('bookings')
  async getAllBookings() {
    return this.ticketService.getAllBookingsForAdmin();
  }

  // LẤY CHI TIẾT MỘT BOOKING THEO ID (QUẢN LÝ ĐƠN HÀNG)
  @Get('bookings/:id')
  async getBookingById(@Param('id') id: string) {
    return this.ticketService.getBookingById(Number(id));
  }

  // TẠO MỘT VÉ ĐƠN LẺ (THƯỜNG DÙNG CHO THANH TOÁN CASH TẠI QUẦY)
  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  // TẠO NHIỀU VÉ CÙNG LÚC (ĐẶT NHIỀU GHẾ TRONG 1 LẦN - CHÍNH CHO ĐẶT VÉ ONLINE)
  @Post('bulk')
  async createBulk(@Body() dto: {
    tickets: CreateTicketDto[];
    totalAmount: number;
    promotionId?: number;
    discountAmount?: number;
  }): Promise<BulkCreateResponse> {
    return this.ticketService.createBulk(dto.tickets, dto.totalAmount, dto.promotionId, dto.discountAmount);
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT VÉ THEO ID
  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return this.ticketService.getTicketById(Number(id));
  }

  // XỬ LÝ REDIRECT TỪ MOMO SAU KHI THANH TOÁN (THÀNH CÔNG / THẤT BẠI)
  @Redirect()
  @Get('momo/redirect')
  async momoRedirect(@Query() query: any) {
    const result = await this.ticketService.handleMomoRedirect(query);
    if (!result.success) {
      return { url: `busticket://payment-failed` };
    }
    return { url: `busticket://payment-success?paymentId=${result.paymentHistoryId}` };
  }

  // NHẬN CALLBACK TỪ MOMO (IPN - XÁC NHẬN THANH TOÁN TỪ SERVER MOMO)
  @Post('momo/callback')
  momoCallback(@Body() data: any) {
    return this.ticketService.handleMomoCallback(data);
  }

  // HỦY VÉ (ADMIN HOẶC KHÁCH HÀNG - TÙY QUYỀN)
  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.ticketService.cancel(Number(id));
  }

  // THANH TOÁN VÉ BẰNG TIỀN MẶT (TẠI QUẦY HOẶC NHÀ XE)
  @Post(':id/pay')
  pay(@Param('id') id: string) {
    return this.ticketService.payTicket(Number(id), PaymentMethod.CASH);
  }

  // LẤY DANH SÁCH VÉ CỦA MỘT NGƯỜI DÙNG (TRANG "VÉ CỦA TÔI")
  @Get('user/:userId')
  getUserTickets(@Param('userId') userId: string) {
    return this.ticketService.getTicketsByUser(Number(userId));
  }

  // LẤY TRẠNG THÁI HIỆN TẠI CỦA VÉ (ĐÃ THANH TOÁN / CHƯA THANH TOÁN / ĐÃ HỦY...)
  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.ticketService.getStatus(Number(id));
  }

  // LẤY LỊCH SỬ THANH TOÁN CỦA MỘT VÉ
  @Get(':id/payment')
  async getPaymentHistory(@Param('id') id: string) {
    return this.ticketService.getPaymentHistory(Number(id));
  }

  // LẤY CHI TIẾT GIAO DỊCH THEO PAYMENT HISTORY ID (DÙNG CHO MOMO CALLBACK, XEM CHI TIẾT)
  @Get('/payments/history/:paymentHistoryId')
  async getPaymentDetailByHistoryId(@Param('paymentHistoryId') id: string) {
    return this.ticketService.getPaymentDetailByHistoryId(Number(id));
  }
}