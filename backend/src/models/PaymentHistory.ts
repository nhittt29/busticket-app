// src/models/PaymentHistory.ts
export interface PaymentHistory {
  id: number;
  ticketId: number;
  method: 'CASH' | 'CREDIT_CARD' | 'MOMO' | 'ZALOPAY';
  amount: number;
  transactionId?: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  qrCode?: string;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}