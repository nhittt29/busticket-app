import api from '@/lib/api';
import { SeatMapResponse } from '@/types/seat';

export const seatApi = {
    getSeatsBySchedule: async (scheduleId: number): Promise<SeatMapResponse> => {
        const response = await api.get(`/seats/by-schedule/${scheduleId}`);
        return response.data;
    },

    lockSeat: async (scheduleId: number, seatId: number, deviceId: string) => {
        const response = await api.post('/seats/lock', { scheduleId, seatId, deviceId });
        return response.data;
    },

    unlockSeat: async (scheduleId: number, seatId: number, deviceId: string) => {
        const response = await api.post('/seats/unlock', { scheduleId, seatId, deviceId });
        return response.data;
    },

    getLockedSeats: async (scheduleId: number | string) => {
        const response = await api.get(`/seats/locks/${scheduleId}`);
        return response.data;
    }
};
