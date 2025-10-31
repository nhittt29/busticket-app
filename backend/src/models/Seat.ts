import { Bus } from './Bus';
import { Ticket } from './Ticket';

export interface Seat {
  id: number;
  seatNumber: number;
  code: string;
  isAvailable: boolean;
  price: number;
  floor?: number;
  roomType?: 'SINGLE' | 'DOUBLE';
  busId: number;
  bus?: Bus;
  tickets?: Ticket[];
  createdAt?: Date;
  updatedAt?: Date;
}