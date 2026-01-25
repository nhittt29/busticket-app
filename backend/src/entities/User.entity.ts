import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Role } from './Role.entity';
import { Ticket } from './Ticket.entity';
import { Review } from './Review.entity';
import { Notification } from './Notification.entity';

@Entity('User')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    uid: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, length: 50 })
    phone: string;

    @Column({ type: 'date', nullable: true })
    dob: Date;

    @Column({ nullable: true, default: 'OTHER', length: 20 })
    gender: string;

    @Column({ nullable: true, length: 1000 })
    avatar: string;

    @Column({ nullable: true, length: 1000 })
    faceUrl: string;

    @Column({
        default: true,
        transformer: {
            from: (val: number) => val === 1,
            to: (val: boolean) => (val ? 1 : 0),
        },
    })
    isActive: boolean;

    @Column()
    roleId: number;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    tickets: Ticket[];

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
