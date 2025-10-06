import { Module } from '@nestjs/common';
import { BusController } from '../controllers/bus.controller';
import { BusService } from '../services/bus.service';
import { BusRepository } from '../repositories/bus.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [BusController],
  providers: [BusService, BusRepository, PrismaService],
})
export class BusModule {}
