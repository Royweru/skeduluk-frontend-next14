// src/hooks/api/use-posts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import toast from 'react-hot-toast';
export function usePosts(params?: { skip?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postsApi.getPosts(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => postsApi.createPost(formData),
    onSuccess: () => {
      toast.success('Post created successfully');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create post');
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      postsApi.updatePost(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Post updated successfully');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update post');
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsApi.publishPost,
    onSuccess: () => {
      toast.success('Post published successfully');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to publish post');
    },
  });
}

export function useEnhanceContent() {
  return useMutation({
    mutationFn: postsApi.enhanceContent,
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to enhance content');
    },
  });
}

export function useTranscribeAudio() {
  return useMutation({
    mutationFn: (audioFile: File) => postsApi.transcribeAudio(audioFile),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to transcribe audio');
    },
  });
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendarEvents'],
    queryFn: () => postsApi.getCalendarEvents(
      new Date().toISOString(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}