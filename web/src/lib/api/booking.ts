import api from '@/lib/api';
import { DropoffPoint } from '@/types/booking';

export const bookingApi = {
    getDropoffPoints: async (scheduleId: number): Promise<DropoffPoint[]> => {
        try {
            const response = await api.get(`/schedules/${scheduleId}/dropoff`);
            return response.data;
        } catch (error) {
            console.error("Error fetching dropoff points:", error);
            return []; // Return empty array on error to avoid crashing UI
        }
    },

    // Create Bulk Tickets (Booking)
    createBooking: async (payload: {
        tickets: Array<{
            userId: number;
            scheduleId: number;
            seatId: number;
            price: number;
            paymentMethod: string;
            dropoffPointId?: number;
            dropoffAddress?: string;
        }>;
        totalAmount: number;
        promotionId?: number;
        discountAmount?: number;
    }) => {
        const response = await api.post('/tickets/bulk', payload);
        return response.data;
    },

    // Get Payment History Detail
    getPaymentDetail: async (paymentHistoryId: number) => {
        const response = await api.get(`/tickets/payments/history/${paymentHistoryId}`);
        return response.data;
    },

    // Check ZaloPay Status (Polling)
    checkZaloPayStatus: async (paymentHistoryId: number) => {
        const response = await api.post(`/tickets/${paymentHistoryId}/check-zalopay`);
        return response.data;
    },

    // Get Tickets by User
    getUserTickets: async (userId: number) => {
        const response = await api.get(`/tickets/user/${userId}`);
        return response.data;
    },

    // Get Single Ticket Detail
    getTicketById: async (ticketId: number) => {
        const response = await api.get(`/tickets/${ticketId}`);
        return response.data;
    }
};
