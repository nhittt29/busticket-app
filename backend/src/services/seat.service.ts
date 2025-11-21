// src/services/seat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { SeatRepository } from '../repositories/seat.repository';
import { GetSeatsByScheduleResponse } from '../dtos/get-seats-by-schedule.dto';

@Injectable()
export class SeatService {
  constructor(private readonly seatRepo: SeatRepository) {}

  async getSeatsBySchedule(scheduleId: number): Promise<GetSeatsByScheduleResponse> {
    const result = await this.seatRepo.findSeatsByScheduleId(scheduleId);

    return {
      busId: result.busId,
      busName: result.busName,
      seatType: result.seatType,
      totalSeats: result.totalSeats,
      seats: result.seats,
    };
  }
}