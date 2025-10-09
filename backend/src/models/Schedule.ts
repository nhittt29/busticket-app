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
  departureAt: Date;        // Thời gian khởi hành
  arrivalAt: Date;         // Thời gian đến
  status: ScheduleStatus;    // Trạng thái chuyến
  createdAt?: Date;     
  updatedAt?: Date;  

  // Quan hệ
  bus?: Bus;
  route?: Route;
  tickets?: Ticket[];
}
