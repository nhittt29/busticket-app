import axios from 'axios';

// Tự động nhận diện IP của trình duyệt (Localhost hoặc Radmin)
let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
if (typeof window !== 'undefined') {
    // Luôn gọi về cổng 4000 của cùng một server đang chạy Frontend
    baseURL = `http://${window.location.hostname}:4000/api`;
}

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // We will get token from localStorage on the client side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

export default api;
