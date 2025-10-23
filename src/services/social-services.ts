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
      throw new Error('Failed to fetch connections');
    }

    return response.json();
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

  // Handle OAuth callback
  static async handleOAuthCallback(
    platform: string,
    code: string,
    state: string
  ): Promise<{ success: boolean; platform: string; connection_id?: number; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/oauth/${platform}/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'OAuth callback failed');
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