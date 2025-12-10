// src/repositories/ticket.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { TicketStatus } from '../models/Ticket';

@Injectable()
export class TicketRepository {
  constructor(private prisma: PrismaService) { }

  // TẠO MỚI MỘT VÉ ĐÃ ĐẶT (TRẠNG THÁI BOOKED) - DÙNG CHO ĐẶT VÉ ONLINE HOẶC TẠI QUẦY
  create(data: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        userId: data.userId,
        scheduleId: data.scheduleId,
        seatId: data.seatId,
        price: data.price,
        status: TicketStatus.BOOKED,
        paymentMethod: data.paymentMethod,
        // ĐÃ XÓA bulkTicketId
      },
    });
  }

  // LẤY THÔNG TIN CHI TIẾT MỘT VÉ THEO ID (KÈM THÔNG TIN GHẾ)
  findById(id: number) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: { seat: true },
    });
  }

  // CẬP NHẬT TRẠNG THÁI HOẶC THÔNG TIN VÉ (THANH TOÁN, HỦY, HOÀN TIỀN...)
  update(id: number, data: any) {
    return this.prisma.ticket.update({
      where: { id },
      data,
    });
  }

  // KIỂM TRA GHẾ ĐÃ ĐƯỢC ĐẶT CHƯA TRONG CHUYẾN XE ĐÓ (NGĂN ĐẶT TRÙNG GHẾ)
  checkSeatBooked(scheduleId: number, seatId: number) {
    return this.prisma.ticket.findFirst({
      where: {
        scheduleId,
        seatId,
        status: { in: [TicketStatus.BOOKED, TicketStatus.PAID] },
      },
    });
  }

  // ĐẾM SỐ LẦN ĐẶT VÉ CỦA MỘT NGƯỜI DÙNG TRONG NGÀY HIỆN TẠI (CHỐNG SPAM ĐẶT VÉ)
  findUserBookedToday(userId: number) {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return this.prisma.ticket.count({
      where: { userId, createdAt: { gte: start, lt: end } },
    });
  }

  // LẤY DANH SÁCH VÉ CỦA MỘT NGƯỜI DÙNG (TRANG "VÉ CỦA TÔI") - KÈM THÔNG TIN CHUYẾN, GHẾ, THANH TOÁN, ĐIỂM TRẢ
  getTicketsByUser(userId: number) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        schedule: { 
          include: { 
            route: true,
            bus: true 
          } 
        },
        seat: true,
        paymentHistory: true,
        dropoffPoint: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  // THỐNG KÊ SỐ VÉ ĐÃ BÁN TRONG NGÀY HIỆN TẠI CỦA MỘT NHÀ XE (DÙNG CHO BÁO CÁO DOANH THU)
  countBrandSoldToday(brandId: number) {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return this.prisma.ticket.count({
      where: {
        schedule: { bus: { brandId } },
        createdAt: { gte: start, lt: end },
      },
    });
  }
}