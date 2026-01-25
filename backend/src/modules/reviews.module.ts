import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from '../controllers/reviews.controller';
import { ReviewsService } from '../services/reviews.service';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { Review } from '../entities/Review.entity';
import { TicketModule } from './ticket.module';

import { UserModule } from './user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review]),
        TicketModule,
        UserModule
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule { }
