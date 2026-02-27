
import api from "../api";

export const notificationApi = {
    // Get notifications with pagination
    getNotifications: async (userId: number, page: number = 1, limit: number = 20) => {
        try {
            const response = await api.get(`/notifications/${userId}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    },

    // Mark a specific notification as read
    markAsRead: async (id: number, userId: number) => {
        try {
            await api.patch(`/notifications/${id}/read/${userId}`);
            return true;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return false;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async (userId: number) => {
        try {
            await api.patch(`/notifications/read-all/${userId}`);
            return true;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            return false;
        }
    },

    // Get unreviewed count (for red dot)
    getUnreviewedCount: async () => {
        try {
            const response = await api.get('/reviews/unreviewed');
            return Array.isArray(response.data) ? response.data.length : 0;
        } catch (error) {
            return 0;
        }
    }
};
