import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepo: UserRepository) { }

    async findAll() {
        return this.userRepo.findAll();
    }

    async findOne(id: number) {
        return this.userRepo.findById(id);
    }

    async update(id: number, data: any) {
        return this.userRepo.updateUser(id, data);
    }

    async remove(id: number) {
        return this.userRepo.deleteUser(id);
    }
}
