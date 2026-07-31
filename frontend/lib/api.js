import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vinylite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Centralized handling: on 401, clear the session so the UI can redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('vinylite_token');
      localStorage.removeItem('vinylite_user');
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    'Something went wrong. Please try again.'
  );
}

// ---- Auth ----
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
};

// ---- Search ----
export const searchApi = {
  search: (query, type = 'album', limit = 25) =>
    api.get('/search', { params: { query, type, limit } }),
};

// ---- Library ----
export const libraryApi = {
  list: () => api.get('/library'),
  save: (payload) => api.post('/library', payload),
  update: (id, payload) => api.put(`/library/${id}`, payload),
  remove: (id) => api.delete(`/library/${id}`),
};

// ---- Analytics ----
export const analyticsApi = {
  get: () => api.get('/analytics'),
};

// ---- AI Insights ----
export const insightsApi = {
  get: () => api.get('/insights'),
};
