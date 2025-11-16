// src/models/Ticket.ts
import { Schedule } from './Schedule';
import { Seat } from './Seat';
import { User } from './User';

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
  price: number;
  status: TicketStatus;
  paymentMethod?: PaymentMethod;
  createdAt?: Date;
  updatedAt?: Date;

  // THÊM DÒNG NÀY – ĐỒNG BỘ VỚI PRISMA
  bulkTicketId?: number | null; // null = vé đơn, có giá trị = thuộc nhóm vé

  // Quan hệ
  user?: User;
  schedule?: Schedule;
  seat?: Seat;

  // Bảng trung gian
  ticketPayments?: TicketPayment[];
}

export interface TicketPayment {
  id: number;
  ticketId: number;
  paymentId: number;
  createdAt: Date;
}