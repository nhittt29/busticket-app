import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Ticket } from '../entities/Ticket.entity';

@Injectable()
export class TicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) { }

  // ... Previous methods ...
  async create(data: any) {
    const ticket = this.ticketRepo.create(data);
    return this.ticketRepo.save(ticket);
  }

  async findById(id: number) {
    return this.ticketRepo.findOne({
      where: { id },
      relations: ['user', 'schedule', 'schedule.bus', 'schedule.route', 'seat', 'paymentHistory'] // Loading relations as needed
    });
  }

  async update(id: number, data: any) {
    await this.ticketRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.ticketRepo.delete(id);
    return { message: 'Deleted' };
  }

  async checkSeatBooked(scheduleId: number, seatId: number) {
    return this.ticketRepo.findOne({
      where: { scheduleId, seatId, status: 'BOOKED' } // Enum string value
    });
  }

  async findUserBookedToday(userId: number) {
    // Logic for today count
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return this.ticketRepo.count({
      where: { userId, createdAt: Between(start, end) }
    });
  }

  async getTicketsByUser(userId: number) {
    return this.ticketRepo.find({
      where: { userId },
      relations: ['schedule', 'schedule.bus', 'schedule.route', 'seat', 'review'],
      order: { createdAt: 'DESC' }
    });
  }

  // BRAND: Retrieve tickets for a specific brand
  async findByBrandId(brandId: number) {
    return this.ticketRepo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.schedule', 'schedule')
      .leftJoinAndSelect('schedule.bus', 'bus')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .leftJoinAndSelect('ticket.paymentHistory', 'paymentHistory')
      .where('bus.brandId = :brandId', { brandId })
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async findUnreviewedTickets(userId: number) {
    const now = new Date();
    return this.ticketRepo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.schedule', 'schedule')
      .leftJoinAndSelect('schedule.route', 'route')
      .leftJoinAndSelect('schedule.bus', 'bus')
      .leftJoinAndSelect('bus.brand', 'brand')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .leftJoinAndSelect('ticket.review', 'review')
      .where('ticket.userId = :userId', { userId })
      .andWhere('ticket.status = :ticketStatus', { ticketStatus: 'PAID' })
      .andWhere('schedule.status = :scheduleStatus', { scheduleStatus: 'COMPLETED' })
      .andWhere('schedule.arrivalAt < :now', { now })
      .andWhere('review.id IS NULL')
      .orderBy('schedule.departureAt', 'DESC')
      .getMany();
  }

  async findForQrVerification(id: number) {
    return this.ticketRepo.findOne({
      where: { id },
      relations: [
        'user',
        'seat',
        'schedule',
        'schedule.route',
        'schedule.bus',
        'ticketPayments',
        'ticketPayments.payment' // Relation name in TicketPayment entity is 'payment'
      ]
    });
  }

  // NEW METHOD
  async deleteByScheduleId(scheduleId: number) {
    return this.ticketRepo.delete({ scheduleId });
  }

  // Helper to expose query builder or generic query if needed
  async query(query: string, parameters?: any[]) {
    return this.ticketRepo.query(query, parameters);
  }

  async createQueryBuilder(alias: string) {
    return this.ticketRepo.createQueryBuilder(alias);
  }

  async count(options: any) { return this.ticketRepo.count(options); }

  // ADMIN: Retrieve all tickets with full details
  async findAllForAdmin() {
    return this.ticketRepo.find({
      relations: ['user', 'schedule', 'schedule.bus', 'schedule.route', 'seat', 'paymentHistory'],
      order: { createdAt: 'DESC' }
    });
  }
}