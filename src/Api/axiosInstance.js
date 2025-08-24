// axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true // 👈 Important if you're using Authorization or cookies

});

// 🔐 Attach token on every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ❌ Handle token expiration or unauthorized globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response || error.response.status == 401) {
            // Token expired or unauthorized
            console.warn('Token expired or unauthorized. Redirecting to login...');

            // Remove invalid token
            localStorage.removeItem('token');

            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
