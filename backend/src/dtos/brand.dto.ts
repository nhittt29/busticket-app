import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
