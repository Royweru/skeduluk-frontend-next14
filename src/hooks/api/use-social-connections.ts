// src/hooks/use-social-connections.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SocialConnection, SocialPlatform } from '@/types';
import { SocialAPI } from '@/services/social-services';
import toast from 'react-hot-toast';

export function useSocialConnections() {
  const queryClient = useQueryClient();

  const {
    data: connections = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['social-connections'],
    queryFn: SocialAPI.getConnections,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const disconnectMutation = useMutation({
    mutationFn: SocialAPI.disconnectAccount,
    onSuccess: (_, connectionId) => {
      toast.success('Account disconnected successfully');
      queryClient.invalidateQueries({ queryKey: ['social-connections'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disconnect account');
    },
  });

  return {
    connections,
    isLoading,
    error,
    refetch,
    awaitDisconnectAccount: disconnectMutation.mutateAsync,
    isDisconnecting:disconnectMutation.isPending,
  };
}