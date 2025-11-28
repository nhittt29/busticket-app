import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../repositories/user.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
    controllers: [UserController],
    providers: [UserService, UserRepository, PrismaService],
    exports: [UserService],
})
export class UserModule { }
