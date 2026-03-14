import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { PromotionsService } from '../services/promotions.service';
import { DiscountType } from '../models/Promotion';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

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
    @UseGuards(FirebaseAuthGuard)
    findActive(@Req() req: any) {
        const userId = req.user?.id;
        return this.promotionsService.findActive(userId);
    }

    @Post('apply')
    @UseGuards(FirebaseAuthGuard)
    apply(@Req() req: any, @Body() body: { code: string; orderValue: number }) {
        const userId = req.user?.id;
        return this.promotionsService.applyPromotion(body.code, body.orderValue, userId);
    }
}
