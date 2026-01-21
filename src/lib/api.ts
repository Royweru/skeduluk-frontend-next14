// src/lib/api.ts
import {
  AnalyticsOverTime,
  AnalyticsSummary,
  DashboardAnalytics,
  FetchAnalyticsResponse,
  PlatformComparison,
  TopPerformingPost,
} from "@/app/types";
import {
  AIProvidersInfo,
  CalendarEventsResponse,
  EnhancementRequest,
  EnhancementResponse,
  FacebookPagesResponse,
  PostAnalytics,
  PostTimeResponse,
  SelectedPageResponse,
  Template,
  TemplateAnalytics,
  TemplateFolder,
  TemplateSearchParams,
} from "@/types";
import axios from "axios";
import {
  ApiResponse,
  OAuthConfig,
  PlatformConfig,
  SocialConnection,
} from "@/types";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("access_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export default api;

// API functions
export const authApi = {
  login: async (data: { username: string; password: string }) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await api.post("/auth/token", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  googleLogin: async (token: string) => {
    const response = await api.post("/auth/google", { token });
    return response.data;
  },

  register: async (userData: {
    email: string;
    username: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
  testEmail: async (email?: string) => {
    const response = await api.post("/auth/test-email", { email });
    return response.data;
  },
  getOAuthUrl: async (platform: string) => {
    const response = await api.get(`/auth/oauth/${platform}/authorize`);
    return response.data;
  },

  handleOAuthCallback: async (
    platform: string,
    code: string,
    state: string,
  ) => {
    const response = await api.get(`/auth/oauth/${platform}/callback`, {
      params: { code, state },
    });
    return response.data;
  },
};

export const postsApi = {
  getPosts: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get("/posts", { params });
    return response.data;
  },

  // Get single post by ID
  getPost: async (id: number) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Create new post with images/videos
  createPost: async (formData: FormData) => {
    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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
  enhanceContent: async (
    data: EnhancementRequest,
  ): Promise<EnhancementResponse> => {
    const response = await api.post("/posts/enhance", data);
    return response.data;
  },

  // Generate relevant hashtags using AI
  generateHashtags: async (
    content: string,
    count: number = 5,
  ): Promise<string[]> => {
    const response = await api.post("/posts/generate-hashtags", {
      content,
      count,
    });
    return response.data.hashtags;
  },

  // Get available AI providers status
  getAIProviders: async (): Promise<AIProvidersInfo> => {
    const response = await api.get("/posts/ai-providers/info");
    return response.data;
  },
  testAIproviders: async () => {
    const res = await api.get("/posts/ai-providers/debug");
    return res.data;
  },
  // Get optimal posting time for a platform
  suggestPostTime: async (platform: string): Promise<PostTimeResponse> => {
    const response = await api.get("/posts/suggest-post-time", {
      params: { platform },
    });
    return response.data;
  },

  // ========================================
  // Media & Content Features
  // ========================================

  // Transcribe audio to text
  transcribeAudio: async (audioFile: File) => {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await api.post("/posts/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // ========================================
  // Calendar & Scheduling
  // ========================================

  // Get calendar events for date range

  getCalendarEvents: async (
    startDate: string,
    endDate: string,
  ): Promise<CalendarEventsResponse> => {
    const response = await api.get("/posts/calendar/events", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },

  // Get monthly summary
  getCalendarSummary: async (month: string) => {
    const response = await api.get("/posts/calendar/summary", {
      params: { month },
    });
    return response.data;
  },

  // Publish post immediately
  publishPostNow: async (postId: number) => {
    const response = await api.post(`/posts/${postId}/publish`);
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
    const response = await api.get("/posts/analytics/overview");
    return response.data;
  },

  // ========================================
  // Filtering & Search
  // ========================================

  // Get posts by status
  getPostsByStatus: async (
    status: "draft" | "scheduled" | "published" | "failed",
  ) => {
    const response = await api.get("/posts", {
      params: { status },
    });
    return response.data;
  },

  // Get posts by platform
  getPostsByPlatform: async (platform: string) => {
    const response = await api.get("/posts", {
      params: { platform },
    });
    return response.data;
  },

  // Search posts
  searchPosts: async (query: string) => {
    const response = await api.get("/posts/search", {
      params: { q: query },
    });
    return response.data;
  },

  // ========================================
  // Batch Operations
  // ========================================

  // Delete multiple posts
  batchDelete: async (postIds: number[]) => {
    const response = await api.post("/posts/batch/delete", {
      post_ids: postIds,
    });
    return response.data;
  },

  // Publish multiple posts
  batchPublish: async (postIds: number[]) => {
    const response = await api.post("/posts/batch/publish", {
      post_ids: postIds,
    });
    return response.data;
  },

  // Reschedule multiple posts
  batchReschedule: async (postIds: number[], newDate: string) => {
    const response = await api.post("/posts/batch/reschedule", {
      post_ids: postIds,
      scheduled_for: newDate,
    });
    return response.data;
  },
};

export const usersApi = {
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateCurrentUser: async (userData: any) => {
    const response = await api.put("/users/me", userData);
    return response.data;
  },
};

//Facebook API

export const facebookApi = {
  // Get list of pages user can manage
  async getPages(): Promise<FacebookPagesResponse> {
    const response = await api.get("/social/facebook/pages");
    return response.data;
  },

  // Select a page for posting
  async selectPage(pageId: string) {
    const response = await api.post(
      `/social/facebook/pages/select?page_id=${pageId}`,
    );
    return response.data;
  },

  // Get currently selected page
  async getSelectedPage(): Promise<SelectedPageResponse> {
    const response = await api.get("/social/facebook/selected-page");
    return response.data;
  },
};

// ============================================================================
// TEMPLATE API FUNCTIONS
// ============================================================================

export const templatesApi = {
  search: async (params: TemplateSearchParams) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/templates/search?${queryParams.toString()}`,
    );
    return response.data;
  },

  getById: async (id: number): Promise<Template> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  create: async (data: Partial<Template>) => {
    const response = await api.post(`/templates/`, data);
    return response.data;
  },

  update: async ({ id, data }: { id: number; data: Partial<Template> }) => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/templates/${id}`);
  },

  toggleFavorite: async (id: number) => {
    const response = await api.post(`/templates/${id}/favorite`);
    return response.data;
  },

  useTemplate: async (id: number, data: any) => {
    const response = await api.post(`/templates/use/${id}`, data);
    return response.data;
  },

  getAnalytics: async (id: number): Promise<TemplateAnalytics> => {
    const response = await api.get(`/templates/${id}/analytics`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get(`/templates/categories/list`);
    return response.data;
  },

  // Folders
  createFolder: async (data: Partial<TemplateFolder>) => {
    const response = await api.post(`/templates/folders`, data);
    return response.data;
  },

  getFolders: async (): Promise<TemplateFolder[]> => {
    const response = await api.get(`/templates/folders`);
    return response.data;
  },

  deleteFolder: async (id: number) => {
    await api.delete(`/templates/folders/${id}`);
  },
};

export const analyticsApi = {
  // Fetch analytics for a specific post
  fetchPostAnalytics: async (
    postId: number,
  ): Promise<FetchAnalyticsResponse> => {
    const response = await api.post(`/analytics/fetch/${postId}`);
    return response.data;
  },

  // Get stored analytics for a post
  getPostAnalytics: async (
    postId: number,
    platform?: string,
  ): Promise<PostAnalytics[]> => {
    const response = await api.get(`/analytics/post/${postId}`, {
      params: platform ? { platform } : {},
    });
    return response.data;
  },

  // Get dashboard analytics
  getDashboardAnalytics: async (
    days: number = 30,
    platform?: string,
  ): Promise<DashboardAnalytics> => {
    const response = await api.get("/analytics/dashboard", {
      params: { days, platform },
    });
    return response.data;
  },

  // Get analytics summary
  getSummary: async (
    days: number = 30,
    platform?: string,
  ): Promise<AnalyticsSummary> => {
    const response = await api.get("/analytics/summary", {
      params: { days, platform },
    });
    return response.data;
  },

  // Get top performing posts
  getTopPosts: async (
    limit: number = 10,
    metric: "engagement_rate" | "views" | "likes" = "engagement_rate",
  ): Promise<TopPerformingPost[]> => {
    const response = await api.get("/analytics/top-posts", {
      params: { limit, metric },
    });
    return response.data;
  },

  // Get analytics trends
  getTrends: async (
    days: number = 30,
    platform?: string,
  ): Promise<AnalyticsOverTime[]> => {
    const response = await api.get("/analytics/trends", {
      params: { days, platform },
    });
    return response.data;
  },

  // Get platform comparison
  getPlatformComparison: async (
    days: number = 30,
  ): Promise<PlatformComparison> => {
    const response = await api.get("/analytics/comparison", {
      params: { days },
    });
    return response.data;
  },

  // Get AI-powered engagement suggestions
  getAISuggestions: async (
    days: number = 30,
  ): Promise<AISuggestionsResponse> => {
    const response = await api.post("/analytics/suggestions", { days });
    return response.data;
  },
};

// AI Suggestions types
export interface AISuggestion {
  category: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  action_items: string[];
}

export interface AISuggestionsResponse {
  suggestions: AISuggestion[];
  analyzed_posts: number;
  best_performing_platform: string | null;
  generated_at: string;
}

//Payments api
export const paymentsApi = {
  initiatePayment: async (data: { plan: string; payment_method?: string }) => {
    const response = await api.post("/payments/initiate", data);
    return response.data;
  },

  // Existing Flutterwave (keep this)
  verifyFlutterwavePayment: async (transactionId: string) => {
    const response = await api.get(
      `/payments/verify/flutterwave/${transactionId}`,
    );
    return response.data;
  },

  // ✅ NEW: Add this for Paystack
  verifyPaystackPayment: async (reference: string) => {
    const response = await api.get(`/payments/verify/paystack/${reference}`);
    return response.data;
  },

  getSubscriptions: async () => {
    const response = await api.get("/payments/subscriptions");
    return response.data;
  },
};

export class SocialAPI {
  // Get user's social connections
  static async getConnections(): Promise<SocialConnection[]> {
    const response = await fetch(`${API_BASE_URL}/social/connections`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      console.log("Failed to fetch connections");
      throw new Error("Failed to fetch connections");
    }

    const data = await response.json();
    // Backend returns { connections: [...] }, extract the array
    return data.connections || [];
  }

  // Initiate OAuth flow
  static async initiateOAuth(platform: string): Promise<OAuthConfig> {
    const response = await api.get(`/social/oauth/${platform}/authorize`);
    return response.data;
  }

  // Disconnect social account
  static async disconnectAccount(connectionId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/social/connections/${connectionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to disconnect account");
    }
  }

  // Get supported platforms
  static async getSupportedPlatforms(): Promise<PlatformConfig[]> {
    const response = await fetch(`${API_BASE_URL}/social/platforms`);

    if (!response.ok) {
      throw new Error("Failed to fetch platforms");
    }

    return response.json();
  }
}
