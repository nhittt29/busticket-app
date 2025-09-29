import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';
import { IsStrongPassword } from '../validators/password.validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsStrongPassword()
  password: string;

  @IsString({ message: 'Tên không được để trống' })
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại không hợp lệ' })
  phone?: string;
}
