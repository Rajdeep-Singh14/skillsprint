import axios from 'axios';

// Vite environment variable with safe fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending and receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage if present as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillsprint_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize error messages for friendly UI display
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // Backend sent an error response
      message = error.response.data?.message || `Error: ${error.response.statusText}`;
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('skillsprint_token');
        localStorage.removeItem('skillsprint_user');
      }
    } else if (error.request) {
      // Backend is unreachable
      message = 'Cannot reach server. Please ensure the backend is running.';
    } else {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
