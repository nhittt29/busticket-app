export interface Seat {
    id: number;
    seatNumber: string;
    code: string;
    isAvailable: boolean;
    price: number;
    floor?: number;
    roomType?: string;
    status?: string; // Optional, might be used for 'BLOCKED' if backend supports it later
}

export interface SeatMapResponse {
    scheduleId: number;
    busId: number;
    busName: string;
    seatType: string;
    totalSeats: number;
    seats: Seat[];
}
