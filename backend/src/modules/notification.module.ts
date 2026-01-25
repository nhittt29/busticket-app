import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../entities/Notification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationRepository], // Removed PrismaService
    exports: [NotificationService],
})
export class NotificationModule { }
