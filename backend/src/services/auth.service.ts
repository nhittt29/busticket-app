//src/services/auth.service.ts
import { Injectable } from '@nestjs/common';
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

  async register(email: string, password: string, name: string, phone?: string): Promise<User> {
    try {
      // Tạo user trên Firebase
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Lưu vào Firestore (tùy bạn có muốn giữ không)
      await firestore.collection('users').doc(userRecord.uid).set({
        name,
        email,
        phone,
        createdAt: new Date(),
      });

      // Lấy role từ DB thay vì hardcode
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
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(email: string, password: string): Promise<{ idToken: string; uid: string }> {
    try {
      const userRecord = await auth.getUserByEmail(email);
      const customToken = await auth.createCustomToken(userRecord.uid);
      return { idToken: customToken, uid: userRecord.uid };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}
