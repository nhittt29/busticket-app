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
  seatCount: number; // 16, 30, 45...
  type: BusType;
}
