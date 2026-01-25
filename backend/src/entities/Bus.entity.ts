import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Brand } from './Brand.entity';
import { Seat } from './Seat.entity';
import { Schedule } from './Schedule.entity';
import { Review } from './Review.entity';

@Entity('Bus')
export class Bus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true, length: 50 })
    licensePlate: string;

    @Column()
    seatCount: number;

    @Column({ length: 50 })
    category: string; // Enum logic handled in service/dto validation

    @Column({ length: 50 })
    seatType: string;

    @Column({ nullable: true, length: 50 })
    berthType: string;

    @Column()
    brandId: number;

    @ManyToOne(() => Brand, (brand) => brand.buses)
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @OneToMany(() => Seat, (seat) => seat.bus)
    seats: Seat[];

    @OneToMany(() => Schedule, (schedule) => schedule.bus)
    schedules: Schedule[];

    @OneToMany(() => Review, (review) => review.bus)
    reviews: Review[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
