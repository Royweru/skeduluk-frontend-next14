// hooks/api/use-posts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import toast from 'react-hot-toast';

// Types
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

export interface HashtagsRequest {
  content: string;
  count?: number;
}

// Create Post Hook
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('🎉 Post created successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create post';
      toast.error(errorMessage);
      console.error('Create post error:', error);
    },
  });
}

// AI Enhancement Hook
export function useEnhanceContent() {
  return useMutation({
    mutationFn: async (data: EnhancementRequest): Promise<EnhancementResponse> => {
      return postsApi.enhanceContent(data);
    },
    onSuccess: () => {
      // Success toast handled in component for better UX
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to enhance content';
      console.error('Enhancement error:', error);
      throw error; // Re-throw to handle in component
    },
  });
}

// Generate Hashtags Hook
export function useGenerateHashtags() {
  return useMutation({
    mutationFn: async ({ content, count = 5 }: HashtagsRequest): Promise<string[]> => {
      return postsApi.generateHashtags(content, count);
    },
    onSuccess: () => {
      // Success toast handled in component
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to generate hashtags';
      console.error('Hashtag generation error:', error);
      throw error;
    },
  });
}

// AI Providers Info Hook
export function useAIProviders() {
  return useQuery<AIProvidersInfo>({
    queryKey: ['ai-providers'],
    queryFn: postsApi.getAIProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
export function useTestAIProviders() {
  return useQuery({
    queryKey: ['test-ai-providers'],
    queryFn: postsApi.testAIproviders,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Transcribe Audio Hook
export function useTranscribeAudio() {
  return useMutation({
    mutationFn: postsApi.transcribeAudio,
    onSuccess: () => {
      toast.success('🎤 Audio transcribed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to transcribe audio';
      toast.error(errorMessage);
    },
  });
}

// Get Posts Hook
export function usePosts(params?: { skip?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postsApi.getPosts(params),
  });
}

// Get Single Post Hook
export function usePost(id: number) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
  });
}

// Update Post Hook
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      postsApi.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update post');
    },
  });
}

// Publish Post Hook
export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.publishPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('🚀 Post published successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to publish post');
    },
  });
}

// Get Calendar Events Hook
export function useCalendarEvents(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate],
    queryFn: () => postsApi.getCalendarEvents(startDate, endDate),
    enabled: !!(startDate && endDate),
  });
}

// Suggest Post Time Hook (optional advanced feature)
export function useSuggestPostTime(platform: string) {
  return useQuery({
    queryKey: ['suggest-post-time', platform],
    queryFn: () => postsApi.suggestPostTime(platform),
    enabled: !!platform,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Delete Post Hook
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete post');
    },
  });
}

// Get Posts by Status Hook
export function usePostsByStatus(status: 'draft' | 'scheduled' | 'published' | 'failed') {
  return useQuery({
    queryKey: ['posts', 'status', status],
    queryFn: () => postsApi.getPostsByStatus(status),
    enabled: !!status,
  });
}