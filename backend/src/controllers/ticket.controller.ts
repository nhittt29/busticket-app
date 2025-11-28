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

  @Get()
  async findAll() {
    return this.ticketService.getAllTickets();
  }

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Post('bulk')
  async createBulk(@Body() dto: { tickets: CreateTicketDto[]; totalAmount: number }): Promise<BulkCreateResponse> {
    return this.ticketService.createBulk(dto.tickets, dto.totalAmount);
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return this.ticketService.getTicketById(Number(id));
  }

  @Get('momo/redirect')
  @Redirect()
  async momoRedirect(@Query() query: any) {
    const result = await this.ticketService.handleMomoRedirect(query);
    if (!result.success) {
      return { url: `${process.env.FRONTEND_URL}/payment-failed` };
    }
    return { url: `${process.env.FRONTEND_URL}/payment-success?paymentId=${result.paymentHistoryId}` };
  }

  @Post('momo/callback')
  momoCallback(@Body() data: any) {
    return this.ticketService.handleMomoCallback(data);
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