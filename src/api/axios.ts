import axios from 'axios';

// Determine API base URL - use production URL if on Render, otherwise localhost
const getApiBaseUrl = () => {
  // If we're on the production domain, use production backend
  if (window.location.hostname.includes('onrender.com')) {
    return 'https://sakhalas-2.onrender.com/api';
  }
  // Otherwise use environment variable or localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not on a public page
    if (error.response?.status === 401) {
      const isPublicRoute = window.location.pathname === '/' || 
                           window.location.pathname === '/login';
      
      if (!isPublicRoute) {
        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle network errors gracefully
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
