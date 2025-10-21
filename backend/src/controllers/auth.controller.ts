import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Put,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { auth } from '../config/firebase';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ========================================
  // 🔹 ĐĂNG KÝ NGƯỜNG DÙNG (CÓ UPLOAD ẢNH)
  // ========================================
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error(
              'Chỉ chấp nhận file ảnh hợp lệ (jpg, png, webp, heic, svg,...)',
            ),
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
      : 'uploads/avatars/default.png';

    return this.authService.register(
      body.email,
      body.password,
      body.name,
      body.phone,
      avatarPath,
      body.dob,
      body.gender,
    );
  }

  // ========================================
  // 🔹 ĐĂNG NHẬP
  // ========================================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  // ========================================
  // 🔹 QUÊN MẬT KHẨU (NHẬP EMAIL + MẬT KHẨU MỚI)
  // ========================================
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, newPassword);
  }

  // ========================================
  // 🔹 ĐỔI MẬT KHẨU (KHI ĐÃ ĐĂNG NHẬP)
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
  // 🔹 CẬP NHẬT THÔNG TIN NGƯỜI DÙNG
  // ========================================
  @Put('update-profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Body() body: { id: number; name?: string; phone?: string; dob?: string; gender?: 'MALE' | 'FEMALE' | 'OTHER' },
    @Headers('Authorization') authHeader: string,
  ) {
    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const user = await this.authService.findUserByUid(uid);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    // Chuyển đổi dob từ string sang Date nếu có
    const updatedData = {
      ...body,
      dob: body.dob ? new Date(body.dob) : undefined,
    };

    const updatedUser = await this.authService.updateUserProfile(user.id, updatedData);
    return updatedUser;
  }
}