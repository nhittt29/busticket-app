// src/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    roleId: number;
    isActive: boolean;
    createdAt: Date;
  }) {
    return this.prisma.user.create({
      data,
      include: { role: true },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }
}
