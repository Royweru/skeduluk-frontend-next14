// hooks/api/use-post-status.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface PostResult {
  platform: string;
  status: string;
  platform_post_id: string | null;
  error: string | null;
  posted_at: string | null;
}

interface PostStatus {
  post_id: number;
  status: string;
  error_message: string | null;
  platforms: string[];
  results: PostResult[];
}

export function usePostStatusPolling(postId: number | null, enabled: boolean = false) {
  const [hasNotified, setHasNotified] = useState(false);
  const [initialStatus, setInitialStatus] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PostStatus>({
    queryKey: ['post-status', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/status`);
      return response.data;
    },
    enabled: enabled && !!postId,
    refetchInterval: (data:any) => {
      // Stop polling if post is in final state
      if (!data) return 3000; // Poll every 3 seconds initially
      
      const finalStates = ['posted', 'failed', 'partial'];
      if (finalStates.includes(data.status)) {
        return false; // Stop polling
      }
      
      return 3000; // Continue polling every 3 seconds
    },
    refetchIntervalInBackground: true,
  });

  // Track initial status
  useEffect(() => {
    if (data && !initialStatus) {
      setInitialStatus(data.status);
    }
  }, [data, initialStatus]);

  // Show notifications when status changes
  useEffect(() => {
    if (!data || hasNotified || !initialStatus) return;

    // Only notify if status has changed from initial
    if (data.status === initialStatus || data.status === 'posting') return;

    const finalStates = ['posted', 'failed', 'partial'];
    if (finalStates.includes(data.status)) {
      setHasNotified(true);

      if (data.status === 'posted') {
        const platformNames = data?.platforms?.map(p => 
          p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
        ).join(', ');
        
        toast.success(
          `🎉 Post published successfully to ${platformNames}!`,
          {
            duration: 5000,
            icon: '✅',
          }
        );
      } else if (data.status === 'partial') {
        const successPlatforms = data.results
          .filter(r => r.status === 'posted')
          .map(r => r.platform);
        const failedPlatforms = data.results
          .filter(r => r.status === 'failed')
          .map(r => r.platform);

        toast.success(
          `Published to ${successPlatforms.join(', ')}`,
          {
            duration: 4000,
          }
        );
        
        toast.error(
          `Failed to publish to ${failedPlatforms.join(', ')}`,
          {
            duration: 4000,
          }
        );
      } else if (data.status === 'failed') {
        toast.error(
          `Failed to publish post: ${data.error_message || 'Unknown error'}`,
          {
            duration: 5000,
          }
        );
      }
    }
  }, [data, hasNotified, initialStatus]);

  return {
    status: data?.status,
    results: data?.results || [],
    error: data?.error_message,
    isLoading,
    isPosting: data?.status === 'posting',
    isComplete: data?.status && ['posted', 'failed', 'partial'].includes(data.status),
  };
}

// Simple hook to get post status once
export function usePostStatus(postId: number) {
  return useQuery<PostStatus>({
    queryKey: ['post-status', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}/status`);
      return response.data;
    },
    enabled: !!postId,
  });
}