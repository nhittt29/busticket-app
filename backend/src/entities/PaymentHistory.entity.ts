import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ticket } from './Ticket.entity';
import { TicketPayment } from '../entities/TicketPayment.entity';

@Entity('payment_history')
export class PaymentHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    method: string;

    @Column('float')
    amount: number;

    @Column({ nullable: true, length: 255 })
    transactionId: string;

    @Column({ default: 'PENDING', length: 50 })
    status: string;

    @Column({ type: 'clob', nullable: true })
    qrCode: string;

    @Column({ nullable: true, length: 255 })
    ticketCode: string;

    @Column({ type: 'clob', nullable: true })
    seatList: string;

    @Column({ default: 0 })
    seatCount: number;

    @Column({ type: 'clob', nullable: true })
    payUrl: string;

    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date;

    @Column({ nullable: true })
    promotionId: number;

    @Column('float', { nullable: true })
    discountAmount: number;

    @OneToMany(() => Ticket, (ticket) => ticket.paymentHistory)
    tickets: Ticket[];

    @OneToMany(() => TicketPayment, (ticketPayment) => ticketPayment.payment)
    ticketPayments: TicketPayment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
