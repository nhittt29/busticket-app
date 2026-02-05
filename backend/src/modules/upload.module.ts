
import { Module } from '@nestjs/common';
import { UploadController } from '../controllers/upload.controller';
import { UploadService } from '../services/upload.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/User.entity';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [UploadController],
    providers: [UploadService, FirebaseAuthGuard],
    exports: [UploadService],
})
export class UploadModule { }
