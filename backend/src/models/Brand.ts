import { Bus } from './Bus';

export interface Brand {
  id: number;
  name: string;
  buses?: Bus[]; // 🔹 Một Brand có thể có nhiều Bus
}
