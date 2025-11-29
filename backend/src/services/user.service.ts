import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) { }

    // LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG (KHÁCH HÀNG, NHÀ XE, ADMIN) – DÀNH CHO QUẢN TRỊ VIÊN
    async findAll() {
        return this.userRepo.findAll();
    }

    // LẤY THÔNG TIN CHI TIẾT MỘT NGƯỜI DÙNG THEO ID (DÙNG CHO PROFILE HOẶC ADMIN)
    async findOne(id: number) {
        return this.userRepo.findById(id);
    }

    // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG: HỌ TÊN, SỐ ĐIỆN THOẠI, AVATAR, GIỚI TÍNH, NGÀY SINH, QUYỀN...
    async update(id: number, data: any) {
        return this.userRepo.updateUser(id, data);
    }

    // XÓA NGƯỜI DÙNG KHỎI HỆ THỐNG (HARD DELETE – CHỈ ADMIN ĐƯỢC PHÉP, CẨN THẬN KHI DÙNG)
    async remove(id: number) {
        return this.userRepo.deleteUser(id);
    }
}