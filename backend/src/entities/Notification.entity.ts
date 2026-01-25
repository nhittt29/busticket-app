import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('Notification')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'clob' })
    message: string;

    @Column({ default: 'SYSTEM', length: 50 })
    type: string;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
