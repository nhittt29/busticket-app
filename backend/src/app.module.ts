// src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AppModule {}