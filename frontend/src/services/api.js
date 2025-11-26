import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URI || 'http://localhost:5000', // /api removed from here
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptors same as before
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
