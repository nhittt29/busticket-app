import { IsInt, IsString, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { BusCategory, SeatType } from '../models/Bus';

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

  @IsInt()
  brandId?: number;
}