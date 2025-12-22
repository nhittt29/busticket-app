import { User } from "./User";

export class Notification {
    id: number;
    userId: number;
    user?: User;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<Notification>) {
        Object.assign(this, partial);
    }
}
