// src/services/booking.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../entities/Schedule.entity';
// import { ReminderInfoDto } from '../dtos/reminder-info.dto'; 

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) { }

  // LẤY THÔNG TIN NHẮC NHỞ KHÁCH HÀNG
  async getReminderInfo(scheduleId: number): Promise<any> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['bus', 'route', 'tickets', 'tickets.seat'],
    });

    if (schedule) {
      this.logger.log(`[Departure Reminder] Frontend requested info for Schedule #${scheduleId}. Bus: ${schedule.bus.name}`);
    }

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    // Filter paid tickets
    const paidTickets = schedule.tickets.filter(t => t.status === 'PAID');

    return {
      departureAt: schedule.departureAt.toISOString(),
      arrivalAt: schedule.arrivalAt.toISOString(),
      busName: schedule.bus.name,
      from: schedule.route.startPoint,
      to: schedule.route.endPoint,
      seatNumbers: paidTickets.map((t) =>
        t.seat.seatNumber.toString().padStart(2, '0'),
      ),
    };
  }
}
