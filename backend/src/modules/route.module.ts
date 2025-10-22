import { Module } from '@nestjs/common';
import { RouteController } from '../controllers/route.controller';
import { RouteService } from '../services/route.service';
import { RouteRepository } from '../repositories/route.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [RouteController],
  providers: [RouteService, RouteRepository, PrismaService],
})
export class RouteModule {}
