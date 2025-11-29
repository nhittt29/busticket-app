import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG TRONG HỆ THỐNG (DÀNH CHO ADMIN)
    @Get()
    findAll() {
        return this.userService.findAll();
    }

    // LẤY THÔNG TIN CHI TIẾT MỘT NGƯỜI DÙNG THEO ID
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    // CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (HỌ TÊN, SỐ ĐIỆN THOẠI, ĐỊA CHỈ, VAI TRÒ...)
    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.userService.update(+id, body);
    }

    // XÓA NGƯỜI DÙNG KHỎI HỆ THỐNG (SOFT DELETE HOẶC HARD DELETE TÙY SERVICE)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}