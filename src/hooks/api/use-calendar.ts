import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { CalendarEventsResponse } from '@/types';

export function useCalendarEvents(startDate: string, endDate: string) {
  return useQuery<CalendarEventsResponse>({
    queryKey: ['calendar-events', startDate, endDate],
    queryFn: () => postsApi.getCalendarEvents(startDate, endDate),
    enabled: !!(startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

// Hook to fetch monthly summary
export function useCalendarSummary(month: string) {
  return useQuery({
    queryKey: ['calendar-summary', month],
    queryFn: () => postsApi.getCalendarSummary(month),
    enabled: !!month,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
