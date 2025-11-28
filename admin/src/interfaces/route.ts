import { IBrand } from "@/interfaces/brand";

export interface IRoute {
    id: number;
    startPoint: string;
    endPoint: string;
    averageDurationMin: number;
    lowestPrice: number;
    distanceKm?: number;
    brandId?: number;
    brand?: IBrand;
    createdAt: string;
    updatedAt: string;
}

export interface IRouteCreate {
    startPoint: string;
    endPoint: string;
    averageDurationMin: number;
    lowestPrice: number;
    distanceKm?: number;
    brandId?: number;
}

export interface IRouteUpdate extends Partial<IRouteCreate> { }
