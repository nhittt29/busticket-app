// =========================================
// src/controllers/auth.controller.ts
// =========================================

import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ========================================
  // 🔹 ĐĂNG KÝ NGƯỜI DÙNG (CÓ TÙY CHỌN UPLOAD ẢNH)
  // ========================================
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars', // 📁 Nơi lưu ảnh
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Giới hạn 5MB
      fileFilter: (req, file, callback) => {
        // ✅ Chấp nhận tất cả các định dạng ảnh (image/*)
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('Chỉ chấp nhận file ảnh hợp lệ (jpg, png, webp, svg, heic,...)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RegisterDto,
  ) {
    const avatarPath = file
      ? file.path
      : 'uploads/avatars/default.png'; // 🖼 Ảnh mặc định nếu không upload

    return this.authService.register(
      body.email,
      body.password,
      body.name,
      body.phone,
      avatarPath, // ✅ Truyền đường dẫn ảnh vào service
    );
  }

  // ========================================
  // 🔹 ĐĂNG NHẬP (TRẢ VỀ THÔNG TIN USER + AVATAR)
  // ========================================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  // ========================================
  // 🔹 QUÊN MẬT KHẨU
  // ========================================
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // ========================================
  // 🔹 ĐỔI MẬT KHẨU
  // ========================================
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body('uid') uid: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.changePassword(uid, newPassword);
  }

  // ========================================
  // 🔹 RESET PASSWORD BẰNG EMAIL
  // ========================================
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, newPassword);
  }
}
