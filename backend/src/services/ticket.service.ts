import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { CreateTicketDto } from '../dtos/ticket.dto';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateTicketDto) {
    const { userId, scheduleId, seatId } = dto;

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bus: { include: { brand: true } } },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');

    const brand = schedule.bus.brand;

    const userTickets = await this.ticketRepo.findByUserInDay(userId, new Date());
    if (userTickets >= 8) {
      throw new BadRequestException('User đã đạt giới hạn 8 vé/ngày');
    }

    const brandTickets = await this.ticketRepo.countBrandSoldInDay(brand.id);
    if (brandTickets >= brand.dailyTicketLimit) {
      throw new BadRequestException('Brand đã hết số vé cho phép trong hôm nay');
    }

    const existedSeat = await this.ticketRepo.findBySeat(scheduleId, seatId);
    if (existedSeat) {
      throw new BadRequestException('Ghế đã được đặt');
    }

    return this.ticketRepo.create(dto);
  }

  async cancel(id: number) {
    const ticket = await this.ticketRepo.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    const createTime = new Date(ticket.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createTime.getTime()) / (1000 * 3600 * 24);

    if (diffDays > 2) {
      throw new BadRequestException('Vé chỉ được hủy trong vòng 2 ngày sau khi đặt');
    }

    return this.ticketRepo.delete(id);
  }
}
