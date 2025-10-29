// src/lib/api.ts
import { AIProvidersInfo, EnhancementRequest, EnhancementResponse, PostTimeResponse } from '@/types';
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
  // ========================================
  // Posts CRUD Operations
  // ========================================
  
  // Get all posts with optional filters
  getPosts: async (params?: { skip?: number; limit?: number; status?: string }) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },
  
  // Get single post by ID
  getPost: async (id: number) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  
  // Create new post with images/videos
  createPost: async (formData: FormData) => {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Update existing post
  updatePost: async (id: number, postData: any) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },
  
  // Publish a post immediately
  publishPost: async (id: number) => {
    const response = await api.post(`/posts/${id}/publish`);
    return response.data;
  },
  
  // Delete a post
  deletePost: async (id: number) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  // ========================================
  // AI-Powered Features
  // ========================================
  
  // Enhance content for multiple platforms with AI
  enhanceContent: async (data: EnhancementRequest): Promise<EnhancementResponse> => {
    const response = await api.post('/posts/enhance', data);
    return response.data;
  },
  
  // Generate relevant hashtags using AI
  generateHashtags: async (content: string, count: number = 5): Promise<string[]> => {
    const response = await api.post('/posts/generate-hashtags', { 
      content, 
      count 
    });
    return response.data.hashtags;
  },
  
  // Get available AI providers status
  getAIProviders: async (): Promise<AIProvidersInfo> => {
    const response = await api.get('/posts/ai-providers');
    return response.data;
  },
  testAIproviders: async () => {
    const res = await api.get('/posts/ai-providers/debug');
    return res.data;
  },
  // Get optimal posting time for a platform
  suggestPostTime: async (platform: string): Promise<PostTimeResponse> => {
    const response = await api.get('/posts/suggest-post-time', {
      params: { platform }
    });
    return response.data;
  },
  
  // ========================================
  // Media & Content Features
  // ========================================
  
  // Transcribe audio to text
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
  
  // ========================================
  // Calendar & Scheduling
  // ========================================
  
  // Get calendar events for date range
  getCalendarEvents: async (startDate: string, endDate: string) => {
    const response = await api.get('/posts/calendar/events', {
      params: { 
        start_date: startDate, 
        end_date: endDate 
      }
    });
    return response.data;
  },
  
  // ========================================
  // Analytics & Performance
  // ========================================
  
  // Get analytics for a specific post
  getPostAnalytics: async (id: number) => {
    const response = await api.get(`/posts/${id}/analytics`);
    return response.data;
  },
  
  // Get overview analytics
  getOverviewAnalytics: async () => {
    const response = await api.get('/posts/analytics/overview');
    return response.data;
  },
  
  // ========================================
  // Filtering & Search
  // ========================================
  
  // Get posts by status
  getPostsByStatus: async (status: 'draft' | 'scheduled' | 'published' | 'failed') => {
    const response = await api.get('/posts', {
      params: { status }
    });
    return response.data;
  },
  
  // Get posts by platform
  getPostsByPlatform: async (platform: string) => {
    const response = await api.get('/posts', {
      params: { platform }
    });
    return response.data;
  },
  
  // Search posts
  searchPosts: async (query: string) => {
    const response = await api.get('/posts/search', {
      params: { q: query }
    });
    return response.data;
  },
  
  // ========================================
  // Batch Operations
  // ========================================
  
  // Delete multiple posts
  batchDelete: async (postIds: number[]) => {
    const response = await api.post('/posts/batch/delete', {
      post_ids: postIds
    });
    return response.data;
  },
  
  // Publish multiple posts
  batchPublish: async (postIds: number[]) => {
    const response = await api.post('/posts/batch/publish', {
      post_ids: postIds
    });
    return response.data;
  },
  
  // Reschedule multiple posts
  batchReschedule: async (postIds: number[], newDate: string) => {
    const response = await api.post('/posts/batch/reschedule', {
      post_ids: postIds,
      scheduled_for: newDate
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