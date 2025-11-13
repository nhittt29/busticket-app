// src/models/PaymentHistory.ts
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
}

export interface PaymentHistory {
  id: number;
  ticketId?: number; // Vé đầu tiên (dễ query)
  method: PaymentMethod;
  amount: number;
  transactionId?: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  qrCode?: string;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Quan hệ
  ticket?: {
    id: number;
    userId: number;
    scheduleId: number;
    seatId: number;
    price: number;
    status: string;
    paymentMethod?: PaymentMethod;
  };

  // THÊM: Nhiều vé liên kết qua bảng trung gian
  ticketPayments?: TicketPayment[];
}

export interface TicketPayment {
  id: number;
  ticketId: number;
  paymentId: number;
  createdAt: Date;

  // Quan hệ (tùy chọn)
  ticket?: {
    id: number;
    seat?: { code: string };
  };
}