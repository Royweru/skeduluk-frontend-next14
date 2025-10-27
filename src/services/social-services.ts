// src/lib/api/social.ts
import { ApiResponse, OAuthConfig, PlatformConfig, SocialConnection } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class SocialAPI {
  // Get user's social connections
 static async getConnections(): Promise<SocialConnection[]> {
    const response = await fetch(`${API_BASE_URL}/social/connections`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      console.log('Failed to fetch connections');
      throw new Error('Failed to fetch connections');
    }

    const data = await response.json();
    // Backend returns { connections: [...] }, extract the array
    return data.connections || [];
  }

  // Initiate OAuth flow
  static async initiateOAuth(platform: string): Promise<OAuthConfig> {
    const response = await fetch(`${API_BASE_URL}/auth/oauth/${platform}/authorize`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to initiate OAuth');
    }

    return response.json();
  }



  // Disconnect social account
  static async disconnectAccount(connectionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/social/connections/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect account');
    }
  }

  // Get supported platforms
  static async getSupportedPlatforms(): Promise<PlatformConfig[]> {
    const response = await fetch(`${API_BASE_URL}/social/platforms`);

    if (!response.ok) {
      throw new Error('Failed to fetch platforms');
    }

    return response.json();
  }
}