import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer'; // Import từ class-transformer
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
  phone?: string;

  // 🔹 Thêm trường dob (tùy chọn) với transformer để parse string thành Date
  @IsOptional()
  @IsDate({ message: 'Ngày sinh phải là ngày hợp lệ (YYYY-MM-DD)' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  dob?: Date;

  // 🔹 Thêm trường gender (tùy chọn)
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính phải là MALE, FEMALE hoặc OTHER' })
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  // 🔹 Thêm trường avatar (tùy chọn)
  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh đại diện phải là chuỗi' })
  avatar?: string; // URL hoặc đường dẫn ảnh trong project (nếu không upload sẽ là ảnh mặc định)
}