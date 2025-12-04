import { Module } from '@nestjs/common';
import { ReviewsService } from '../reviews/reviews.service';
import { ReviewsController } from '../reviews/reviews.controller';
import { PrismaService } from '../services/prisma.service';

@Module({
    controllers: [ReviewsController],
    providers: [ReviewsService, PrismaService],
})
export class ReviewsModule { }
