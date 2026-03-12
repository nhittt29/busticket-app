import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/Role.entity';

@Controller('roles')
export class RoleController {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) { }

    @Get()
    async findAll() {
        const data = await this.roleRepo.find();
        return data; // NestJS will automatically serialize this to JSON array. Refine typically expects data directly or wrapped. Let's return just data.
    }
}
