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
  BadRequestException,
  Get,
  UnauthorizedException,
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
  constructor(private authService: AuthService) { }

  // ========================================
  // 🔹 ĐĂNG KÝ NGƯỜI DÙNG (CÓ UPLOAD ẢNH)
  // ========================================
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('Chỉ chấp nhận file ảnh hợp lệ (jpg, png, webp, heic, svg...)'),
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
    console.log('Received body in controller:', body); // Log để debug
    const avatarPath = file ? file.path : 'uploads/avatars/default.png';
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
  // 🔹 QUÊN MẬT KHẨU
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
  // 🔹 ĐỔI MẬT KHẨU
  // ========================================
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body('uid') uid: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.changePassword(uid, newPassword);
    return this.authService.changePassword(uid, newPassword);
  }

  // ========================================
  // 🔹 GỬI MÃ OTP (QUÊN MẬT KHẨU)
  // ========================================
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  // ========================================
  // 🔹 XÁC THỰC OTP (KIỂM TRA)
  // ========================================
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    return this.authService.verifyOtp(email, otp);
  }

  // ========================================
  // 🔹 ĐẶT LẠI MẬT KHẨU VỚI OTP
  // ========================================
  @Post('reset-password-with-otp')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPasswordWithOtp(email, otp, newPassword);
  }

  // ========================================
  // 🔹 CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (CÓ UPLOAD ẢNH)
  // ========================================
  @Put('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('Chỉ chấp nhận file ảnh hợp lệ (jpg, png, webp, heic, svg...)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { id: number; name?: string; phone?: string; dob?: string; gender?: 'MALE' | 'FEMALE' | 'OTHER' },
    @Headers('Authorization') authHeader: string,
  ) {
    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const user = await this.authService.findUserByUid(uid);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    // Kiểm tra định dạng dob nếu có
    if (body.dob && !this.isValidDateFormat(body.dob)) {
      throw new BadRequestException('Ngày sinh phải có định dạng YYYY-MM-DD và là ngày hợp lệ');
    }

    // Chuyển đổi dob từ string sang Date nếu có
    const updatedData = {
      name: body.name,
      phone: body.phone,
      dob: body.dob ? new Date(body.dob) : undefined,
      gender: body.gender,
      avatar: file ? file.path : (user.avatar || 'uploads/avatars/default.png'), // Sử dụng default nếu user.avatar là null
    };

    const updatedUser = await this.authService.updateUserProfile(user.id, updatedData);
    return updatedUser;
  }

  // ========================================
  // 🔹 ĐĂNG KÝ FACE ID (UPLOAD ẢNH KHUÔN MẶT)
  // ========================================
  @Put('update-face-auth')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('faceImage', {
      storage: diskStorage({
        destination: './uploads/faces',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `face-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB cho ảnh chất lượng cao
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('Chỉ chấp nhận file ảnh hợp lệ'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateFaceAuth(
    @UploadedFile() file: Express.Multer.File,
    @Headers('Authorization') authHeader: string,
  ) {
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const user = await this.authService.findUserByUid(uid);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (!file) throw new BadRequestException('Vui lòng tải lên ảnh khuôn mặt');

    const faceUrl = file.path;
    return this.authService.updateFaceAuth(user.id, faceUrl);
  }

  // ========================================
  // 🔹 LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI (ME)
  // ========================================
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Headers('Authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const uid = decodedToken.uid;
      const user = await this.authService.findUserByUid(uid);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Hàm kiểm tra định dạng ngày YYYY-MM-DD và ngày hợp lệ
  private isValidDateFormat(dateStr: string): boolean {
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!dateRegex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month - 1 vì JS bắt đầu từ 0
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
}