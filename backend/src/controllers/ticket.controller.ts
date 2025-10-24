import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dtos/ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.ticketService.cancel(Number(id));
  }
}
