import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Schedule } from './Schedule.entity';
import { Ticket } from './Ticket.entity';

@Entity('DropoffPoint')
export class DropoffPoint {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    scheduleId: number;

    @ManyToOne(() => Schedule, (schedule) => schedule.dropoffPoints)
    @JoinColumn({ name: 'scheduleId' })
    schedule: Schedule;

    @Column()
    name: string;

    @Column({ nullable: true, length: 1000 })
    address: string;

    @Column('float', { default: 0 })
    surcharge: number;

    @Column('float', { default: 0 })
    priceDifference: number;

    @Column({ default: false })
    isDefault: boolean;

    @Column({ default: 0, name: 'order_num' }) // explicit column name mapping for 'order'
    order: number;

    @OneToMany(() => Ticket, (ticket) => ticket.dropoffPoint)
    tickets: Ticket[];

    @CreateDateColumn()
    createdAt: Date;
}
