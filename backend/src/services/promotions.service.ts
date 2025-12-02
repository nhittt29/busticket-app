import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Promotion, DiscountType } from '@prisma/client';

@Injectable()
export class PromotionsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        code: string;
        description: string;
        discountType: DiscountType;
        discountValue: number;
        minOrderValue?: number;
        maxDiscount?: number;
        startDate: string;
        endDate: string;
        usageLimit?: number;
        isActive?: boolean;
    }) {
        // Check if code exists
        const existing = await this.prisma.promotion.findUnique({
            where: { code: data.code },
        });
        if (existing) {
            throw new BadRequestException('Mã khuyến mãi đã tồn tại');
        }

        return this.prisma.promotion.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
            },
        });
    }

    async findAllAdmin() {
        return this.prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findActive() {
        const now = new Date();
        return this.prisma.promotion.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { endDate: 'asc' },
        });
    }

    async findOne(id: number) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { id },
        });
        if (!promotion) throw new NotFoundException('Không tìm thấy mã khuyến mãi');
        return promotion;
    }

    async update(id: number, data: any) {
        await this.findOne(id);
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        return this.prisma.promotion.update({
            where: { id },
            data,
        });
    }

    async delete(id: number) {
        await this.findOne(id);
        return this.prisma.promotion.delete({
            where: { id },
        });
    }

    async applyPromotion(code: string, orderValue: number) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { code },
        });

        if (!promotion) {
            throw new BadRequestException('Mã khuyến mãi không hợp lệ');
        }

        if (!promotion.isActive) {
            throw new BadRequestException('Mã khuyến mãi đã bị vô hiệu hóa');
        }

        const now = new Date();
        if (now < promotion.startDate || now > promotion.endDate) {
            throw new BadRequestException('Mã khuyến mãi đã hết hạn hoặc chưa bắt đầu');
        }

        if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
            throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng');
        }

        if (orderValue < promotion.minOrderValue) {
            throw new BadRequestException(
                `Đơn hàng tối thiểu để áp dụng là ${promotion.minOrderValue.toLocaleString('vi-VN')}đ`
            );
        }

        let discountAmount = 0;
        if (promotion.discountType === 'FIXED') {
            discountAmount = promotion.discountValue;
        } else {
            discountAmount = (orderValue * promotion.discountValue) / 100;
            if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
                discountAmount = promotion.maxDiscount;
            }
        }

        // Ensure discount doesn't exceed order value
        if (discountAmount > orderValue) {
            discountAmount = orderValue;
        }

        return {
            success: true,
            discountAmount,
            finalPrice: orderValue - discountAmount,
            promotion,
        };
    }
}
