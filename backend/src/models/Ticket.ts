// src/models/Ticket.ts
import { Schedule } from './Schedule';
import { Seat } from './Seat';
import { User } from './User';
import { DropoffPoint } from './DropoffPoint';
import { PaymentHistory } from './PaymentHistory';

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
  surcharge: number;
  totalPrice: number;
  status: TicketStatus;
  paymentMethod?: PaymentMethod | null;
  dropoffPointId?: number | null;

  // TRƯỜNG MỚI – ĐỒNG BỘ VỚI PRISMA SCHEMA
  dropoffAddress?: string | null;

  paymentHistoryId?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Quan hệ
  user?: User;
  schedule?: Schedule;
  seat?: Seat;
  dropoffPoint?: DropoffPoint | null;

  // Thanh toán nhóm – CHỈ KHAI BÁO 1 LẦN DUY NHẤT
  paymentHistory?: PaymentHistory | null;

  // Bảng trung gian
  ticketPayments?: TicketPayment[];
}

export interface TicketPayment {
  id: number;
  ticketId: number;
  paymentId: number;
  createdAt: Date;

  ticket?: Ticket;
  payment?: PaymentHistory;
}