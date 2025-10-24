import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsInt()
  @Min(1)
  dailyTicketLimit: number; // ✅ Thêm dòng này
}

export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  dailyTicketLimit?: number; // ✅ Thêm dòng này
}
