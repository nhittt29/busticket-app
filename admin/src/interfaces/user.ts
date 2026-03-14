export interface IUser {
    id: number;
    uid: string;
    name: string;
    email: string;
    phone?: string;
    dob?: string;
    gender?: string;
    avatar?: string;
    isActive: boolean;
    roleId: number;
    role?: {
        id: number;
        name: string;
    };
    brand?: {
        id: number;
        name: string;
        phoneNumber?: string;
        image?: string;
        address?: string;
    };
    tickets?: any[];
    createdAt: string;
    updatedAt: string;
}

export interface IUserUpdate {
    name?: string;
    phone?: string;
    isActive?: boolean;
    roleId?: number;
}
