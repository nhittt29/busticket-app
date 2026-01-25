import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Brand } from './Brand.entity';
import { Schedule } from './Schedule.entity';

@Entity('Route')
export class Route {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    startPoint: string;

    @Column()
    endPoint: string;

    @Column()
    averageDurationMin: number;

    @Column('float')
    lowestPrice: number;

    @Column('float', { nullable: true })
    distanceKm: number;

    @Column({ nullable: true })
    brandId: number;

    @ManyToOne(() => Brand, (brand) => brand.routes)
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @OneToMany(() => Schedule, (schedule) => schedule.route)
    schedules: Schedule[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
