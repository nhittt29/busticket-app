import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsController } from '../controllers/promotions.controller';
import { PromotionsService } from '../services/promotions.service';
import { PromotionsRepository } from '../repositories/promotions.repository';
import { Promotion } from '../entities/Promotion.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Promotion])],
    controllers: [PromotionsController],
    providers: [PromotionsService, PromotionsRepository],
})
export class PromotionsModule { }
