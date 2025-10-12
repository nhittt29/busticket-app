// src/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 Tạo mới người dùng
  async createUser(data: {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    roleId: number;
    isActive?: boolean;
    avatar?: string; // ✅ thêm đường dẫn ảnh
  }) {
    return this.prisma.user.create({
      data: {
        uid: data.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        roleId: data.roleId,
        isActive: data.isActive ?? true,
        avatar: data.avatar ?? 'uploads/avatars/default.png', // ✅ mặc định nếu không có ảnh
      },
      include: {
        role: true,    // ✅ Lấy thông tin vai trò
        tickets: true, // ✅ Lấy danh sách vé (nếu có)
      },
    });
  }

  // 🔹 Lấy người dùng theo ID
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // 🔹 Lấy người dùng theo Email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // 🔹 Lấy người dùng theo UID Firebase
  async findByUid(uid: string) {
    return this.prisma.user.findUnique({
      where: { uid },
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // 🔹 Cập nhật thông tin người dùng
  async updateUser(
    id: number,
    data: Partial<{
      name: string;
      phone?: string;
      isActive?: boolean;
      roleId?: number;
      avatar?: string; // ✅ cho phép cập nhật avatar
    }>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // 🔹 Xóa người dùng
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // 🔹 Lấy tất cả người dùng (phân biệt theo role nếu muốn)
  async findAll() {
    return this.prisma.user.findMany({
      include: {
        role: true,
        tickets: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
