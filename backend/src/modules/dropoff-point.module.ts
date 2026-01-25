import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DropoffPointController } from '../controllers/dropoff-point.controller';
import { DropoffPointService } from '../services/dropoff-point.service';
import { DropoffPointRepository } from '../repositories/dropoff-point.repository';
import { DropoffPoint } from '../entities/DropoffPoint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DropoffPoint])],
  controllers: [DropoffPointController],
  providers: [DropoffPointService, DropoffPointRepository],
  exports: [DropoffPointService],
})
export class DropoffPointModule { }