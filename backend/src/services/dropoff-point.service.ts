// src/services/dropoff-point.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DropoffPointRepository } from '../repositories/dropoff-point.repository';
import { CreateDropoffPointDto, UpdateDropoffPointDto } from '../dtos/dropoff-point.dto';

@Injectable()
export class DropoffPointService {
  constructor(private readonly repo: DropoffPointRepository) {}

  async getByScheduleId(scheduleId: number) {
    const points = await this.repo.findManyByScheduleId(scheduleId);
    if (points.length === 0) {
      throw new NotFoundException(`Chưa có điểm trả khách cho chuyến xe #${scheduleId}`);
    }
    return points;
  }

  async create(scheduleId: number, dto: CreateDropoffPointDto) {
    if (dto.isDefault) {
      await this.repo.resetDefault(scheduleId);
    }

    const data = {
      name: dto.name,
      address: dto.address ?? null,
      surcharge: dto.surcharge,
      isDefault: dto.isDefault ?? false,
      order: dto.order ?? 0,
      schedule: { connect: { id: scheduleId } },
    };

    return this.repo.create(data);
  }

  async update(id: number, dto: UpdateDropoffPointDto) {
    const point = await this.repo.findUnique(id);
    if (!point) throw new NotFoundException(`Không tìm thấy điểm trả #${id}`);

    if (dto.isDefault === true) {
      await this.repo.resetDefault(point.scheduleId);
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.surcharge !== undefined) data.surcharge = dto.surcharge;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;
    if (dto.order !== undefined) data.order = dto.order;

    return this.repo.update(id, data);
  }

  async delete(id: number) {
    const point = await this.repo.findUnique(id);
    if (!point) throw new NotFoundException(`Không tìm thấy điểm trả #${id}`);
    if (point.tickets && point.tickets.length > 0) {
      throw new BadRequestException('Không thể xóa điểm trả đã có khách đặt');
    }
    return this.repo.delete(id);
  }
}