import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { auth, firestore } from '../config/firebase';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { User } from '../entities/User.entity';
import { EmailService } from './email.service';
import axios from 'axios';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private readonly redis = new Redis({ host: '127.0.0.1', port: 6379 }); // Direct connection for simplicity

  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private emailService: EmailService,
  ) { }

  // Type guard to check if error is an Axios error
  private isAxiosError(error: any): error is { response?: { status: number } } {
    return error && typeof error === 'object' && 'response' in error;
  }

  // ======================================================
  // 🔹 Đăng ký (có thể có hoặc không upload avatar)
  // ======================================================
  async register(
    email: string,
    password: string,
    name: string,
    phone?: string,
    avatarPath?: string,
    dob?: Date,
    gender?: 'MALE' | 'FEMALE' | 'OTHER',
  ): Promise<User> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email đã được đăng ký');
      }

      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      await firestore.collection('users').doc(userRecord.uid).set({
        name,
        email,
        phone,
        avatar: avatarPath ?? 'uploads/avatars/default.png',
        dob: dob || null,
        gender: gender || 'OTHER',
        createdAt: new Date(),
      });

      const passengerRole = await this.roleRepository.findByName('PASSENGER');
      if (!passengerRole) {
        throw new Error('Role PASSENGER not found');
      }

      const newUser = await this.userRepository.createUser({
        uid: userRecord.uid,
        name,
        email,
        phone,
        isActive: true,
        roleId: passengerRole.id,
        avatar: avatarPath ?? 'uploads/avatars/default.png',
        dob,
        gender,
      });

      return newUser as User;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // ======================================================
  // 🔹 Đăng nhập
  // ======================================================
  async login(
    email: string,
    password: string,
  ): Promise<{
    idToken: string;
    customToken: string;
    uid: string;
    user: User & { role?: { id: number; name: string } };
  }> {
    try {
      const response = await axios.post<{
        idToken: string;
        localId: string;
      }>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        },
      );

      const { idToken, localId: uid } = response.data;

      const user = await this.userRepository.findByEmail(email);

      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      const baseUrl = 'http://10.0.2.2:3000';
      const avatarUrl = user.avatar
        ? `${baseUrl}/${user.avatar.replace(/\\/g, '/')}`
        : `${baseUrl}/uploads/avatars/default.png`;

      // Helper to match return type - casting to any to bypass strict checks for now as structure matches
      const userWithRole = {
        ...user,
        avatar: avatarUrl,
        role: user.role ? { id: user.role.id, name: user.role.name } : undefined
      };

      // Generate Custom Token for SSO
      const customToken = await auth.createCustomToken(uid);

      return {
        idToken,
        customToken, // Return this for SSO
        uid,
        user: userWithRole as any,
      };
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 400) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // ======================================================
  // 🔹 Quên mật khẩu
  // ======================================================
  async forgotPassword(
    email: string,
  ): Promise<{ message: string; resetLink: string }> {
    try {
      const userRecord = await auth.getUserByEmail(email);
      if (!userRecord) throw new NotFoundException('Email chưa được đăng ký');

      const resetLink = await (auth as any).generatePasswordResetLink(email);

      return {
        message: 'Link đặt lại mật khẩu đã được gửi',
        resetLink,
      };
    } catch (error) {
      throw new Error(`Forgot password failed: ${error.message}`);
    }
  }

  // ======================================================
  // 🔹 Đổi mật khẩu
  // ======================================================
  async changePassword(
    uid: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      await auth.updateUser(uid, { password: newPassword });
      return { message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      throw new Error(`Change password failed: ${error.message}`);
    }
  }

  // ======================================================
  // 🔹 Reset mật khẩu
  // ======================================================
  async resetPassword(
    email: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const userRecord = await auth.getUserByEmail(email);
      if (!userRecord) throw new NotFoundException('Email không tồn tại');

      await auth.updateUser(userRecord.uid, { password: newPassword });
      return { message: 'Đặt lại mật khẩu thành công' };
    } catch (error) {
      throw new Error(`Reset password failed: ${error.message}`);
    }
  }

  // ======================================================
  // 🔹 Send OTP (Forgot Password Steps)
  // ======================================================
  async sendOtp(email: string): Promise<{ message: string; expiresIn: number }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('Email chưa được đăng ký trong hệ thống');

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `otp_reset:${email}`;
    const ttlSeconds = 300; // 5 minutes

    // Save to Redis
    await this.redis.set(redisKey, otp, 'EX', ttlSeconds);

    // Send Email
    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'Mã OTP đã được gửi đến email của bạn', expiresIn: ttlSeconds };
  }

  // ======================================================
  // 🔹 Verify OTP (Check Only)
  // ======================================================
  async verifyOtp(email: string, otp: string): Promise<{ valid: boolean; message: string }> {
    const redisKey = `otp_reset:${email}`;
    const storedOtp = await this.redis.get(redisKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
    }

    return { valid: true, message: 'Mã OTP hợp lệ' };
  }

  // ======================================================
  // 🔹 Verify & Reset Password with OTP
  // ======================================================
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const redisKey = `otp_reset:${email}`;
    const storedOtp = await this.redis.get(redisKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
    }

    // OTP Valid - Verify Password Length
    if (newPassword.length < 8) {
      throw new BadRequestException('Mật khẩu phải có tối thiểu 8 ký tự');
    }

    const userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { password: newPassword });

    // Delete OTP after usage
    await this.redis.del(redisKey);

    return { message: 'Mật khẩu đã được thay đổi thành công' };
  }

  async findUserByUid(uid: string): Promise<User> {
    const user = await this.userRepository.findByUid(uid);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async updateUserProfile(
    id: number,
    data: { name?: string; phone?: string; dob?: Date; gender?: 'MALE' | 'FEMALE' | 'OTHER'; avatar?: string },
  ): Promise<User> {
    if (data.dob && isNaN(data.dob.getTime())) {
      throw new BadRequestException('Ngày sinh không hợp lệ');
    }
    const updated = await this.userRepository.updateUser(id, data as any);
    if (!updated) throw new NotFoundException('User not found after update');
    return updated;
  }

  async updateFaceAuth(id: number, faceUrl: string): Promise<User> {
    const updatedUser = await this.userRepository.updateUser(id, { faceUrl });
    if (!updatedUser) throw new NotFoundException('User not found after update');
    return updatedUser;
  }
}