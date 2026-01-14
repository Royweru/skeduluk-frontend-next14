// src/components/analytics/platform-breakdown.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformMetrics } from '@/app/types';
import { Twitter, Facebook, Linkedin, Instagram, Music, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformBreakdownProps {
  platforms: Record<string, PlatformMetrics>;
  bestPlatform?: string | null;
}

const PLATFORM_CONFIG = {
  TWITTER: { name: 'Twitter/X', icon: Twitter, color: 'bg-black' },
  FACEBOOK: { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  LINKEDIN: { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  INSTAGRAM: { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500' },
  TIKTOK: { name: 'TikTok', icon: Music, color: 'bg-black' },
  YOUTUBE: { name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
};

export function PlatformBreakdown({ platforms, bestPlatform }: PlatformBreakdownProps) {
  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Platform Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(platforms).map(([platform, metrics]) => {
          const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
          if (!config) return null;

          const Icon = config.icon;
          const isBest = platform === bestPlatform;

          return (
            <div
              key={platform}
              className={cn(
                'p-4 rounded-xl border-2 transition-all',
                isBest 
                  ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg text-white', config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{config.name}</p>
                    <p className="text-xs text-gray-600">{metrics.posts} posts</p>
                  </div>
                </div>
                {isBest && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                    🏆 Best
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Views</p>
                  <p className="text-sm font-bold text-gray-900">{metrics.views.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Likes</p>
                  <p className="text-sm font-bold text-gray-900">{metrics.likes.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Comments</p>
                  <p className="text-sm font-bold text-gray-900">{metrics.comments.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Engagement</p>
                  <p className="text-sm font-bold text-amber-600">{metrics.engagement_rate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Engagement bar */}
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(metrics.engagement_rate * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}