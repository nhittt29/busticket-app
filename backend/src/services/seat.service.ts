import { Injectable } from '@nestjs/common';
import { SeatRepository } from '../repositories/seat.repository';

@Injectable()
export class SeatService {
    constructor(private readonly seatRepo: SeatRepository) { }

    async getSeatsBySchedule(scheduleId: number) {
        return this.seatRepo.findSeatsByScheduleId(scheduleId);
    }
}