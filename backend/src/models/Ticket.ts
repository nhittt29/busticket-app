import { Schedule } from './Schedule';

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
  userId: number;               // Người đặt vé
  scheduleId: number;           // Chuyến xe
  seatNumber: number;           // Số ghế
  price: number;                // Giá vé
  status: TicketStatus;         // Trạng thái vé
  paymentMethod?: PaymentMethod; // Phương thức thanh toán (nếu có)
  createdAt?: Date;      // ✅
  updatedAt?: Date;  
  schedule?: Schedule;          // Thông tin chuyến xe
}
