export interface IBus {
    id: number;
    name: string;
    licensePlate: string;
    seatCount: number;
    category: "MINIVAN" | "COACH" | "LIMOUSINE" | "SLEEPER" | "VIP";
    seatType: "SEAT" | "BERTH";
    berthType?: "SINGLE" | "DOUBLE";
    brandId: number;
    brand?: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface IBusCreate {
    name: string;
    licensePlate: string;
    seatCount: number;
    category: string;
    seatType: string;
    berthType?: string;
    brandId: number;
    price: number; // Required for backend to initialize seats
}

export interface IBusUpdate {
    name?: string;
    licensePlate?: string;
    seatCount?: number;
    category?: string;
    seatType?: string;
    berthType?: string;
    brandId?: number;
    // No price field for update
}
