import { Bus } from './Bus';
import { Ticket } from './Ticket';

export interface Seat {
  id: number;
  seatNumber: number;
  code: string;
  isAvailable: boolean;
  busId: number;
  bus?: Bus;
  tickets?: Ticket[];
  createdAt?: Date;
  updatedAt?: Date;
}
