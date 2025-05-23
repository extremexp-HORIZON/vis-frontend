import axios from 'axios';
import { getToken } from '../../store/slices/authSlice';

export const experimentApi = axios.create({
  baseURL: '/experiments',
  withCredentials: true,
});

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const authApi = axios.create({
  baseURL: '/auth',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 errors globally
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      // Consider using history.push or similar for navigation
    }

    return Promise.reject(error);
  },
);

experimentApi.interceptors.request.use(config => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

experimentApi.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 errors globally
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      // Consider using history.push or similar for navigation
    }

    return Promise.reject(error);
  },
);
