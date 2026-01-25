import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bus } from './Bus.entity';
import { Route } from './Route.entity';

@Entity('Brand')
export class Brand {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true, length: 50 })
    phoneNumber: string;

    @Column({ nullable: true, length: 1000 })
    image: string;

    @Column({ nullable: true, length: 1000 })
    address: string;

    @Column({ default: 100 })
    dailyTicketLimit: number;

    @OneToMany(() => Bus, (bus) => bus.brand)
    buses: Bus[];

    @OneToMany(() => Route, (route) => route.brand)
    routes: Route[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
