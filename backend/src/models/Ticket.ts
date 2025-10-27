import { Schedule } from './Schedule';
import { Seat } from './Seat';

export enum TicketStatus {
  BOOKED = 'BOOKED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
}

export interface Ticket {
  id: number;
  userId: number;
  scheduleId: number;
  seatId: number;
  price: number; // Float in prisma = number in TS ✅
  status: TicketStatus;
  paymentMethod?: PaymentMethod;
  createdAt?: Date;
  updatedAt?: Date;
}

