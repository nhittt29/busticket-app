import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Headers, ParseIntPipe, UnauthorizedException, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { UpdateReviewDto } from '../dtos/update-review.dto';
import { auth } from '../config/firebase';
import { PrismaService } from '../services/prisma.service';

@Controller('reviews')
export class ReviewsController {
    constructor(
        private reviewsService: ReviewsService,
        private prisma: PrismaService,
    ) { }

    private async getUserIdFromToken(authHeader: string): Promise<number> {
        if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
        const token = authHeader.split(' ')[1];

        try {
            const decodedToken = await auth.verifyIdToken(token);
            const user = await this.prisma.user.findUnique({
                where: { uid: decodedToken.uid },
            });
            if (!user) throw new NotFoundException('User not found');
            return user.id;
        } catch (e) {
            throw new UnauthorizedException('Invalid token or user not found');
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() dto: CreateReviewDto,
        @Headers('Authorization') authHeader: string,
    ) {
        const userId = await this.getUserIdFromToken(authHeader);
        return this.reviewsService.create(userId, dto);
    }

    @Get('my-reviews')
    async getMyReviews(@Headers('Authorization') authHeader: string) {
        const userId = await this.getUserIdFromToken(authHeader);
        return this.reviewsService.findByUserId(userId);
    }

    @Get()
    async findAll() {
        return this.reviewsService.findAll();
    }

    @Get('unreviewed')
    async getUnreviewed(@Headers('Authorization') authHeader: string) {
        const userId = await this.getUserIdFromToken(authHeader);
        return this.reviewsService.findUnreviewedTickets(userId);
    }

    @Get('bus/:busId')
    async findByBusId(@Param('busId', ParseIntPipe) busId: number) {
        return this.reviewsService.findByBusId(busId);
    }

    @Get('stats/:busId')
    async getStats(@Param('busId', ParseIntPipe) busId: number) {
        return this.reviewsService.getStats(busId);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateReviewDto,
        @Headers('Authorization') authHeader: string,
    ) {
        const userId = await this.getUserIdFromToken(authHeader);
        return this.reviewsService.update(userId, id, dto);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @Headers('Authorization') authHeader: string,
    ) {
        const userId = await this.getUserIdFromToken(authHeader);
        return this.reviewsService.delete(userId, id);
    }

    @Patch(':id/reply')
    async reply(@Param('id', ParseIntPipe) id: number, @Body('reply') reply: string) {
        return this.reviewsService.reply(id, reply);
    }
}
