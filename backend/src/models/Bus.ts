import { Brand } from './Brand';
import { Schedule } from './Schedule';
import { Seat } from './Seat';

export enum BusType {
  MINIVAN_16 = 'MINIVAN_16',
  COACH_30 = 'COACH_30',
  COACH_45 = 'COACH_45',
  LIMOUSINE = 'LIMOUSINE',
}

export interface Bus {
  id: number;
  name: string;
  licensePlate: string;
  seatCount: number;
  type: BusType;
  brandId: number;
  brand?: Brand;
  seats?: Seat[];
  schedules?: Schedule[];
  createdAt?: Date;
  updatedAt?: Date;
}
