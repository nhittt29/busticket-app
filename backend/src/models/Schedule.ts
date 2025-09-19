export enum ScheduleStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Schedule {
  id: number;
  busId: number;
  routeId: number;
  departureAt: Date;
  arrivalAt: Date;
  status: ScheduleStatus;
}
