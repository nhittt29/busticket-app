export interface DropoffPoint {
    id: number;
    name: string;
    address: string;
    surcharge: number;
    priceDifference: number; // For discount logic
    isDefault: boolean;
}

export interface CustomerInfo {
    fullName: string;
    phone: string;
    email: string;
}
