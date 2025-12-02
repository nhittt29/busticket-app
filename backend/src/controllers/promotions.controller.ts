import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PromotionsService } from '../services/promotions.service';
import { DiscountType } from '@prisma/client';

@Controller('promotions')
export class PromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    // --- ADMIN ENDPOINTS ---
    @Post()
    create(@Body() data: {
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
        return this.promotionsService.create(data);
    }

    @Get('admin')
    findAllAdmin() {
        return this.promotionsService.findAllAdmin();
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
        return this.promotionsService.update(id, data);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.promotionsService.delete(id);
    }

    // --- USER ENDPOINTS ---
    @Get()
    findActive() {
        return this.promotionsService.findActive();
    }

    @Post('apply')
    apply(@Body() body: { code: string; orderValue: number }) {
        return this.promotionsService.applyPromotion(body.code, body.orderValue);
    }
}
