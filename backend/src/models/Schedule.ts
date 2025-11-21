// src/models/Schedule.ts
import { Bus } from './Bus';
import { Route } from './Route';
import { Ticket } from './Ticket';
import { DropoffPoint } from './DropoffPoint';

export enum ScheduleStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FULL = 'FULL',
  FEW_SEATS = 'FEW_SEATS',
}

export interface Schedule {
  id: number;
  busId: number;
  routeId: number;
  departureAt: Date;
  arrivalAt: Date;
  status: ScheduleStatus;
  createdAt: Date;
  updatedAt: Date;

  // Quan hệ
  bus?: Bus;
  route?: Route;
  tickets?: Ticket[];
  dropoffPoints?: DropoffPoint[];
}