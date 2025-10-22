import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PrismaService } from './services/prisma.service';
import { UserRepository } from './repositories/user.repository';
import { BusModule } from './modules/bus.module';
import { BrandModule } from './modules/brand.module';
import { RouteModule } from './modules/route.module'; // ✅ thêm dòng này

@Module({
  imports: [BusModule, BrandModule, RouteModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserRepository],
})
export class AppModule {}
