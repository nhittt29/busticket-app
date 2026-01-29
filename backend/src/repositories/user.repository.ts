import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  // TẠO MỚI NGƯỜI DÙNG
  async createUser(data: {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    roleId: number;
    isActive?: boolean;
    avatar?: string;
    dob?: Date;
    gender?: string; // Changed strict type for broader compatibility or import specific type if needed
  }) {
    // TypeORM create just creates instance, save persists it
    const newUser = this.userRepo.create({
      uid: data.uid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      roleId: data.roleId,
      isActive: data.isActive ?? true,
      avatar: data.avatar ?? 'uploads/avatars/default.png',
      dob: data.dob,
      gender: data.gender,
    });

    await this.userRepo.save(newUser);

    // Return with relations to match Prisma include behavior
    return this.findById(newUser.id);
  }

  // LẤY THÔNG TIN CHI TIẾT NGƯỜI DÙNG THEO ID
  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['role', 'tickets'],
    });
  }

  // LẤY NGƯỜI DÙNG THEO EMAIL
  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      relations: ['role', 'tickets'],
    });
  }

  // LẤY NGƯỜI DÙNG THEO UID FIREBASE
  async findByUid(uid: string) {
    return this.userRepo.findOne({
      where: { uid },
      relations: ['role', 'tickets'],
    });
  }

  // CẬP NHẬT THÔNG TIN CÁ NHÂN
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
      gender?: string;
      address?: string;
    }>,
  ) {
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  // XÓA NGƯỜI DÙNG
  async deleteUser(id: number) {
    const user = await this.findById(id);
    if (user) {
      await this.userRepo.remove(user);
    }
    return user;
  }

  // LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG
  async findAll() {
    return this.userRepo.find({
      relations: ['role', 'tickets'],
      order: { id: 'ASC' },
    });
  }
}