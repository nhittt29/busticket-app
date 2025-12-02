export interface IPromotion {
    id: number;
    code: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
