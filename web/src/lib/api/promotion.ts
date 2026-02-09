import api from '@/lib/api';
import { Promotion } from '@/types/promotion';

export const promotionApi = {
    // Get all active promotions
    getActivePromotions: async (): Promise<Promotion[]> => {
        try {
            const response = await api.get('/promotions');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch promotions:", error);
            return [];
        }
    },

    // Apply specific code
    applyPromotion: async (code: string, orderValue: number) => {
        const response = await api.post('/promotions/apply', { code, orderValue });
        return response.data; // { success, discountAmount, finalPrice, promotion }
    }
};
