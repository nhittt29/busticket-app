// src/services/seat.service.ts
import { Injectable } from '@nestjs/common';
import { SeatRepository } from '../repositories/seat.repository';
import { GetSeatsByScheduleResponse } from '../dtos/get-seats-by-schedule.dto';

@Injectable()
export class SeatService {
  constructor(private readonly seatRepo: SeatRepository) {}

  async getSeatsBySchedule(scheduleId: number): Promise<GetSeatsByScheduleResponse> {
    return this.seatRepo.findSeatsByScheduleId(scheduleId);
  }
}