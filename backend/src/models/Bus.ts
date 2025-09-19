export enum BusType {
  MINIVAN_16 = 'minivan_16',
  COACH_30 = 'coach_30',
  COACH_45 = 'coach_45',
  LIMOUSINE = 'limousine',
}

export interface Bus {
  id: number;
  name: string;
  licensePlate: string;
  seatCount: number; // ví dụ: 16, 30, 45
  type: BusType;
}
