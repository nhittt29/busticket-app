// src/dtos/get-seats-by-schedule.dto.ts
export class SeatDto {
    id: number;
    seatNumber: string;     // ĐÃ ĐỔI THÀNH STRING → HỖ TRỢ A1, B12, VIP1, 01A... MÃI MÃI
    code: string;
    isAvailable: boolean;
    price: number;
    floor?: number;
    roomType?: 'SINGLE' | 'DOUBLE';
}

export class GetSeatsByScheduleResponse {
    busId: number;
    busName: string;
    seatType: 'SEAT' | 'BERTH';
    totalSeats: number;
    seats: SeatDto[];
}