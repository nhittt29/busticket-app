export interface Ticket {
  id: number;
  userId: number;
  scheduleId: number;
  seatNumber: number;
  price: number;
  status: 'booked' | 'paid' | 'cancelled';
  createdAt: Date;
}
