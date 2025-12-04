import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(createReviewDto: any) {
        const { userId, ticketId, rating, comment } = createReviewDto;

        // Check if ticket exists and belongs to user
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { schedule: true },
        });

        if (!ticket) {
            throw new BadRequestException('Ticket not found');
        }

        if (ticket.userId !== userId) {
            throw new BadRequestException('Ticket does not belong to user');
        }

        // Check if ticket is already reviewed
        const existingReview = await this.prisma.review.findUnique({
            where: { ticketId },
        });

        if (existingReview) {
            throw new BadRequestException('Ticket already reviewed');
        }

        // Check if trip is completed (optional, but recommended)
        // if (ticket.schedule.status !== 'COMPLETED') {
        //   throw new BadRequestException('Cannot review an incomplete trip');
        // }

        return this.prisma.review.create({
            data: {
                userId,
                ticketId,
                busId: ticket.schedule.busId,
                rating,
                comment,
            },
        });
    }

    async findPending(userId: number) {
        // Find tickets that are PAID, schedule is COMPLETED (or past departure time), and NOT reviewed
        const now = new Date();
        console.log(`Finding pending reviews for user ${userId} at ${now.toISOString()}`);

        const tickets = await this.prisma.ticket.findMany({
            where: {
                userId,
                status: 'PAID',
                schedule: {
                    status: { not: 'CANCELLED' },
                    OR: [
                        { departureAt: { lt: now } },
                        { status: 'COMPLETED' }
                    ],
                },
                review: {
                    is: null, // No review yet
                },
            },
            include: {
                schedule: {
                    include: {
                        route: true,
                        bus: {
                            include: {
                                brand: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                schedule: {
                    departureAt: 'desc',
                },
            },
        });

        console.log(`Found ${tickets.length} pending tickets for user ${userId}`);
        return tickets;
    }

    async findByUser(userId: number) {
        return this.prisma.review.findMany({
            where: { userId },
            include: {
                ticket: {
                    include: {
                        schedule: {
                            include: {
                                route: true,
                                bus: {
                                    include: {
                                        brand: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
