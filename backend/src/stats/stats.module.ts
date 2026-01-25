import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Ticket } from '../entities/Ticket.entity';
import { Schedule } from '../entities/Schedule.entity';
import { User } from '../entities/User.entity';
import { Bus } from '../entities/Bus.entity'; // if needed
// Removed PrismaService

@Module({
    imports: [TypeOrmModule.forFeature([Ticket, Schedule, User])],
    controllers: [StatsController],
    providers: [StatsService],
})
export class StatsModule { }
