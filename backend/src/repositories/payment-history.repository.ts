import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentHistory } from '../entities/PaymentHistory.entity';

@Injectable()
export class PaymentHistoryRepository {
    constructor(
        @InjectRepository(PaymentHistory)
        private readonly paymentRepo: Repository<PaymentHistory>,
    ) { }

    async create(data: any) {
        const payment = this.paymentRepo.create(data);
        return this.paymentRepo.save(payment);
    }

    async update(id: number, data: any) {
        await this.paymentRepo.update(id, data);
        return this.findById(id);
    }

    async findById(id: number) {
        return this.paymentRepo.findOne({ where: { id } });
    }

    async findByIdWithRelations(id: number) {
        return this.paymentRepo.findOne({
            where: { id },
            relations: [
                'ticketPayments',
                'ticketPayments.ticket',
                'ticketPayments.ticket.seat',
                'ticketPayments.ticket.user',
                'ticketPayments.ticket.schedule',
                'ticketPayments.ticket.schedule.route',
                'ticketPayments.ticket.schedule.bus',
                'tickets',
                'tickets.seat',
                'tickets.user',
                'tickets.schedule',
                'tickets.schedule.route',
                'tickets.schedule.bus',
            ],
        });
    }

    async findByTransactionId(transactionId: string) {
        return this.paymentRepo.findOne({ where: { transactionId } });
    }

    async findFirst(options: any) {
        // Adapter for Prisma findFirst if needed, but better to use TypeORM logic in Service
        // This allows gradual migration if service still calls findFirst with Prisma-like syntax
        // But we are rewriting Service, so this might not be needed.
        // Provided for safety if I miss something.    
        return this.paymentRepo.findOne(options);
    }
}
