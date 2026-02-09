export interface Brand {
    id: number;
    name: string;
    description: string;
}

export interface Bus {
    id: number;
    licensePlate: string;
    seatCapacity: number;
    type: string; // "SLEEPER", "SEATER", "LIMOUSINE"
    brand?: Brand;
    images?: string[];
}

export interface Route {
    id: number;
    startPoint: string;
    endPoint: string;
    distance: number;
    duration: number; // in hours
    lowestPrice: number;
}

export interface Schedule {
    id: number;
    departureAt: string; // ISO Date string
    arrivalAt: string; // ISO Date string
    price: number;
    availableSeats: number;
    bus: Bus;
    route: Route;
}

export interface SearchParams {
    startPoint?: string;
    endPoint?: string;
    date?: string; // YYYY-MM-DD
}
