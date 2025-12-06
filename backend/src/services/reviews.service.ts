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
        console.log(`Creating review for ticket ${ticket.id}, user ${userId}, bus ${ticket.schedule.busId}`);
        const review = await this.reviewsRepository.create({
            rating: dto.rating,
            comment: dto.comment,
            images: dto.images || [],
            user: { connect: { id: userId } },
            bus: { connect: { id: ticket.schedule.busId } },
            ticket: { connect: { id: ticket.id } },
        });
        console.log('Review created:', review);
        return review;
    }

    async findByBusId(busId: number) {
        return this.reviewsRepository.findByBusId(busId);
    }

    async findByUserId(userId: number) {
        return this.reviewsRepository.findByUserId(userId);
    }

    async findUnreviewedTickets(userId: number) {
        console.log(`Finding unreviewed tickets for user ${userId}`);
        const tickets = await this.prisma.ticket.findMany({
            where: {
                userId,
                status: 'PAID',
                schedule: {
                    // Cho phép đánh giá sau khi chuyến đi kết thúc (thời gian đến < hiện tại)
                    arrivalAt: { lt: new Date() },
                    status: 'COMPLETED',
                },
                review: null, // Chưa có đánh giá nào
            },
            include: {
                schedule: {
                    include: {
                        route: true,
                        bus: { include: { brand: true } },
                    },
                },
                seat: true,
            },
            orderBy: {
                schedule: { departureAt: 'desc' },
            },
        });
        console.log(`Found ${tickets.length} unreviewed tickets`);
        return tickets;
    }

    async findAll() {
        return this.reviewsRepository.findAll();
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
            images: dto.images || [],
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

    async reply(reviewId: number, reply: string) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) {
            throw new NotFoundException('Đánh giá không tồn tại');
        }

        return this.reviewsRepository.update(reviewId, {
            reply,
            repliedAt: new Date(),
        });
    }
}
