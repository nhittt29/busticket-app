// src/modules/dropoff-point.module.ts
import { Module } from '@nestjs/common';
import { DropoffPointController } from '../controllers/dropoff-point.controller';
import { DropoffPointService } from '../services/dropoff-point.service';
import { DropoffPointRepository } from '../repositories/dropoff-point.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [DropoffPointController],
  providers: [DropoffPointService, DropoffPointRepository, PrismaService],
  exports: [DropoffPointService],
})
export class DropoffPointModule {}