import { Module } from '@nestjs/common';
import { PromotionsController } from '../controllers/promotions.controller';
import { PromotionsService } from '../services/promotions.service';
import { PrismaService } from '../services/prisma.service';

@Module({
    controllers: [PromotionsController],
    providers: [PromotionsService, PrismaService],
})
export class PromotionsModule { }
