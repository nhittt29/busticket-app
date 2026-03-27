import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';
import { signInWithCustomToken, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface User {
    id: number;
    uid: string;
    email: string;
    name: string;
    phone?: string;
    roleId?: number;
    avatar?: string;
    dob?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    faceUrl?: string; // e.g., 'uploads/faces/123.jpg'
    address?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    setToken: (token: string) => void;
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

            // login: async (email, password) => { // Old signature
            login: async (email, password, remember = false) => {
                // Set flag BEFORE setting state so setItem knows where to save
                if (typeof window !== 'undefined') {
                    if (remember) {
                        localStorage.setItem('REMEMBER_ME', 'true');
                    } else {
                        localStorage.removeItem('REMEMBER_ME');
                    }
                }

                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { user, idToken, customToken } = response.data;
                    set({
                        user,
                        token: idToken,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    // Sync with Firebase Client SDK
                    if (customToken) {
                        try {
                            // Set persistence based on remember me flag
                            await setPersistence(
                                auth,
                                remember ? browserLocalPersistence : browserSessionPersistence
                            );
                            await signInWithCustomToken(auth, customToken);
                            console.log("[Firebase] Sign-in successful");
                            // toast.success("Firebase Connected"); // Too noisy
                        } catch (firebaseError: any) {
                            console.error("Firebase Client Sign-in failed", firebaseError);
                            toast.error(`Lỗi kết nối Firebase (Auth): ${firebaseError.message}`);
                        }
                    }

                    // SSO Redirect for Admin
                    if (user.role?.name === 'ADMIN' && customToken) {
                        // Use window.location for full page redirect to another port
                        const adminUrl = `http://${window.location.hostname}:3001/login?sso_token=${customToken}`;
                        window.location.href = adminUrl;
                    }
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
                try {
                    auth.signOut(); // Ensure firebase client is also cleared
                } catch (e) {
                    console.error("Firebase SignOut error", e);
                }
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                    sessionStorage.removeItem('auth-storage');
                    localStorage.removeItem('REMEMBER_ME');
                }
            },

            updateUser: (data) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null
                }));
            },

            setToken: (token) => {
                set({ token });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => ({
                getItem: (name) => {
                    if (typeof window === 'undefined') return null;
                    return sessionStorage.getItem(name) || localStorage.getItem(name);
                },
                setItem: (name, value) => {
                    if (typeof window === 'undefined') return;
                    if (localStorage.getItem('REMEMBER_ME') === 'true') {
                        localStorage.setItem(name, value);
                        sessionStorage.removeItem(name);
                    } else {
                        sessionStorage.setItem(name, value);
                        localStorage.removeItem(name);
                    }
                },
                removeItem: (name) => {
                    if (typeof window === 'undefined') return;
                    localStorage.removeItem(name);
                    sessionStorage.removeItem(name);
                },
            })),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
