import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Ticket } from './Ticket.entity';
import { PaymentHistory } from './PaymentHistory.entity';

@Entity('TicketPayment')
@Unique(['ticketId', 'paymentId'])
export class TicketPayment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ticketId: number;

    @Column()
    paymentId: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.ticketPayments)
    @JoinColumn({ name: 'ticketId' })
    ticket: Ticket;

    @ManyToOne(() => PaymentHistory, (paymentHistory) => paymentHistory.ticketPayments)
    @JoinColumn({ name: 'paymentId' })
    payment: PaymentHistory;

    @CreateDateColumn()
    createdAt: Date;
}
