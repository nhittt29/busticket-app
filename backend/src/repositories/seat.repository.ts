import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from '../entities/Seat.entity';
import { Schedule } from '../entities/Schedule.entity';

@Injectable()
export class SeatRepository {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepo: Repository<Seat>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) { }

  async findById(id: number) {
    return this.seatRepo.findOne({ where: { id } });
  }

  async updateAvailability(id: number, isAvailable: boolean) {
    return this.seatRepo.update(id, { isAvailable });
  }

  // LOGIC CHÍNH ĐỂ LẤY GHẾ + CHECK BOOKED THEO SCHEDULE
  async findSeatsByScheduleId(scheduleId: number) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['bus'],
    });

    if (!schedule || !schedule.bus) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    // Logic: Find seats of this bus, AND left join tickets filtered by this scheduleId
    const seats = await this.seatRepo.createQueryBuilder('seat')
      .leftJoinAndSelect('seat.tickets', 'ticket', 'ticket.scheduleId = :scheduleId AND ticket.status != :cancelled', { scheduleId, cancelled: 'CANCELLED' })
      .where('seat.busId = :busId', { busId: schedule.busId })
      .orderBy('seat.floor', 'ASC')
      .addOrderBy('seat.seatNumber', 'ASC')
      .getMany();

    return {
      scheduleId: schedule.id,
      busId: schedule.busId,
      busName: schedule.bus.name,
      seatType: schedule.bus.seatType,
      totalSeats: schedule.bus.seatCount,
      seats: seats.map(seat => ({
        id: seat.id,
        seatNumber: seat.seatNumber.toString(),
        code: seat.code,
        // Is Available if NO active tickets found for this schedule
        isAvailable: seat.tickets.length === 0,
        price: Number(seat.price),
        floor: seat.floor ?? undefined,
        roomType: seat.roomType ?? undefined,
      })),
    };
  }
}