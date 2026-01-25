export enum TicketStatus {
  BOOKED = 'BOOKED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum ScheduleStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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
  paymentMethod: PaymentMethod;
  dropoffPointId?: number | null;
  dropoffAddress?: string | null;
  paymentHistoryId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations (Partial)
  user?: any;
  schedule?: any;
  seat?: any;
  paymentHistory?: any;
}