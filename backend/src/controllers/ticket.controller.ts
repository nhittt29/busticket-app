// src/controllers/ticket.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Query, Redirect } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PaymentMethod } from '../models/Ticket';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Get('momo/redirect')
  @Redirect()
  async momoRedirect(@Query() query: any) {
    const result = await this.ticketService.handleMomoRedirect(query);
    return result.success
      ? { url: `${process.env.FRONTEND_URL}/payment-success?ticketId=${result.ticketId}` }
      : { url: `${process.env.FRONTEND_URL}/payment-failed` };
  }

  @Post('momo/callback')
  momoCallback(@Body() data: any) {
    return this.ticketService.handleMomoCallback(data);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.ticketService.cancel(Number(id));
  }

  // SỬA: GỌI PUBLIC METHOD + DÙNG ENUM
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
  getPaymentHistory(@Param('id') id: string) {
    return this.ticketService.getPaymentHistory(Number(id));
  }
}