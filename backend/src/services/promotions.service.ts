import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PromotionsRepository } from '../repositories/promotions.repository';

@Injectable()
export class PromotionsService {
    constructor(private promotionsRepo: PromotionsRepository) { }

    async create(data: {
        code: string;
        description: string;
        discountType: any;
        discountValue: number;
        minOrderValue?: number;
        maxDiscount?: number;
        startDate: string;
        endDate: string;
        usageLimit?: number;
        isActive?: boolean;
    }) {
        const existing = await this.promotionsRepo.findByCode(data.code);
        if (existing) {
            throw new BadRequestException('Mã khuyến mãi đã tồn tại');
        }

        return this.promotionsRepo.create({
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        });
    }

    async findAllAdmin() {
        return this.promotionsRepo.findAllAdmin();
    }

    async findActive() {
        return this.promotionsRepo.findActive();
    }

    async findOne(id: number) {
        const promotion = await this.promotionsRepo.findById(id);
        if (!promotion) throw new NotFoundException('Không tìm thấy mã khuyến mãi');
        return promotion;
    }

    async update(id: number, data: any) {
        await this.findOne(id);
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        return this.promotionsRepo.update(id, data);
    }

    async delete(id: number) {
        await this.findOne(id);
        return this.promotionsRepo.delete(id);
    }

    async applyPromotion(code: string, orderValue: number) {
        const promotion = await this.promotionsRepo.findByCode(code);

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
