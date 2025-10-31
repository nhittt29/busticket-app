import { IsInt, IsString, IsEnum, Min, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { BusCategory, SeatType, BerthType } from '../models/Bus';

export class CreateBusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsInt()
  @Min(1)
  seatCount: number;

  @IsEnum(BusCategory)
  category: BusCategory;

  @IsEnum(SeatType)
  seatType: SeatType;

  @IsOptional()
  @IsEnum(BerthType)
  berthType?: BerthType; // Chỉ dùng cho BERTH

  @IsNumber()
  @Min(0)
  price: number; // Giá vé do bạn tự gán

  @IsInt()
  @Min(1)
  brandId: number;
}

export class UpdateBusDto {
  @IsString()
  name?: string;

  @IsString()
  licensePlate?: string;

  @IsInt()
  @Min(1)
  seatCount?: number;

  @IsEnum(BusCategory)
  category?: BusCategory;

  @IsEnum(SeatType)
  seatType?: SeatType;

  @IsOptional()
  @IsEnum(BerthType)
  berthType?: BerthType;

  @IsNumber()
  price?: number;

  @IsInt()
  brandId?: number;
}