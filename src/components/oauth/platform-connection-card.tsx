'use client';

import { use, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Twitter, Facebook, Linkedin, CheckCircle, AlertCircle, 
  Loader2, ExternalLink, Unlink, Instagram, Music, Youtube
} from 'lucide-react';
import { useOAuth } from '@/hooks/api/use-oauth';
import { cn } from '@/lib/utils';
import { useSocialConnections } from '@/hooks/api/use-social-connections';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  features: string[];
}

const PLATFORMS: Platform[] = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Share tweets and threads with your followers',
    icon: Twitter,
    color: 'text-black',
    bgColor: 'bg-black',
    features: ['280 character tweets', 'Thread support', 'Image & video posts', 'Real-time analytics']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Post to your timeline and manage your Facebook page',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
    features: ['Long-form posts', 'Multiple images', 'Page management', 'Audience insights']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Share professional updates with your network',
    icon: Linkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-700',
    features: ['Professional content', 'Article publishing', 'Company pages', 'Engagement metrics']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share photos, reels, and stories with your audience',
    icon: Instagram,
    color: 'text-pink-600',
    bgColor: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500',
    features: ['Photo & video posts', 'Stories & Reels', 'Carousel posts', 'Hashtag optimization']
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Create viral short-form video content',
    icon: Music,
    color: 'text-black',
    bgColor: 'bg-black',
    features: ['Short-form videos', 'Trending sounds', 'Hashtag challenges', 'Creator analytics']
  },
 
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Upload and share video content with millions',
    icon: Youtube,
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    features: ['Video uploads', 'Playlists', 'Community posts', 'Detailed analytics']
  }
];

interface PlatformConnectionCardProps {
  connections: any[];
}

export function PlatformConnectionCard({ connections }: PlatformConnectionCardProps) {
  const { initiateOAuth, isOAuthLoading, connectingPlatform } = useOAuth();
  const { awaitDisconnectAccount, isDisconnecting } = useSocialConnections();

   const handleConnect = async (platformId: string) => {
    try {
      await initiateOAuth(platformId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDisconnect = async (connectionId: number, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}?`)) return;
    
    try {
      await awaitDisconnectAccount(connectionId);
    } catch (error) {
      // Error handled in mutation
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Connect Your Accounts</h2>
          <p className="text-gray-600 mt-1">
            Connect your social media accounts to start scheduling posts
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const connection = connections.find(
            (c: any) => c.platform.toLowerCase() === platform.id
          );
          const isConnected = !!connection;
          const isThisPlatformConnecting = connectingPlatform === platform.id;
          const PlatformIcon = platform.icon;

          return (
            <Card 
              key={platform.id}
              className={cn(
                "border-2 transition-all hover:shadow-lg",
                isConnected 
                  ? "border-green-200 bg-gradient-to-br from-green-50 to-white" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-3 rounded-xl text-white shadow-md", platform.bgColor)}>
                    <PlatformIcon className="h-7 w-7" />
                  </div>
                  
                  {isConnected ? (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-300">
                      Not Connected
                    </Badge>
                  )}
                </div>

                {/* Platform Info */}
                <h3 className="text-lg font-bold mb-2">{platform.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-gray-700 uppercase">Features</p>
                  <ul className="space-y-1.5">
                    {platform.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connection Info */}
                {isConnected && connection && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xs text-green-800">
                      <span className="font-semibold">Account:</span> {connection.platform_username || 'Connected'}
                    </p>
                    {connection.last_synced && (
                      <p className="text-xs text-green-700 mt-1">
                        Last synced: {new Date(connection.last_synced).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Button */}
               {isConnected ? (
                  <Button
                    onClick={() => handleDisconnect(connection.id, platform.name)}
                    disabled={isDisconnecting}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unlink className="mr-2 h-4 w-4" />
                        Disconnect
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isThisPlatformConnecting || isOAuthLoading}
                    className={cn(
                      "w-full text-white font-semibold shadow-md hover:shadow-lg transition-all",
                      platform.bgColor
                    )}
                  >
                    {isThisPlatformConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connect {platform.name}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 mt-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">How to connect your accounts</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">1.</span>
                  <span>Click "Connect" on the platform you want to link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">2.</span>
                  <span>You'll be redirected to the platform's authorization page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">3.</span>
                  <span>Grant Skeduluk permission to post on your behalf</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">4.</span>
                  <span>You'll be redirected back and your account will be connected!</span>
                </li>
              </ol>
              <p className="text-xs text-blue-700 mt-3">
                💡 <span className="font-semibold">Pro tip:</span> We only request
                 permissions needed to schedule and publish posts. Your account security is our priority.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}