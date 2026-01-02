// hooks/api/use-facebook.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facebookApi } from '@/lib/api';
import toast from 'react-hot-toast';

export function useFacebookPages() {
  return useQuery({
    queryKey: ['facebook-pages'],
    queryFn: facebookApi.getPages,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}

export function useSelectFacebookPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facebookApi.selectPage,
    onSuccess: (data) => {
      toast.success(`✅ Selected page: ${data.page.name}`);
      queryClient.invalidateQueries({ queryKey: ['facebook-pages'] });
      queryClient.invalidateQueries({ queryKey: ['selected-facebook-page'] });
      queryClient.invalidateQueries({ queryKey: ['social-connections'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to select page');
    }
  });
}

export function useSelectedFacebookPage() {
  return useQuery({
    queryKey: ['selected-facebook-page'],
    queryFn: facebookApi.getSelectedPage,
    staleTime: 5 * 60 * 1000
  });
}