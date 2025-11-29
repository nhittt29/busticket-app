import { ITicket, TicketStatus } from "./ticket";
import { IUser } from "./user";
import { ISchedule } from "./schedule";

export interface IBooking {
    id: number;
    ticketCode: string;
    user: IUser;
    schedule: ISchedule;
    seatCount: number;
    seatList: string;
    totalPrice: number;
    status: TicketStatus;
    createdAt: string;
    paymentMethod: string;
    tickets: ITicket[];
}
