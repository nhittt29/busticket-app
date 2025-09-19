export interface Bus {
  id: number;
  name: string;
  licensePlate: string;
  seatCount: number;
  type?: 'small' | 'medium' | 'large';
}
