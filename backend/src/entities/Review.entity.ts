import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.entity';
import { Bus } from './Bus.entity';
import { Ticket } from './Ticket.entity';

@Entity('Review')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rating: number;

    @Column({ type: 'clob', nullable: true })
    comment: string;

    @Column({
        type: 'clob',
        nullable: true,
        transformer: {
            from: (val: string) => (val ? JSON.parse(val) : []),
            to: (val: string[]) => (val ? JSON.stringify(val) : JSON.stringify([])),
        },
    })
    images: string[]; // Handled as array in code, string in DB

    @Column({ type: 'clob', nullable: true })
    reply: string;

    @Column({ type: 'timestamp', nullable: true })
    repliedAt: Date;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    busId: number;

    @ManyToOne(() => Bus, (bus) => bus.reviews)
    @JoinColumn({ name: 'busId' })
    bus: Bus;

    @Column({ unique: true })
    ticketId: number;

    @OneToOne(() => Ticket, (ticket) => ticket.review)
    @JoinColumn({ name: 'ticketId' })
    ticket: Ticket;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
