import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bus } from './Bus.entity';
import { Ticket } from './Ticket.entity';

@Entity('Seat')
export class Seat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    seatNumber: number;

    @Column({ unique: true, length: 50 })
    code: string;

    @Column({ default: true })
    isAvailable: boolean;

    @Column('float')
    price: number;

    @Column({ nullable: true })
    floor: number;

    @Column({ nullable: true, length: 50 })
    roomType: string;

    @Column()
    busId: number;

    @ManyToOne(() => Bus, (bus) => bus.seats)
    @JoinColumn({ name: 'busId' })
    bus: Bus;

    @OneToMany(() => Ticket, (ticket) => ticket.seat)
    tickets: Ticket[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
