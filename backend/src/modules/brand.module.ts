import { Module } from '@nestjs/common';
import { BrandController } from '../controllers/brand.controller';
import { BrandService } from '../services/brand.service';
import { BrandRepository } from '../repositories/brand.repository';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [BrandController],
  providers: [BrandService, BrandRepository, PrismaService],
})
export class BrandModule {}
