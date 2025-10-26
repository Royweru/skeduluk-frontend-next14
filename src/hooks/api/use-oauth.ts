// src/hooks/api/use-oauth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useOAuth() {
  const queryClient = useQueryClient();
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  // Listen for OAuth messages from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin matches your backend
      const allowedOrigin = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      if (!event.origin.includes(allowedOrigin.replace('http://', '').replace('https://', '').split(':')[0])) {
        return;
      }

      const { type, platform, username, error } = event.data;

      if (type === 'OAUTH_SUCCESS') {
        toast.success(`Successfully connected to ${platform}!${username ? ` (${username})` : ''}`);
        
        // Refresh connections list
        queryClient.invalidateQueries({ queryKey: ['social-connections'] });
        
        // Clean up
        setConnectingPlatform(null);
        if (popupRef.current) {
          popupRef.current = null;
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      } else if (type === 'OAUTH_ERROR') {
        toast.error(`Failed to connect ${platform}: ${error}`);
        
        // Clean up
        setConnectingPlatform(null);
        if (popupRef.current) {
          popupRef.current = null;
        }
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      // Cleanup on unmount
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [queryClient]);

  const initiateOAuthMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await api.get(`/auth/oauth/${platform}/authorize`);
      return response.data;
    },
    onMutate: (platform) => {
      setConnectingPlatform(platform);
    },
    onSuccess: (data, platform) => {
      if (data.auth_url) {
        // Calculate popup position (center of screen)
        const width = 600;
        const height = 700;
        const left = Math.max(0, (window.screen.width - width) / 2);
        const top = Math.max(0, (window.screen.height - height) / 2);

        // Close existing popup if any
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }

        // Open new popup
        popupRef.current = window.open(
          data.auth_url,
          `oauth_${platform}`, // Unique name per platform
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popupRef.current) {
          toast.error('Please allow popups for this site to connect your account');
          setConnectingPlatform(null);
          return;
        }

        // Focus the popup
        popupRef.current.focus();

        // Clear existing interval
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }

        // Monitor popup closure
        checkIntervalRef.current = setInterval(() => {
          if (popupRef.current && popupRef.current.closed) {
            clearInterval(checkIntervalRef.current!);
            checkIntervalRef.current = null;
            popupRef.current = null;
            
            // Only show this if connection wasn't successful
            // (success message is handled by postMessage)
            setTimeout(() => {
              if (connectingPlatform === platform) {
                toast.success('OAuth window was closed');
                setConnectingPlatform(null);
              }
            }, 500);
          }
        }, 500);
      }
    },
    onError: (error: any, platform) => {
      toast.error(error.response?.data?.detail || 'Failed to initiate OAuth');
      setConnectingPlatform(null);
    }
  });

  return {
    initiateOAuth: initiateOAuthMutation.mutateAsync,
    isOAuthLoading: initiateOAuthMutation.isPending,
    connectingPlatform
  };
}