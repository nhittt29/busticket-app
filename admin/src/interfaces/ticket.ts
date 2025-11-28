import { ISchedule } from "./schedule";

export interface IUser {
    id: number;
    name: string;
    phone?: string;
    email: string;
}
// Actually, I should check if user interface exists. 
// Based on previous context, I haven't seen user.ts. I'll define a minimal one inside ticket.ts or separately if needed.
// Let's check user.ts existence first? No, I'll just define what I need here or use any if it's complex.
// Wait, the backend has User model.
// Let's define a basic IUser here if not found, or import if it exists.
// I'll assume it might not exist and define a minimal structure or use 'any' for the relation for now to avoid blocking.
// Better: I'll check for user.ts in the next step if needed, but for now I'll define the enums and ITicket.

export enum TicketStatus {
    BOOKED = "BOOKED",
    PAID = "PAID",
    CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    MOMO = "MOMO",
    ZALOPAY = "ZALOPAY",
}

export interface ITicket {
    id: number;
    userId: number;
    user?: {
        id: number;
        name: string;
        phone?: string;
        email: string;
    };
    scheduleId: number;
    schedule?: ISchedule;
    seatId: number;
    seat?: {
        id: number;
        seatNumber: number;
        code: string;
    };
    price: number;
    surcharge: number;
    totalPrice: number;
    status: TicketStatus;
    paymentMethod?: PaymentMethod;
    dropoffAddress?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ITicketCreate {
    // Complex, might not be used in admin for now
}

export interface ITicketUpdate {
    status?: TicketStatus;
}
