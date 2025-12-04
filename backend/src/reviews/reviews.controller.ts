import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    create(@Body() createReviewDto: any) {
        return this.reviewsService.create(createReviewDto);
    }

    @Get('pending/:userId')
    findPending(@Param('userId', ParseIntPipe) userId: number) {
        return this.reviewsService.findPending(userId);
    }

    @Get('user/:userId')
    findByUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.reviewsService.findByUser(userId);
    }
}
