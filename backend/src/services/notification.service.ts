import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationService {
    constructor(private notificationRepo: NotificationRepository) { }

    async create(data: { userId: number; title: string; message: string; type?: string }) {
        return this.notificationRepo.create(data);
    }

    async findAll(userId: number) {
        return this.notificationRepo.findAll(userId);
    }

    async markAsRead(id: number, userId: number) {
        return this.notificationRepo.markAsRead(id, userId);
    }

    async markAllAsRead(userId: number) {
        return this.notificationRepo.markAllAsRead(userId);
    }
}
