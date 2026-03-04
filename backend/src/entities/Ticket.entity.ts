import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { User } from './User.entity';
import { Schedule } from './Schedule.entity';
import { Seat } from './Seat.entity';
import { DropoffPoint } from './DropoffPoint.entity';
import { PaymentHistory } from './PaymentHistory.entity';
import { TicketPayment } from './TicketPayment.entity';
import { Review } from './Review.entity';

@Entity('Ticket')
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.tickets)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    scheduleId: number;

    @ManyToOne(() => Schedule, (schedule) => schedule.tickets)
    @JoinColumn({ name: 'scheduleId' })
    schedule: Schedule;

    @Column()
    seatId: number;

    @ManyToOne(() => Seat, (seat) => seat.tickets)
    @JoinColumn({ name: 'seatId' })
    seat: Seat;

    @Column('float')
    price: number;

    @Column('float', { default: 0 })
    surcharge: number;

    @Column('float', { default: 0 })
    totalPrice: number;

    @Column('float', { nullable: true })
    cancellationFee: number;

    @Column('float', { nullable: true })
    refundAmount: number;

    @Column({ default: 'BOOKED', length: 50 })
    status: string;

    @Column({ nullable: true, length: 50 })
    paymentMethod: string;

    @Column({ nullable: true })
    dropoffPointId: number;

    @ManyToOne(() => DropoffPoint, (dropoffPoint) => dropoffPoint.tickets)
    @JoinColumn({ name: 'dropoffPointId' })
    dropoffPoint: DropoffPoint;

    @Column({ nullable: true, length: 1000 })
    dropoffAddress: string;

    @Column({ nullable: true })
    paymentHistoryId: number;

    @ManyToOne(() => PaymentHistory, (paymentHistory) => paymentHistory.tickets)
    @JoinColumn({ name: 'paymentHistoryId' })
    paymentHistory: PaymentHistory;

    @OneToMany(() => TicketPayment, (ticketPayment) => ticketPayment.ticket)
    ticketPayments: TicketPayment[];

    @OneToOne(() => Review, (review) => review.ticket)
    review: Review;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
