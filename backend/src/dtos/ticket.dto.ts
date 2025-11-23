// src/dtos/ticket.dto.ts
import { IsEnum, IsInt, IsNotEmpty, Min, IsOptional, IsString } from 'class-validator';
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

  // === TÍCH HỢP ĐIỂM TRẢ KHÁCH ===
  @IsOptional()
  @IsInt()
  dropoffPointId?: number;         // Chọn điểm trả có sẵn

  @IsOptional()
  @IsString()
  dropoffAddress?: string;         // Dùng khi chọn "Tận nơi" (phụ thu mặc định 150k)
}