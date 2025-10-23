// src/hooks/use-oauth-callback.ts
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SocialPlatform } from '@/types';
import { useOAuth } from './use-oauth';
import toast from 'react-hot-toast';

export function useOAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useOAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platform = searchParams.get('platform') as SocialPlatform;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  useEffect(() => {
    if (!platform || !code || !state) {
      setError('Invalid OAuth callback parameters');
      return;
    }

    // Verify state matches what we stored
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      setError('Invalid OAuth state - security risk');
      return;
    }

    const processCallback = async () => {
      setIsProcessing(true);
      try {
        await handleOAuthCallback(platform, code, state);
        
        // Close popup if it exists
        if (window.opener) {
          window.opener.close();
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error:any) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'OAuth callback failed');
      } finally {
        setIsProcessing(false);
        // Clean up stored state
        sessionStorage.removeItem('oauth_state');
      }
    };

    processCallback();
  }, [platform, code, state, handleOAuthCallback, router]);

  return {
    isProcessing,
    error,
    platform,
  };
}