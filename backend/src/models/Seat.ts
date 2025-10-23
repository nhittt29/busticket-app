import { Bus } from './Bus';

export interface Seat {
  id: number;
  seatNumber: number;
  code: string;
  busId: number;
  bus?: Bus;
  createdAt?: Date;
  updatedAt?: Date;
}
