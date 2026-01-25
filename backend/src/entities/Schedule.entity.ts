import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bus } from './Bus.entity';
import { Route } from './Route.entity';
import { Ticket } from './Ticket.entity';
import { DropoffPoint } from './DropoffPoint.entity';

@Entity('Schedule')
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    busId: number;

    @ManyToOne(() => Bus, (bus) => bus.schedules)
    @JoinColumn({ name: 'busId' })
    bus: Bus;

    @Column()
    routeId: number;

    @ManyToOne(() => Route, (route) => route.schedules)
    @JoinColumn({ name: 'routeId' })
    route: Route;

    @Column({ type: 'timestamp' })
    departureAt: Date;

    @Column({ type: 'timestamp' })
    arrivalAt: Date;

    @Column({ default: 'UPCOMING', length: 50 })
    status: string;

    @OneToMany(() => Ticket, (ticket) => ticket.schedule)
    tickets: Ticket[];

    @OneToMany(() => DropoffPoint, (dropoffPoint) => dropoffPoint.schedule)
    dropoffPoints: DropoffPoint[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
