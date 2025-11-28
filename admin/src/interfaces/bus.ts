export enum BusCategory {
    MINIVAN = 'MINIVAN',
    COACH = 'COACH',
    LIMOUSINE = 'LIMOUSINE',
    SLEEPER = 'SLEEPER',
    VIP = 'VIP',
}

export enum SeatType {
    SEAT = 'SEAT',
    BERTH = 'BERTH',
}

export enum BerthType {
    SINGLE = 'SINGLE',
    DOUBLE = 'DOUBLE',
}

export interface IBus {
    id: number;
    name: string;
    licensePlate: string;
    seatCount: number;
    category: BusCategory;
    seatType: SeatType;
    berthType?: BerthType;
    brandId: number;
    price: number;
    createdAt?: string;
    updatedAt?: string;
}
