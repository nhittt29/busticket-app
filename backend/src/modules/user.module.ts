import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { RoleController } from '../controllers/role.controller';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { User } from '../entities/User.entity';
import { Role } from '../entities/Role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Role])],
    controllers: [UserController, RoleController],
    providers: [UserService, UserRepository, RoleRepository], // PrismaService removed
    exports: [UserService, UserRepository], // Export Repositories if needed by others
})
export class UserModule { }
