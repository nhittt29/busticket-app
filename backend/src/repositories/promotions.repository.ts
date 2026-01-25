import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
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

    async findById(id: number) {
        return this.repo.findOne({ where: { id } });
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
