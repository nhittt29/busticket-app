import { Bus } from './Bus';

export interface Brand {
  id: number;
  name: string;
  phoneNumber?: string;
  image?: string;
  address?: string;
  createdAt?: Date;
  buses?: Bus[]; // Một Brand có thể có nhiều Bus
}
