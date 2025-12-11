// src/dtos/dropoff-point.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDropoffPointDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  surcharge: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priceDifference?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  order?: number;
}

export class UpdateDropoffPointDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  surcharge?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priceDifference?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  order?: number;
}