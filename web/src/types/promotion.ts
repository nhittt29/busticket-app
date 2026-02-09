export interface Promotion {
    id: number;
    code: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}
