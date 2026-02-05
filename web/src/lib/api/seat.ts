import api from '@/lib/api';
import { SeatMapResponse } from '@/types/seat';

export const seatApi = {
    getSeatsBySchedule: async (scheduleId: number): Promise<SeatMapResponse> => {
        const response = await api.get(`/seats/by-schedule/${scheduleId}`);
        return response.data;
    }
};
