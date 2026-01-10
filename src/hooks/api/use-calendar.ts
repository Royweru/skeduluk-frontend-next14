// hooks/api/use-calendar.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEventsResponse, CalendarEvent } from '@/types/calendar';
import api from '@/lib/api'; // Your API client

// Fetch calendar events
export const useCalendarEvents = (startDate: string, endDate: string) => {
  return useQuery<CalendarEventsResponse>({
    queryKey: ['calendar-events', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/posts/calendar/events', {
        params: { start_date: startDate, end_date: endDate }
      });
      return data;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 30000, // 30 seconds
  });
};

// Update post schedule (for drag-and-drop)
export const useUpdatePostSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      scheduledFor 
    }: { 
      postId: number; 
      scheduledFor: string;
    }) => {
      const { data } = await api.put(`/posts/${postId}`, {
        scheduled_for: scheduledFor
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Publish post now
export const usePublishPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const { data } = await api.post(`/posts/${postId}/publish`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Duplicate post
export const useDuplicatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const { data } = await api.post(`/posts/${postId}/duplicate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Bulk delete posts
export const useBulkDeletePosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postIds: number[]) => {
      await api.post('/posts/bulk-delete', { post_ids: postIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Bulk reschedule posts
export const useBulkReschedulePosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postIds, 
      scheduledFor 
    }: { 
      postIds: number[]; 
      scheduledFor: string;
    }) => {
      await api.post('/posts/bulk-reschedule', {
        post_ids: postIds,
        scheduled_for: scheduledFor
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};