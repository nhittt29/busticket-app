import api from '@/lib/api';
import axios from 'axios';

export interface Review {
    id: number;
    ticketId: number;
    userId: number;
    busId: number;
    rating: number;
    comment: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
    user?: {
        fullName: string;
        avatar?: string;
    };
}

export interface CreateReviewDto {
    ticketId: number;
    rating: number;
    comment?: string;
    images?: string[];
}

export const reviewApi = {
    // Create a new review
    create: async (data: CreateReviewDto): Promise<Review> => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    // Get reviews by current user
    getMyReviews: async (): Promise<Review[]> => {
        const response = await api.get('/reviews/my-reviews');
        return response.data;
    },

    // Get unreviewed tickets for current user
    getUnreviewedTickets: async (): Promise<any[]> => {
        const response = await api.get('/reviews/unreviewed');
        return response.data;
    },

    // Get reviews by bus ID
    getByBusId: async (busId: number): Promise<Review[]> => {
        const response = await api.get(`/reviews/bus/${busId}`);
        return response.data;
    },

    // Get review stats by bus ID
    getStats: async (busId: number): Promise<{ avgRating: number; totalReviews: number }> => {
        const response = await api.get(`/reviews/stats/${busId}`);
        return response.data;
    },

    // Upload review image
    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        // Use the configured 'api' instance so the Authorization interceptor attaches the token
        const response = await api.post<{ url: string }>('/upload/review', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data.url;
    }
};
