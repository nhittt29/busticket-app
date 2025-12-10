import { IBus } from "@/interfaces/bus";
import { IRoute } from "./route";

export enum ScheduleStatus {
    UPCOMING = "UPCOMING",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    FULL = "FULL",
    FEW_SEATS = "FEW_SEATS",
}

export interface ISchedule {
    id: number;
    busId: number;
    bus?: IBus;
    routeId: number;
    route?: IRoute;
    departureAt: string;
    arrivalAt: string;
    status: ScheduleStatus;
    availableSeats?: number;
    createdAt: string;
    updatedAt: string;
}

export interface IScheduleCreate {
    busId: number;
    routeId: number;
    departureAt: string;
    arrivalAt: string;
    status: ScheduleStatus;
}

export interface IScheduleUpdate extends Partial<IScheduleCreate> { }
