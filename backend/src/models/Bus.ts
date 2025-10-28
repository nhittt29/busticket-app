import { Brand } from './Brand';
import { Schedule } from './Schedule';
import { Seat } from './Seat';

export enum BusCategory {
  MINIVAN = 'MINIVAN',
  COACH = 'COACH',
  LIMOUSINE = 'LIMOUSINE',
  SLEEPER = 'SLEEPER',
  VIP = 'VIP',
}

export enum SeatType {
  SEAT = 'SEAT',
  BERTH = 'BERTH',
}

export interface Bus {
  id: number;
  name: string;
  licensePlate: string;
  seatCount: number;
  category: BusCategory;
  seatType: SeatType;
  brandId: number;
  brand?: Brand;
  seats?: Seat[];
  schedules?: Schedule[];
  createdAt?: Date;
  updatedAt?: Date;
}