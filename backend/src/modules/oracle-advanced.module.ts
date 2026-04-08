import { Module } from '@nestjs/common';
import { OracleAdvancedController } from '../controllers/oracle-advanced.controller';
import { OracleAdvancedService } from '../services/oracle-advanced.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [OracleAdvancedController],
  providers: [OracleAdvancedService],
})
export class OracleAdvancedModule {}
