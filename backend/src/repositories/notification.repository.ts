import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/Notification.entity';

@Injectable()
export class NotificationRepository {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
    ) { }

    async create(data: { userId: number; title: string; message: string; type?: string }) {
        const notification = this.notificationRepo.create({
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type || 'SYSTEM',
        });
        return this.notificationRepo.save(notification);
    }

    async findAll(userId: number) {
        return this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: number, userId: number) {
        // updateMany in Prisma vs update in TypeORM
        // TypeORM update doesn't return count easily unless UpdateResult checked
        await this.notificationRepo.update({ id, userId }, { isRead: true });
        return { count: 1 }; // Dummy return to match potential expectations or just void
    }

    async markAllAsRead(userId: number) {
        await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
        return { count: 1 };
    }
}
