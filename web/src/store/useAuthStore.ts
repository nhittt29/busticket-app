import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
    id: number;
    uid: string;
    email: string;
    name: string;
    phone?: string;
    roleId?: number;
    avatar?: string;
    dob?: string;
    gender?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { user, idToken } = response.data;
                    set({
                        user,
                        token: idToken,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error: any) {
                    const msg = error.response?.data?.message || 'Đăng nhập thất bại';
                    set({ error: msg, isLoading: false });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/register', data);
                    // Backend returns the created user, but usually we want to auto-login or redirect.
                    // For now, let's just return success and let component handle redirect to login
                    set({ isLoading: false });
                } catch (error: any) {
                    const msg = error.response?.data?.message || 'Đăng ký thất bại';
                    set({ error: msg, isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('auth-storage'); // Optional: explicitly clear
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
