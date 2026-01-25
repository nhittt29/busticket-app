import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropoffPoint } from '../entities/DropoffPoint.entity';

@Injectable()
export class DropoffPointRepository {
  constructor(
    @InjectRepository(DropoffPoint)
    private readonly repo: Repository<DropoffPoint>,
  ) { }

  async findManyByScheduleId(scheduleId: number) {
    return this.repo.find({
      where: { scheduleId },
      order: { order: 'ASC' },
    });
  }

  async create(data: any) {
    // Note: data likely includes scheduleId based on usage
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return this.findUnique(id);
  }

  async delete(id: number) {
    await this.repo.delete(id);
    return { id };
  }

  async findUnique(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['tickets'],
    });
  }

  async resetDefault(scheduleId: number) {
    await this.repo.update({ scheduleId }, { isDefault: false });
  }
}