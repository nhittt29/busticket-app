import api from '@/lib/api';
import { Schedule, SearchParams } from '@/types/schedule';

export const scheduleApi = {
    getSchedules: async (params: SearchParams): Promise<Schedule[]> => {
        try {
            const cleanParams: any = {};
            if (params.startPoint) cleanParams.startPoint = params.startPoint;
            if (params.endPoint) cleanParams.endPoint = params.endPoint;
            if (params.date) cleanParams.date = params.date;

            const response = await api.get('/schedules', { params: cleanParams });
            return response.data;
        } catch (error) {
            console.error("Error fetching schedules:", error);
            throw error;
        }
    },

    getScheduleById: async (id: number): Promise<Schedule> => {
        const response = await api.get(`/schedules/${id}`);
        return response.data;
    }
};
