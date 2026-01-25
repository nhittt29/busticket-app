import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('Promotion')
export class Promotion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    code: string;

    @Column({ length: 1000 })
    description: string;

    @Column({ length: 50 })
    discountType: string;

    @Column('float')
    discountValue: number;

    @Column('float', { default: 0 })
    minOrderValue: number;

    @Column('float', { nullable: true })
    maxDiscount: number;

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

    @Column({ default: 0 })
    usageLimit: number;

    @Column({ default: 0 })
    usedCount: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
