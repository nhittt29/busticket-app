import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  // TẠO MỚI NGƯỜI DÙNG SAU KHI ĐĂNG KÝ/ĐĂNG NHẬP QUA FIREBASE AUTH (TỰ ĐỘNG HOẶC ADMIN TẠO)
  async createUser(data: {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    roleId: number;
    isActive?: boolean;
    avatar?: string;
    dob?: Date;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  }) {
    return this.prisma.user.create({
      data: {
        uid: data.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        roleId: data.roleId,
        isActive: data.isActive ?? true,
        avatar: data.avatar ?? 'uploads/avatars/default.png',
        dob: data.dob,
        gender: data.gender,
      },
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT NGƯỜI DÙNG THEO ID (DÙNG TRONG ADMIN HOẶC PROFILE)
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // LẤY NGƯỜI DÙNG THEO EMAIL (DÙNG CHO ĐĂNG NHẬP, QUÊN MẬT KHẨU, KIỂM TRA TRÙNG)
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // LẤY NGƯỜI DÙNG THEO UID FIREBASE (CHÍNH XÁC NHẤT KHI ĐĂNG NHẬP QUA FIREBASE)
  async findByUid(uid: string) {
    return this.prisma.user.findUnique({
      where: { uid },
      include: {
        role: true,
        tickets: true,
      },
    });
  }

  // CẬP NHẬT THÔNG TIN CÁ NHÂN, QUYỀN, TRẠNG THÁI HOẠT ĐỘNG, AVATAR, NGÀY SINH, GIỚI TÍNH
  async updateUser(
    id: number,
    data: Partial<{
      name?: string;
      phone?: string;
      isActive?: boolean;
      roleId?: number;
      avatar?: string;
      faceUrl?: string;
      dob?: Date;
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
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

  // XÓA NGƯỜI DÙNG KHỎI HỆ THỐNG (HARD DELETE - CẨN THẬN KHI DÙNG)
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG (KHÁCH HÀNG, NHÀ XE, ADMIN) - DÀNH CHO QUẢN TRỊ VIÊN
  async findAll() {
    return this.prisma.user.findMany({
      include: {
        role: true,
        tickets: true,
      },
      orderBy: { id: 'asc' },
    });
  }
}