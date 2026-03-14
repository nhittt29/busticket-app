export interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    roleId?: number;
    role?: {
        id: number;
        name: string;
    };
    brandId?: number;
    brand?: any;
    isActive: boolean;
}

export interface LoginResponse {
    idToken: string;
    customToken: string;
    uid: string;
    user: User;
}
