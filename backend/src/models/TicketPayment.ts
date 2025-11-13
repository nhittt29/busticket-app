// src/models/PaymentHistory.ts
import { PaymentMethod } from './Ticket';

export interface PaymentHistory {
  id: number;
  ticketId?: number; // Vé đầu tiên
  method: PaymentMethod;
  amount: number;
  transactionId?: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  qrCode?: string;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Không cần quan hệ ngược
  // ticket?: any;

  ticketPayments?: TicketPayment[];
}

export interface TicketPayment {
  id: number;
  ticketId: number;
  paymentId: number;
  createdAt: Date;
}