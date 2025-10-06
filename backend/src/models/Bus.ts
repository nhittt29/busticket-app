import { Brand } from './Brand';

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
  brandId: number;   // Khóa ngoại trỏ đến Brand
  brand?: Brand;     // Quan hệ (optional)
  createdAt?: Date;
}