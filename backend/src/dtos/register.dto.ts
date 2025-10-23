import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsEnum,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsStrongPassword } from '../validators/password.validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsStrongPassword()
  password: string;

  @IsString({ message: 'Tên không được để trống' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  @MaxLength(50, { message: 'Tên không được vượt quá 50 ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại không hợp lệ' })
  @Matches(/^\d{10}$/, {
    message: 'Số điện thoại phải là 10 chữ số và chỉ chứa số',
  })
  phone?: string;

  @IsOptional()
  @IsDate({ message: 'Ngày sinh phải là ngày hợp lệ' })
  @Transform(({ value }) => {
    console.log('Transforming dob:', value); // Log để debug
    if (!value) return undefined;
    const dateStr = value.toString();
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) throw new Error('Ngày sinh không hợp lệ');
    return date;
  })
  dob?: Date;

  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính phải là MALE, FEMALE hoặc OTHER' })
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh đại diện phải là chuỗi' })
  avatar?: string; // URL hoặc đường dẫn ảnh trong project (nếu không upload sẽ là ảnh mặc định)
}