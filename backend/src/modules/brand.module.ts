import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandController } from '../controllers/brand.controller';
import { BrandService } from '../services/brand.service';
import { BrandRepository } from '../repositories/brand.repository';
import { Brand } from '../entities/Brand.entity';
import { Bus } from '../entities/Bus.entity'; // Might be needed for cascade checks

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Bus])],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository], // Removed PrismaService
  exports: [BrandService],
})
export class BrandModule { }
