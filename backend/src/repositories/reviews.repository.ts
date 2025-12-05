import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Review, Prisma } from '@prisma/client';

@Injectable()
export class ReviewsRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.ReviewCreateInput): Promise<Review> {
        return this.prisma.review.create({
            data,
        });
    }

    async findByBusId(busId: number): Promise<Review[]> {
        return this.prisma.review.findMany({
            where: { busId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUserId(userId: number): Promise<Review[]> {
        return this.prisma.review.findMany({
            where: { userId },
            include: {
                bus: {
                    select: {
                        name: true,
                        brand: { select: { name: true } },
                    },
                },
                ticket: {
                    include: {
                        schedule: {
                            include: {
                                route: { select: { startPoint: true, endPoint: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAll(): Promise<Review[]> {
        return this.prisma.review.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                bus: {
                    select: {
                        id: true,
                        name: true,
                        brand: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByTicketId(ticketId: number): Promise<Review | null> {
        return this.prisma.review.findUnique({
            where: { ticketId },
        });
    }

    async getStats(busId: number): Promise<{ average: number; count: number }> {
        const aggregate = await this.prisma.review.aggregate({
            where: { busId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        return {
            average: aggregate._avg.rating || 0,
            count: aggregate._count.rating || 0,
        };
    }

    async findById(id: number): Promise<Review | null> {
        return this.prisma.review.findUnique({
            where: { id },
        });
    }

    async update(id: number, data: Prisma.ReviewUpdateInput): Promise<Review> {
        return this.prisma.review.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<Review> {
        return this.prisma.review.delete({
            where: { id },
        });
    }
}
