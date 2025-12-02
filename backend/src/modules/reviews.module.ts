import { Module } from '@nestjs/common';
import { ReviewsController } from '../controllers/reviews.controller';
import { ReviewsService } from '../services/reviews.service';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
    controllers: [ReviewsController],
    providers: [ReviewsService, ReviewsRepository, PrismaService],
})
export class ReviewsModule { }
