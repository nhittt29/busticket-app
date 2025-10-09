import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { auth, firestore } from '../config/firebase';
import { PrismaService } from './prisma.service';
import { UserRepository } from '../repositories/user.repository';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userRepository: UserRepository,
  ) {}

  // Đăng ký
  async register(
    email: string,
    password: string,
    name: string,
    phone?: string,
  ): Promise<User> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email đã được đăng ký');
      }

      // 🔹 Tạo user trên Firebase
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // 🔹 Lưu Firestore (tùy chọn)
      await firestore.collection('users').doc(userRecord.uid).set({
        name,
        email,
        phone,
        createdAt: new Date(),
      });

      // 🔹 Lấy role mặc định PASSENGER
      const passengerRole = await this.prisma.role.findUnique({
        where: { name: 'PASSENGER' },
      });

      if (!passengerRole) {
        throw new Error('Role PASSENGER not found in DB');
      }

      // 🔹 Tạo user trong database (Prisma)
      const newUser = await this.userRepository.createUser({
        uid: userRecord.uid,
        name,
        email,
        phone,
        isActive: true,
        roleId: passengerRole.id,
      });

      return newUser; // ✅ Không cần ép kiểu
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Đăng nhập
  async login(
    email: string,
    password: string,
  ): Promise<{ idToken: string; uid: string }> {
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch {
        throw new NotFoundException('Email chưa được đăng ký');
      }

      const customToken = await auth.createCustomToken(userRecord.uid);
      return { idToken: customToken, uid: userRecord.uid };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Quên mật khẩu
  async forgotPassword(
    email: string,
  ): Promise<{ message: string; resetLink: string }> {
    try {
      const userRecord = await auth.getUserByEmail(email);
      if (!userRecord) throw new NotFoundException('Email chưa được đăng ký');

      const resetLink = await (auth as any).generatePasswordResetLink(email);

      return {
        message: 'Link đặt lại mật khẩu đã được gửi qua email',
        resetLink,
      };
    } catch (error) {
      throw new Error(`Forgot password failed: ${error.message}`);
    }
  }

  // Đổi mật khẩu
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

  // ✅ Reset mật khẩu bằng email
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
}
