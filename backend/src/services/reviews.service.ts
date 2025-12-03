import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { PrismaService } from './prisma.service';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { UpdateReviewDto } from '../dtos/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        private reviewsRepository: ReviewsRepository,
        private prisma: PrismaService,
    ) { }

    async create(userId: number, dto: CreateReviewDto) {
        // 1. Check ticket
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: dto.ticketId },
            include: { schedule: true },
        });

        if (!ticket) {
            throw new NotFoundException('Vé không tồn tại');
        }

        if (ticket.userId !== userId) {
            throw new BadRequestException('Bạn không có quyền đánh giá vé này');
        }

        // 2. Check status
        if (ticket.schedule.status !== 'COMPLETED') {
            throw new BadRequestException('Chuyến đi chưa hoàn thành, chưa thể đánh giá');
        }

        // 3. Check duplicate
        const existing = await this.reviewsRepository.findByTicketId(dto.ticketId);
        if (existing) {
            throw new BadRequestException('Bạn đã đánh giá vé này rồi');
        }

        // 4. Create
        return this.reviewsRepository.create({
            rating: dto.rating,
            comment: dto.comment,
            user: { connect: { id: userId } },
            bus: { connect: { id: ticket.schedule.busId } },
            ticket: { connect: { id: ticket.id } },
        });
    }

    async findAll() {
        return this.reviewsRepository.findAll();
    }

    async findByBusId(busId: number) {
        return this.reviewsRepository.findByBusId(busId);
    }

    async getStats(busId: number) {
        return this.reviewsRepository.getStats(busId);
    }

    async update(userId: number, reviewId: number, dto: UpdateReviewDto) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Đánh giá không tồn tại');
        }

        if (review.userId !== userId) {
            throw new BadRequestException('Bạn không có quyền chỉnh sửa đánh giá này');
        }

        return this.reviewsRepository.update(reviewId, {
            rating: dto.rating,
            comment: dto.comment,
        });
    }

    async delete(userId: number, reviewId: number) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Đánh giá không tồn tại');
        }

        if (review.userId !== userId) {
            throw new BadRequestException('Bạn không có quyền xóa đánh giá này');
        }

        return this.reviewsRepository.delete(reviewId);
    }
}
