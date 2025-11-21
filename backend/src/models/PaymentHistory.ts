// src/models/PaymentHistory.ts
import { PaymentMethod } from './Ticket';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentHistory {
  id: number;
  method: PaymentMethod;
  amount: number;
  transactionId?: string | null;
  status: PaymentStatus;
  qrCode?: string | null;
  ticketCode?: string | null;
  seatList?: string | null;
  seatCount: number;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Quan hệ
  tickets?: Ticket[];
  ticketPayments?: TicketPayment[];
}

export interface TicketPayment {
  id: number;
  ticketId: number;
  paymentId: number;
  createdAt: Date;

  payment?: PaymentHistory;
}

import type { Ticket } from './Ticket';
declare module './PaymentHistory' {
  interface PaymentHistory {
    tickets?: Ticket[];
  }
}