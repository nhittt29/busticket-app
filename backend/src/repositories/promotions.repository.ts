import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, MoreThanOrEqual, LessThanOrEqual, In, Not } from 'typeorm';
import { Promotion } from '../entities/Promotion.entity';

@Injectable()
export class PromotionsRepository {
    constructor(
        @InjectRepository(Promotion)
        private readonly repo: Repository<Promotion>,
    ) { }

    async create(data: any) {
        const item = this.repo.create(data);
        return this.repo.save(item);
    }

    async findByCode(code: string) {
        return this.repo.findOne({ where: { code } });
    }

    async findAllAdmin() {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async findActive() {
        const now = new Date();
        return this.repo.find({
            where: {
                isActive: true,
                startDate: LessThanOrEqual(now),
                endDate: MoreThanOrEqual(now),
            },
            order: { endDate: 'ASC' },
        });
    }

    async getUsedPromotionIdsByUser(userId: number): Promise<number[]> {
        const result = await this.repo.manager.createQueryBuilder()
            .select('ph.promotionId', 'promotionId')
            .from('payment_history', 'ph')
            .innerJoin('Ticket', 't', 't.paymentHistoryId = ph.id')
            .where('t.userId = :userId', { userId })
            .andWhere('ph.status = :status', { status: 'SUCCESS' })
            .andWhere('ph.promotionId IS NOT NULL')
            .distinct(true)
            .getRawMany();

        return result.map(r => r.promotionId);
    }

    async findActiveForUser(userId: number) {
        const now = new Date();
        const usedIds = await this.getUsedPromotionIdsByUser(userId);

        const where: any = {
            isActive: true,
            startDate: LessThanOrEqual(now),
            endDate: MoreThanOrEqual(now),
        };

        if (usedIds.length > 0) {
            where.id = Not(In(usedIds));
        }

        return this.repo.find({
            where,
            order: { endDate: 'ASC' },
        });
    }

    async findById(id: number) {
        return this.repo.findOne({ where: { id } });
    }

    async update(id: number, data: any) {
        await this.repo.update(id, data);
        return this.findById(id);
    }

    async incrementUsage(id: number) {
        return this.repo.increment({ id }, 'usedCount', 1);
    }

    async delete(id: number) {
        await this.repo.delete(id);
        return { id };
    }
}
