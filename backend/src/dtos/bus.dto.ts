import { IsInt, IsString, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { BusType } from '../models/Bus';

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

  @IsEnum(BusType)
  type: BusType;

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
  seatCount?: number;

  @IsEnum(BusType)
  type?: BusType;

  @IsInt()
  brandId?: number;
}
