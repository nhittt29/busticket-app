import { Bus } from './Bus';
import { Route } from './Route';
import { Ticket } from './Ticket';

export enum ScheduleStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Schedule {
  id: number;
  busId: number;             // Khóa ngoại Bus
  routeId: number;           // Khóa ngoại Route
  departureAt: string;       // Thời gian khởi hành
  arrivalAt: string;         // Thời gian đến
  status: ScheduleStatus;    // Trạng thái chuyến
  createdAt?: string;
  updatedAt?: string;

  // Quan hệ
  bus?: Bus;
  route?: Route;
  tickets?: Ticket[];
}
