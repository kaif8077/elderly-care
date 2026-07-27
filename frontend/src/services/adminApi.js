import axios from 'axios';

const adminApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000'}/api/admin`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

export default adminApi;
