import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ScheduleStatus } from '@prisma/client';

@Injectable()
export class ScheduleRepository {
    constructor(private readonly prisma: PrismaService) { }

    // TẠO MỚI MỘT CHUYẾN XE (LỊCH TRÌNH) TRONG HỆ THỐNG
    async createSchedule(dto: any) {
        return this.prisma.schedule.create({
            data: {
                busId: dto.busId,
                routeId: dto.routeId,
                departureAt: dto.departureAt,
                arrivalAt: dto.arrivalAt,
                status: dto.status || 'UPCOMING',
            },
        });
    }

    // TÌM KIẾM CHUYẾN XE CHO KHÁCH HÀNG: THEO ĐIỂM ĐI - ĐIỂM ĐẾN - NGÀY ĐI, CHỈ HIỆN CHƯA KHỞI HÀNH
    async getAllSchedules(query?: {
        startPoint?: string;
        endPoint?: string;
        date?: string;
        minPrice?: number;
        maxPrice?: number;
        startTime?: string;
        endTime?: string;
        busType?: string;
        brandId?: number;
        dropoffPoint?: string;
        sortBy?: string;
    }) {
        const where: any = { AND: [] };
        const now = new Date();

        // 1. Lọc theo Điểm đi (Start Point)
        if (query?.startPoint) {
            where.AND.push({
                route: {
                    startPoint: {
                        contains: query.startPoint,
                        mode: 'insensitive',
                    },
                },
            });
        }

        // 2. Lọc theo Điểm đến (End Point)
        if (query?.endPoint) {
            where.AND.push({
                route: {
                    endPoint: {
                        contains: query.endPoint,
                        mode: 'insensitive',
                    },
                },
            });
        }

        // 3. Lọc theo Ngày đi (Date)
        if (query?.date) {
            const [day, month, year] = query.date.split('/');
            const localDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+07:00`);
            const startOfDay = new Date(localDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(localDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Nếu có lọc theo giờ (Time Range) trong ngày đã chọn
            if (query.startTime && query.endTime) {
                const [startHour, startMinute] = query.startTime.split(':').map(Number);
                const [endHour, endMinute] = query.endTime.split(':').map(Number);

                const filterStartTime = new Date(startOfDay);
                filterStartTime.setHours(startHour, startMinute, 0, 0);

                const filterEndTime = new Date(startOfDay);
                filterEndTime.setHours(endHour, endMinute, 59, 999);

                where.AND.push({
                    departureAt: {
                        gte: filterStartTime,
                        lte: filterEndTime,
                    },
                });
            } else {
                // Nếu không lọc giờ, lấy cả ngày
                where.AND.push({
                    departureAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                });
            }
        } else {
            // Nếu không chọn ngày, mặc định lấy các chuyến từ hiện tại trở đi
            where.AND.push({
                departureAt: {
                    gt: now,
                },
            });
        }

        // 4. Lọc theo Khoảng giá (Price Range)
        if (query?.minPrice !== undefined || query?.maxPrice !== undefined) {
            where.AND.push({
                route: {
                    lowestPrice: {
                        gte: query.minPrice || 0,
                        lte: query.maxPrice || 10000000, // Mặc định max cao nếu không nhập
                    },
                },
            });
        }

        // 5. Lọc theo Loại xe (Bus Type)
        if (query?.busType) {
            where.AND.push({
                bus: {
                    category: query.busType as any, // Cast to any or specific enum if imported
                },
            });
        }

        // 6. Lọc theo Nhà xe (Brand)
        if (query?.brandId) {
            where.AND.push({
                bus: {
                    brandId: query.brandId,
                },
            });
        }

        // 7. Lọc theo Điểm trả (Drop-off Point) - Tìm trong Route EndPoint HOẶC DropoffPoints
        if (query?.dropoffPoint) {
            where.AND.push({
                OR: [
                    {
                        route: {
                            endPoint: {
                                contains: query.dropoffPoint,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        dropoffPoints: {
                            some: {
                                name: {
                                    contains: query.dropoffPoint,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                ],
            });
        }

        // Xử lý Sắp xếp (Sort)
        let orderBy: any = { departureAt: 'asc' }; // Mặc định: Giờ đi sớm nhất
        if (query?.sortBy) {
            switch (query.sortBy) {
                case 'price_asc':
                    orderBy = { route: { lowestPrice: 'asc' } };
                    break;
                case 'price_desc':
                    orderBy = { route: { lowestPrice: 'desc' } };
                    break;
                case 'time_desc':
                    orderBy = { departureAt: 'desc' };
                    break;
                case 'time_asc':
                default:
                    orderBy = { departureAt: 'asc' };
                    break;
            }
        }

        return this.prisma.schedule.findMany({
            where,
            include: {
                bus: {
                    include: { brand: true },
                },
                route: true,
                dropoffPoints: true,
            },
            orderBy,
        });
    }

    // LẤY TOÀN BỘ CHUYẾN XE (KHÔNG LỌC) - DÀNH RIÊNG CHO ADMIN QUẢN LÝ, BAO GỒM CẢ QUÁ KHỨ VÀ TƯƠNG LAI
    async getAllSchedulesForAdmin() {
        return this.prisma.schedule.findMany({
            include: {
                bus: {
                    include: { brand: true },
                },
                route: true,
            },
            orderBy: { id: 'asc' },
        });
    }

    // LẤY THÔNG TIN CHI TIẾT MỘT CHUYẾN XE THEO ID (DÙNG CHO CHI TIẾT CHUYẾN, ĐẶT VÉ, CHỌN GHẾ...)
    async getScheduleById(id: number) {
        return this.prisma.schedule.findUnique({
            where: { id },
            include: {
                bus: true,
                route: true,
            },
        });
    }

    // XÓA TẤT CẢ VÉ ĐÃ ĐẶT TRÊN MỘT CHUYẾN XE (DÙNG KHI HỦY CHUYẾN HOẶC XÓA CHUYẾN)
    async deleteTicketsByScheduleId(scheduleId: number) {
        return this.prisma.ticket.deleteMany({
            where: { scheduleId },
        });
    }

    // XÓA HOÀN TOÀN MỘT CHUYẾN XE KHỎI HỆ THỐNG (ADMIN ONLY - THƯỜNG KẾT HỢP VỚI XÓA VÉ TRƯỚC)
    async deleteSchedule(id: number) {
        return this.prisma.schedule.delete({
            where: { id },
        });
    }
}