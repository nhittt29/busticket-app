import axios from 'axios';

// Tự động nhận diện IP của trình duyệt (Localhost hoặc Radmin)
let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
if (typeof window !== 'undefined') {
    // Luôn gọi về cổng 4000 của cùng một server đang chạy Frontend
    baseURL = `http://${window.location.hostname}:4000/api`;
}

// Create Axios instance
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // We will inject the token from the store later or read from localStorage if persisted
        // For now, let's allow manual token injection via headers if needed, 
        // or rely on store's getState() in the component wrapper. 
        // Common pattern is to read from localStorage here.
        if (typeof window !== 'undefined') {
            const storage = sessionStorage.getItem('auth-storage') || localStorage.getItem('auth-storage');
            if (storage) {
                try {
                    const { state } = JSON.parse(storage);
                    if (state && state.token) {
                        config.headers.Authorization = `Bearer ${state.token}`;
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
