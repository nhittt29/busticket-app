// src/services/auth.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { auth, firestore } from '../config/firebase';
import { PrismaService } from './prisma.service';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/User';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userRepository: UserRepository,
  ) {}

  // Đăng ký
  async register(email: string, password: string, name: string, phone?: string): Promise<User> {
    try {
      // Kiểm tra email đã tồn tại trên Postgres
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email đã được đăng ký');
      }

      // Tạo user trên Firebase
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Lưu vào Firestore (tuỳ bạn có muốn giữ không)
      await firestore.collection('users').doc(userRecord.uid).set({
        name,
        email,
        phone,
        createdAt: new Date(),
      });

      // Lấy role PASSENGER từ DB
      const passengerRole = await this.prisma.role.findUnique({
        where: { name: 'PASSENGER' },
      });

      if (!passengerRole) {
        throw new Error('Role PASSENGER not found in DB');
      }

      // Tạo user trong Postgres
      const newUser = await this.userRepository.createUser({
        uid: userRecord.uid,
        name,
        email,
        phone,
        isActive: true,
        roleId: passengerRole.id,
        createdAt: new Date(),
      });

      return newUser as User;
    } catch (error) {
      // Nếu đã bị ConflictException thì ném ra trực tiếp
      if (error instanceof ConflictException) throw error;

      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Đăng nhập
  async login(email: string, password: string): Promise<{ idToken: string; uid: string }> {
    try {
      // Kiểm tra user tồn tại trên Firebase
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (err) {
        throw new NotFoundException('Email chưa được đăng ký');
      }

      // Tạo custom token Firebase
      const customToken = await auth.createCustomToken(userRecord.uid);
      return { idToken: customToken, uid: userRecord.uid };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new Error(`Login failed: ${error.message}`);
    }
  }
}
