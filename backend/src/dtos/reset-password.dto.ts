// src/dtos/reset-password.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'UID là bắt buộc' })
  uid: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  newPassword: string;
}
