import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketPayment } from '../entities/TicketPayment.entity';

@Injectable()
export class TicketPaymentRepository {
    constructor(
        @InjectRepository(TicketPayment)
        private readonly repo: Repository<TicketPayment>,
    ) { }

    async create(data: any) {
        const item = this.repo.create(data);
        return this.repo.save(item);
    }
}
