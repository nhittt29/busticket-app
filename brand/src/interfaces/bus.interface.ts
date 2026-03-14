export interface Bus {
    id: number;
    plateNumber: string;
    busType: 'LIMOUSINE' | 'SLEEPER' | 'SEAT';
    totalSeats: number;
    brandId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBusDto {
    plateNumber: string;
    busType: 'LIMOUSINE' | 'SLEEPER' | 'SEAT';
    totalSeats: number;
    brandId: number;
}
