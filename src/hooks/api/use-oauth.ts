// src/hooks/use-oauth.ts
import { useState } from 'react';
import { SocialPlatform, OAuthConfig, OAuthCallbackParams } from '@/types';
import { SocialAPI } from '@/services/social-services';
import toast from 'react-hot-toast';

export function useOAuth() {
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [currentOAuthFlow, setCurrentOAuthFlow] = useState<{
    platform: SocialPlatform | null;
    config: OAuthConfig | null;
  } | null>(null);

  const initiateOAuth = async (platform: SocialPlatform) => {
    try {
      setIsOAuthLoading(true);
      const config = await SocialAPI.initiateOAuth(platform);
      
      setCurrentOAuthFlow({ platform, config });
      
      // Store the state in sessionStorage for callback verification
      sessionStorage.setItem('oauth_state', config.state);
      
      // Open OAuth URL in new window
      const popup = window.open(
        config.auth_url,
        'oauth_popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        throw new Error('Failed to open OAuth popup');
      }
      
      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsOAuthLoading(false);
          setCurrentOAuthFlow(null);
        }
      }, 1000);
      
    } catch (error:any) {
      setIsOAuthLoading(false);
      setCurrentOAuthFlow(null);
      toast.error(error.message || 'Failed to initiate OAuth');
    }
  };

  const handleOAuthCallback = async (
    platform: SocialPlatform,
    code: string,
    state: string
  ) => {
    try {
      const result = await SocialAPI.handleOAuthCallback(platform, code, state);
      
      if (result.success) {
        toast.success(`Successfully connected to ${platform}!`);
      } else {
        toast.error(result.error || `Failed to connect to ${platform}`);
      }
      
      // Clear OAuth flow state
      setCurrentOAuthFlow(null);
      setIsOAuthLoading(false);
      
      return result;
    } catch (error) {
      setCurrentOAuthFlow(null);
      setIsOAuthLoading(false);
      throw error;
    }
  };

  return {
    isOAuthLoading,
    currentOAuthFlow,
    initiateOAuth,
    handleOAuthCallback,
  };
}