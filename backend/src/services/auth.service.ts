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

  // ======================================================
  // 🔹 Đăng ký (có thể có hoặc không upload avatar)
  // ======================================================
  async register(
    email: string,
    password: string,
    name: string,
    phone?: string,
    avatarPath?: string, // ✅ Thêm tham số mới
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
        avatar: avatarPath ?? 'uploads/avatars/default.png', // 🖼 Lưu đường dẫn ảnh
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
        avatar: avatarPath ?? 'uploads/avatars/default.png', // ✅ Lưu vào DB
      });

      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // ======================================================
  // 🔹 Đăng nhập (trả về đầy đủ thông tin user)
  // ======================================================
  async login(
    email: string,
    password: string,
  ): Promise<{
    idToken: string;
    uid: string;
    user: {
      id: number;
      uid: string;
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
      role?: { id: number; name: string };
    };
  }> {
    try {
      // 🔍 Kiểm tra email có tồn tại trên Firebase không
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch {
        throw new NotFoundException('Email chưa được đăng ký');
      }

      // 🔹 Tạo custom token từ Firebase
      const customToken = await auth.createCustomToken(userRecord.uid);

      // 🔹 Lấy thông tin user từ DB
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại trong hệ thống');
      }

      // ✅ Trả về token + thông tin chi tiết user
      return {
        idToken: customToken,
        uid: userRecord.uid,
        user: {
          id: user.id,
          uid: user.uid,
          name: user.name,
          email: user.email,
          phone: user.phone ?? undefined, // ✅ Fix type null → undefined
          avatar: user.avatar ?? 'uploads/avatars/default.png',
          role: user.role
            ? { id: user.role.id, name: user.role.name }
            : undefined, // ✅ Fix type null → undefined
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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
        message: 'Link đặt lại mật khẩu đã được gửi qua email',
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
  // 🔹 Reset mật khẩu bằng email
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
}
