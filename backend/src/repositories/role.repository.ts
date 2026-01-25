import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/Role.entity';

@Injectable()
export class RoleRepository {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) { }

    async findByName(name: string) {
        return this.roleRepo.findOne({ where: { name } });
    }

    async findById(id: number) {
        return this.roleRepo.findOne({ where: { id } });
    }
}
