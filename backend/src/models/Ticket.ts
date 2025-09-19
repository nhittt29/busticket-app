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
  seatNumber: number;
  price: number;
  status: TicketStatus;
  createdAt: Date;
  paymentMethod?: PaymentMethod;
}