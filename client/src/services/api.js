import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ML API
export const mlAPI = {
  predict: (formData) => api.post('/ml/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Waste API
export const wasteAPI = {
  getWasteSubmissions: () => api.get('/waste'),
  createWasteSubmission: (formData) => api.post('/waste', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getWasteById: (id) => api.get(`/waste/${id}`),
};

// Contest API
export const contestAPI = {
  getContestEntries: (params = {}) => api.get('/contest', { params }),
  createContestEntry: (formData) => api.post('/contest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  voteForEntry: (entryId, voteType) => api.post(`/contest/${entryId}/vote`, { voteType }),
  getLeaderboard: () => api.get('/contest/leaderboard'),
};

// User API
export const userAPI = {
  getDashboard: () => api.get('/user/dashboard'),
  updateProfile: (userData) => api.put('/user/profile', userData),
  uploadAvatar: (formData) => api.post('/user/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Admin API
export const adminAPI = {
  // User Management
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  createAdminUser: (userData) => api.post('/admin/create-admin', userData),
  
  // Waste Management
  getAllWasteSubmissions: (params = {}) => api.get('/admin/waste', { params }),
  reviewWasteSubmission: (id, data) => api.put(`/admin/waste/${id}/review`, data),
  
  // Contest Management
  getAllContestEntries: (params = {}) => api.get('/admin/contest', { params }),
  updateContestEntry: (id, updates) => api.put(`/admin/contest/${id}`, updates),
  
  // Dashboard & Analytics
  getAdminDashboard: () => api.get('/admin/dashboard'),
  getSystemStats: () => api.get('/admin/stats'),
  
  // Reports
  generateReport: (reportType, params = {}) => api.get(`/admin/reports/${reportType}`, { params })
};

export default api;