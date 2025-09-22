// src/services/auth.service.ts
import { Injectable } from '@nestjs/common';
import { auth, firestore } from '../config/firebase';
import { PrismaService } from './prisma.service';
import { User } from '../models/User';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(email: string, password: string, name: string, phone?: string): Promise<User> {
    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      await firestore.collection('users').doc(userRecord.uid).set({
        name,
        email,
        phone,
        createdAt: new Date(),
      });

      const defaultRoleId = 2; // Giả sử roleId 2 là PASSENGER

      const newUser = await this.prisma.user.create({
        data: {
          uid: userRecord.uid,
          name,
          email,
          phone,
          isActive: true,
          roleId: defaultRoleId,
          createdAt: new Date(),
        },
      });

      const userWithRole = await this.prisma.user.findUnique({
        where: { id: newUser.id },
        include: { role: true },
      });

      return userWithRole as User;
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