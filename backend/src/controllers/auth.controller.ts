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
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { AuthService } from '../services/auth.service';
import { UploadService } from '../services/upload.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { auth } from '../config/firebase';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private uploadService: UploadService,
  ) { }

  // ========================================
  // 🔹 ĐĂNG KÝ BỞI ADMIN (KHÔNG CẦN DUYỆT EMAIL)
  // ========================================
  @Post('admin-register')
  async adminRegister(@Body() body: any) {
    const { email, password, name, phone, roleId, brandId } = body;
    if (!email || !password || !name) {
      throw new BadRequestException('Email, password, and name are required.');
    }
    try {
        const user = await this.authService.registerAsAdmin(
          email,
          password,
          name,
          phone,
          parseInt(roleId),
          brandId ? parseInt(brandId) : undefined,
        );
        return {
          message: 'Người dùng được tạo thành công.',
          user,
        };
    } catch (error: any) {
        throw new BadRequestException(error.message || 'Lỗi hệ thống khi tạo người dùng');
    }
  }

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

    // Bắt đầu quy trình kiểm tra DeepFace
    const faceUrl = file.path;
    try {
      const formData = new FormData();
      formData.append('img', fs.createReadStream(faceUrl));

      // Gọi API DeepFace (Server Python chạy ở localhost:5000)
      const deepfaceResponse = await axios.post('http://localhost:5000/represent', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      const results = (deepfaceResponse.data as any).results;

      // 1. Kiểm tra số lượng khuôn mặt
      if (!results || results.length === 0) {
        throw new BadRequestException('Không nhận diện được khuôn mặt nào trong ảnh. Vui lòng chụp rõ mặt.');
      }
      if (results.length > 1) {
        throw new BadRequestException(`Phát hiện ${results.length} người trong ảnh. Vui lòng chụp riêng bạn.`);
      }

      // 2. Kiểm tra độ rõ nét / tin cậy (Confidence)
      const faceData = results[0];
      const faceConfidence = faceData.face_confidence || 0;

      // Threshold 0.85 (85%) là hệ số tương đối an toàn cho các model nhận diện tiêu chuẩn
      if (faceConfidence < 0.85) {
        throw new BadRequestException('Ảnh không đủ chất lượng hoặc bị mờ. Vui lòng chụp ở nơi đủ sáng.');
      }

      // Vượt qua vòng loại DeepFace! 
      // 3. Upload lên Cloudinary
      const cloudinaryUrl = await this.uploadService.uploadFaceImage(faceUrl, user.id);

      // 4. Lưu DB FaceUrl mới và trả về
      return await this.authService.updateFaceAuth(user.id, cloudinaryUrl);

    } catch (error) {
      // Axios error handling cho DeepFace
      if (error?.isAxiosError) {
        console.error('Lỗi khi kết nối đến DeepFace Server:', error.message);
        throw new BadRequestException('Lỗi hệ thống phân tích khuôn mặt. Máy chủ AI có thể đang bận hoặc offline.');
      }

      // Quăng tiếp các lỗi BadRequest xuất phát từ cục kiểm tra 1, 2 lên
      throw error;
    } finally {
      // Dọn rác: Luôn luôn xoá ảnh tạm ở backend server dù thành công (đã đẩy lên Cloudinary) hay thất bại
      if (fs.existsSync(faceUrl)) {
        try {
          fs.unlinkSync(faceUrl);
        } catch (cleanupError) {
          console.error('Không thể xoá file tạm FaceID:', cleanupError);
        }
      }
    }
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