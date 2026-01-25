import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteController } from '../controllers/route.controller';
import { RouteService } from '../services/route.service';
import { RouteRepository } from '../repositories/route.repository';
import { Route } from '../entities/Route.entity';
import { Brand } from '../entities/Brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route, Brand])],
  controllers: [RouteController],
  providers: [RouteService, RouteRepository], // Removed PrismaService
  exports: [RouteService],
})
export class RouteModule { }
