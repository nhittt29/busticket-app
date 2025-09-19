export interface Route {
  id: number;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  durationMin: number;
  intermediatePoints?: string;
  estimatedPrice?: number;
}
