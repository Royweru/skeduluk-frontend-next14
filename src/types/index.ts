
// ==================== USER & AUTHENTICATION ====================

export interface User {
  id: number;
  email: string;
  username: string;
  is_email_verified: boolean;
  is_active: boolean;
  plan: 'trial' | 'basic' | 'pro' | 'enterprise';
  trial_ends_at: string | null;
  posts_used: number;
  posts_limit: number;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface EmailVerificationData {
  token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// ==================== SOCIAL MEDIA ====================

// src/types/social.ts

export type SocialPlatform = 'TWITTER' | 'FACEBOOK' | 'LINKEDIN' | 'INSTAGRAM' | 'TIKTOKT';

export interface SocialConnection {
  id: number;
  platform: SocialPlatform;
  platform_user_id: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OAuthConfig {
  auth_url: string;
  platform: SocialPlatform;
  state: string;
}

export interface OAuthCallbackParams {
  platform: SocialPlatform;
  code: string;
  state: string;
}

export interface PlatformConfig {
  name: string;
  key: SocialPlatform;
  color: string;
  icon: string;
  oauthScopes: string;
}

export interface ConnectionError {
  platform: SocialPlatform;
  error: string;
  details?: string;
}

// ==================== POSTS ====================

export type PostStatus = 'draft' | 'scheduled' | 'processing' | 'posting' | 'posted' | 'failed' | 'partial';
// export interface PostStatus {
//   post_id: number;
//   status: string;
//   error_message?: string;
//   platforms: string[];
//   created_at: string;
//   scheduled_for?: string;
//   results: Array<{
//     platform: string;
//     status: string;
//     platform_post_id?: string;
//     error?: string;
//     posted_at?: string;
//   }>;
// }
export interface Post {
  id: number;
  user_id: number;
  original_content: string;
  enhanced_content: Record<string, string> | null;
  image_urls: string[] | null;
  audio_file_url: string | null;
  platforms: SocialPlatform[];
  status: PostStatus;
  scheduled_for: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostCreateData {
  original_content: string;
  platforms: SocialPlatform[];
  scheduled_for?: string;
  enhanced_content?: Record<string, string>;
  image_urls?: string[];
  audio_file_url?: string;
}

export interface PostUpdateData {
  original_content?: string;
  platforms?: SocialPlatform[];
  scheduled_for?: string;
  enhanced_content?: Record<string, string>;
  image_urls?: string[];
  audio_file_url?: string;
}

export interface PostResult {
  id: number;
  post_id: number;
  platform: SocialPlatform;
  platform_post_id: string | null;
  status: 'posted' | 'failed';
  error_message: string | null;
  posted_at: string | null;
  content_used: string | null;
  created_at: string;
}

// ==================== TEMPLATES ====================

export interface PostTemplate {
  id: number;
  user_id: number;
  name: string;
  content: string;
  platforms: SocialPlatform[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCreateData {
  name: string;
  content: string;
  platforms: SocialPlatform[];
  is_public?: boolean;
}

// ==================== AI & CONTENT ENHANCEMENT ====================

export interface ContentEnhancement {
  platform: string;
  enhanced_content: string;
  original_length: number;
  enhanced_length: number;
}

export interface ContentEnhancementRequest {
  content: string;
  platforms: SocialPlatform[];
  image_count?: number;
  tone?: 'engaging' | 'professional' | 'casual' | 'formal';
}

export interface PlatformLimits {
  maxLength: number;
  maxImages: number;
  supportedMediaTypes: string[];
}


export interface EnhancementRequest {
  content: string;
  platforms: string[];
  image_count?: number;
  tone?: string;
}

export interface PlatformEnhancement {
  platform: string;
  enhanced_content: string;
}

export interface EnhancementResponse {
  enhancements: PlatformEnhancement[];
}

export interface AIProvidersInfo {
  groq: boolean;
  gemini: boolean;
  openai: boolean;
  anthropic: boolean;
  grok: boolean;
  configured_provider: string;
}

export interface HashtagsResponse {
  hashtags: string[];
}

export interface PostTimeResponse {
  platform: string;
  day: string;
  time: string;
}

// ==================== SUBSCRIPTIONSIONS & BILLING ====================

export type SubscriptionPlan = 'trial' | 'basic' | 'pro' | 'enterprise';

export interface Subscription {
  id: number;
  user_id: number;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface PlanPricing {
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  features: string[];
  posts_limit: number;
  interval: 'monthly' | 'yearly';
}

export interface PaymentInitiateRequest {
  plan: SubscriptionPlan;
  payment_method: 'flutterwave' | 'paypal' | 'stripe';
}

export interface PaymentInitiateResponse {
  payment_link: string;
  reference: string;
}

// ==================== ANALYTICS ====================

export interface EngagementMetrics {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface PostAnalytics {
  id: number;
  platform: SocialPlatform;
  content: string;
  posted_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface DashboardStats {
  totalPosts: number;
  connectedAccounts: number;
  scheduledPosts: number;
  successRate: number;
  engagementMetrics: EngagementMetrics[];
}

// ==================== CALENDAR ====================

export interface CalendarEvent {
  id: number;
  title: string;
  content: string;
  start: string;
  end: string;
  platforms: string[];
  status: 'scheduled' | 'posted' | 'failed' | 'processing' | 'draft';
  image_urls: string[];
  is_scheduled: boolean;
  scheduled_for: string | null;
  created_at: string;
  error_message?: string;
  color: string;
  allDay: boolean;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  start_date: string;
  end_date: string;
  total: number;
}

export interface CalendarDay {
  date: Date | null;
  dayNumber: number | null;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
}

export interface MonthSummary {
  [date: string]: {
    total: number;
    by_status: {
      scheduled?: number;
      posted?: number;
      failed?: number;
      processing?: number;
    };
  };
}

export type CalendarView = 'month' | 'list' | 'week';


// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  detail: string;
  error?: string;
  message?: string;
}

// ==================== FORMS ====================

export interface PostFormData {
  textContent: string;
  platforms: string;
  scheduleTime?: string;
  enhancedContent?: string;
  images?: File[];
  audio?: File;
}

export interface MediaUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  post_published: boolean;
  post_failed: boolean;
  account_activity: boolean;
}

// ==================== UI COMPONENTS ====================

export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export interface InputProps {
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

// ==================== NAVIGATION ====================

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string | number;
}

export interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  pathname: string;
  isMobile?: boolean;
}

// ==================== SEARCH & FILTERING ====================

export interface SearchFilters {
  query?: string;
  status?: PostStatus;
  platform?: SocialPlatform;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// ==================== FILE UPLOAD ====================

export interface FileUploadConfig {
  accept: string;
  maxSize: number;
  maxSizeMB: number;
  allowedTypes: string[];
}

export interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

// ==================== WEBHOOKS ====================

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature: string;
}

export interface WebhookEvent {
  type: 'post.published' | 'post.failed' | 'user.created' | 'subscription.updated';
  data: any;
}

// ==================== SETTINGS ====================

export interface UserSettings {
  email: string;
  username: string;
  timezone: string;
  language: string;
  notifications: NotificationSettings;
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
  };
}

export interface AppSettings {
  appName: string;
  version: string;
  apiVersion: string;
  features: {
    aiEnhancement: boolean;
    voiceRecording: boolean;
    analytics: boolean;
  };
}

//Facebook page connections 

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string;
  picture_url?: string;
  is_selected: boolean;
}

export interface FacebookPagesResponse {
  pages: FacebookPage[];
  selected_page_id: string | null;
  total: number;
  message?: string;
  create_page_url?: string;
}

export interface SelectedPageResponse {
  has_selection: boolean;
  page?: {
    id: string;
    name: string;
    category: string;
    picture_url?: string;
  };
  message?: string;
}

// ==================== EXPORTS ====================


