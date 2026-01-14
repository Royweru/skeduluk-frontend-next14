// src/hooks/api/use-analytics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { AnalyticsOverTime, AnalyticsSummary, DashboardAnalytics,
    PlatformComparison,TopPerformingPost } from '@/app/types';
import toast from 'react-hot-toast';

// Fetch analytics for a specific post (manual refresh)
export function useFetchPostAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => analyticsApi.fetchPostAnalytics(postId),
    onSuccess: (data) => {
      const successCount = Object.values(data.platforms).filter(p => p.success).length;
      const totalPlatforms = Object.keys(data.platforms).length;
      
      toast.success(`📊 Analytics fetched from ${successCount}/${totalPlatforms} platforms`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['post-analytics', data.post_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to fetch analytics');
    }
  });
}

// Get stored analytics for a post
export function usePostAnalytics(postId: number, platform?: string) {
  return useQuery({
    queryKey: ['post-analytics', postId, platform],
    queryFn: () => analyticsApi.getPostAnalytics(postId, platform),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get dashboard analytics
export function useDashboardAnalytics(days: number = 30, platform?: string) {
  return useQuery<DashboardAnalytics>({
    queryKey: ['dashboard-analytics', days, platform],
    queryFn: () => analyticsApi.getDashboardAnalytics(days, platform),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Get analytics summary
export function useAnalyticsSummary(days: number = 30, platform?: string) {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary', days, platform],
    queryFn: () => analyticsApi.getSummary(days, platform),
    staleTime: 2 * 60 * 1000,
  });
}

// Get top performing posts
export function useTopPosts(limit: number = 10, metric: 'engagement_rate' | 'views' | 'likes' = 'engagement_rate') {
  return useQuery<TopPerformingPost[]>({
    queryKey: ['top-posts', limit, metric],
    queryFn: () => analyticsApi.getTopPosts(limit, metric),
    staleTime: 5 * 60 * 1000,
  });
}

// Get analytics trends
export function useAnalyticsTrends(days: number = 30, platform?: string) {
  return useQuery<AnalyticsOverTime[]>({
    queryKey: ['analytics-trends', days, platform],
    queryFn: () => analyticsApi.getTrends(days, platform),
    staleTime: 5 * 60 * 1000,
  });
}

// Get platform comparison
export function usePlatformComparison(days: number = 30) {
  return useQuery<PlatformComparison>({
    queryKey: ['platform-comparison', days],
    queryFn: () => analyticsApi.getPlatformComparison(days),
    staleTime: 5 * 60 * 1000,
  });
}