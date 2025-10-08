export interface Route {
  id: number;
  startPoint: string;
  endPoint: string;
  averageDurationMin: number;
  lowestPrice: number;
  distanceKm?: number;
  image?: string;
  brandId?: number;
}
