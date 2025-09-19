export interface Schedule {
  id: number;
  busId: number;
  routeId: number;
  departureAt: Date;
  arrivalAt: Date;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}
