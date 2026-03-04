import api from "../api";

export const aiApi = {
    chat: async (message: string, history: any[]) => {
        try {
            const response = await api.post('/ai/chat', { message, history });
            return response.data.answer;
        } catch (error) {
            console.error("AI Chat Error:", error);
            throw error;
        }
    }
};
