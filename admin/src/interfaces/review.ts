import { IBus } from "./bus";
import { IUser } from "./user";

export interface IReview {
    id: number;
    rating: number;
    comment?: string;
    userId: number;
    busId: number;
    ticketId: number;
    createdAt: string;
    user?: IUser;
    bus?: IBus;
}
