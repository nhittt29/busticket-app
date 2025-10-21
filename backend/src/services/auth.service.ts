import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { auth, firestore } from '../config/firebase';
import { PrismaService } from './prisma.service';
import { UserRepository } from '../repositories/user.repository';
import { User } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userRepository: UserRepository,
  ) {}

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

      const passengerRole = await this.prisma.role.findUnique({
        where: { name: 'PASSENGER' },
      });

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

      return newUser;
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

      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });

      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      const baseUrl = 'http://10.0.2.2:3000';
      const avatarUrl = user.avatar
        ? `${baseUrl}/${user.avatar.replace(/\\/g, '/')}`
        : `${baseUrl}/uploads/avatars/default.png`;

      return {
        idToken,
        uid,
        user: {
          ...user,
          avatar: avatarUrl,
          role: user.role ? { id: user.role.id, name: user.role.name } : undefined,
        },
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

  async findUserByUid(uid: string): Promise<User> {
    const user = await this.userRepository.findByUid(uid);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async updateUserProfile(
    id: number,
    data: { name?: string; phone?: string; dob?: Date; gender?: 'MALE' | 'FEMALE' | 'OTHER' },
  ): Promise<User> {
    const updatedUser = await this.userRepository.updateUser(id, data);
    return updatedUser;
  }
}