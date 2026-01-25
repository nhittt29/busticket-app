import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/Review.entity';

@Injectable()
export class ReviewsRepository {
    constructor(
        @InjectRepository(Review)
        private readonly repo: Repository<Review>,
    ) { }

    async create(data: any) {
        const item = this.repo.create(data);
        return this.repo.save(item);
    }

    async findByBusId(busId: number) {
        return this.repo.find({
            where: { busId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUserId(userId: number) {
        return this.repo.find({
            where: { userId },
            relations: ['bus', 'bus.brand', 'ticket', 'ticket.schedule', 'ticket.schedule.route'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAll() {
        return this.repo.find({
            relations: ['user', 'bus', 'bus.brand'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByTicketId(ticketId: number) {
        return this.repo.findOne({ where: { ticketId } });
    }

    async getStats(busId: number) {
        const { avg, count } = await this.repo
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avg')
            .addSelect('COUNT(review.rating)', 'count')
            .where('review.busId = :busId', { busId })
            .getRawOne();

        return {
            average: parseFloat(avg) || 0,
            count: parseInt(count) || 0,
        };
    }

    async findById(id: number) {
        return this.repo.findOne({
            where: { id },
            relations: ['user', 'bus', 'bus.brand', 'ticket', 'ticket.schedule', 'ticket.schedule.route'],
        });
    }

    async update(id: number, data: any) {
        await this.repo.update(id, data);
        return this.findById(id);
    }

    async delete(id: number) {
        await this.repo.delete(id);
        return { id };
    }
}
