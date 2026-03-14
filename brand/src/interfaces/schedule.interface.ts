export interface Schedule {
    id: number;
    routeId: number;
    busId: number;
    departureAt: string;
    arrivalAt: string;
    status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    price: number;
    isActive: boolean;
    route?: {
        name: string;
        origin: string;
        destination: string;
    };
    bus?: {
        plateNumber: string;
        busType: string;
        totalSeats: number;
    };
}
