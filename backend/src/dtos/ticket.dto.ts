// src/dtos/ticket.dto.ts
import { IsEnum, IsInt, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { PaymentMethod } from '../models/Ticket';

export class CreateTicketDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  scheduleId: number;

  @IsInt()
  @IsNotEmpty()
  seatId: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}