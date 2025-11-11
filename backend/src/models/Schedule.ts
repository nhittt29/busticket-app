import { Bus } from './Bus';
import { Route } from './Route';
import { Ticket } from './Ticket';

export enum ScheduleStatus {
  UPCOMING = 'UPCOMING',       // Sắp khởi hành
  ONGOING = 'ONGOING',         // Đang di chuyển
  COMPLETED = 'COMPLETED',     // Đã đến nơi (tương đương ARRIVED)
  CANCELLED = 'CANCELLED',     // Bị hủy
  FULL = 'FULL',              
  FEW_SEATS = 'FEW_SEATS'      
}

export interface Schedule {
  id: number;
  busId: number;
  routeId: number;
  departureAt: Date;
  arrivalAt: Date;
  status: ScheduleStatus;
  createdAt?: Date;
  updatedAt?: Date;

  // Quan hệ
  bus?: Bus;
  route?: Route;
  tickets?: Ticket[];
}