import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/interfaces/user.interface';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user: User, token: string) => set({ user, token, isAuthenticated: true }),
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'brand-auth-storage', // unique name for brand portal
        }
    )
);
