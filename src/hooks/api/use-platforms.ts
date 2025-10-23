// src/hooks/use-platforms.ts
import { useMemo } from 'react';
import { SocialPlatform, PlatformConfig } from '@/types';
import { SocialAPI } from '@/services/social-services';
import { useQuery } from '@tanstack/react-query';

export function usePlatforms() {
  const {
    data: platforms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['social-platforms'],
    queryFn: SocialAPI.getSupportedPlatforms,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const getPlatformConfig = (platform: SocialPlatform): PlatformConfig | undefined => {
    return platforms.find(p => p.key === platform);
  };

  const connectedPlatforms = useMemo(() => {
    return platforms.filter((p:any) => p.supported);
  }, [platforms]);

  const isPlatformConnected = (platform: SocialPlatform): boolean => {
    // This would typically come from your social connections data
    // For now, we'll use a placeholder
    return false;
  };

  return {
    platforms,
    isLoading,
    error,
    getPlatformConfig,
    connectedPlatforms,
    isPlatformConnected,
  };
}