// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authApi = {
  login: async (data: { username: string; password: string }) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  register: async (userData: { email: string; username: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  getOAuthUrl: async (platform: string) => {
    const response = await api.get(`/auth/oauth/${platform}/authorize`);
    return response.data;
  },
  
  handleOAuthCallback: async (platform: string, code: string, state: string) => {
    const response = await api.get(`/auth/oauth/${platform}/callback`, {
      params: { code, state }
    });
    return response.data;
  },
};

export const postsApi = {
  getPosts: async (params?: { skip?: number; limit?: number; status?: string }) => {
    const response = await api.get('/posts/', { params });
    return response.data;
  },
  
  getPost: async (id: number) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  
  createPost: async (formData: FormData) => {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updatePost: async (id: number, postData: any) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },
  
  publishPost: async (id: number) => {
    const response = await api.post(`/posts/${id}/publish`);
    return response.data;
  },
  
  enhanceContent: async (data: { content: string; platforms: string[]; image_count?: number; tone?: string }) => {
    const response = await api.post('/posts/enhance', data);
    return response.data;
  },
  
  transcribeAudio: async (audioFile: File) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    const response = await api.post('/posts/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getCalendarEvents: async (startDate: string, endDate: string) => {
    const response = await api.get('/posts/calendar/events', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
};


export const usersApi = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateCurrentUser: async (userData: any) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
};

export const paymentsApi = {
  initiatePayment: async (data: { plan: string; payment_method: string }) => {
    const response = await api.post('/payments/initiate', data);
    return response.data;
  },
  
  verifyFlutterwavePayment: async (transactionId: string) => {
    const response = await api.get(`/payments/verify/flutterwave/${transactionId}`);
    return response.data;
  },
  
  getSubscriptions: async () => {
    const response = await api.get('/payments/subscriptions');
    return response.data;
  },
};