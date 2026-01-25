import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusController } from '../controllers/bus.controller';
import { BusService } from '../services/bus.service';
import { BusRepository } from '../repositories/bus.repository';
import { Bus } from '../entities/Bus.entity';
import { Seat } from '../entities/Seat.entity';
import { Brand } from '../entities/Brand.entity'; // Might be needed for cascading or checks if repo extended
import { Schedule } from '../entities/Schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bus, Seat, Brand, Schedule])],
  controllers: [BusController],
  providers: [BusService, BusRepository], // PrismaService removed
  exports: [BusService],
})
export class BusModule { }
