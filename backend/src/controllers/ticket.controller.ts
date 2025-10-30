// src/controllers/ticket.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Query, Redirect } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dtos/ticket.dto';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  // REDIRECT TỪ MOMO
  @Get('momo/redirect')
  @Redirect()
  async momoRedirect(@Query() query: any) {
    const result = await this.ticketService.handleMomoRedirect(query);
    if (result.success) {
      return { url: `http://localhost:3000/payment-success?ticketId=${result.ticketId}` };
    } else {
      return { url: `http://localhost:3000/payment-failed` };
    }
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
    return this.ticketService.payTicket(Number(id));
  }

  @Get('user/:userId')
  getUserTickets(@Param('userId') userId: string) {
    return this.ticketService.getTicketsByUser(Number(userId));
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.ticketService.getStatus(Number(id));
  }
}