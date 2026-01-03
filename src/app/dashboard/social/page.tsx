'use client';

import { PlatformConnectionCard } from '@/components/oauth/platform-connection-card';
import { FacebookPageSelector } from '@/components/facebook/page-selector';
import { useSocialConnections } from '@/hooks/api/use-social-connections';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Youtube } from 'lucide-react';

export default function SocialConnectionsPage() {
  const { connections, isLoading } = useSocialConnections();

  const hasFacebookConnection = connections?.some(
    (c: any) => c.platform.toLowerCase() === 'facebook' && c.is_active
  );

  // ✅ Check for YouTube connection (optional, for future YouTube-specific features)
  const hasYouTubeConnection = connections?.some(
    (c: any) => c.platform.toLowerCase() === 'youtube' && c.is_active
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-64 mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Platform Connections */}
      <PlatformConnectionCard connections={connections || []} />
      
      {/* ✅ Facebook Page Selector - Show if Facebook is connected */}
      {hasFacebookConnection && (
        <div>
          <h2 className="text-xl font-bold mb-4">Facebook Page Settings</h2>
          <FacebookPageSelector />
        </div>
      )}

      {/* ✅ YouTube Info Section - Show if YouTube is connected */}
      {hasYouTubeConnection && (
        <div>
          <h2 className="text-xl font-bold mb-4">YouTube Channel Info</h2>
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 rounded-lg">
                  <Youtube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">YouTube Connected</p>
                  <p className="text-sm text-gray-600">
                    Videos will be uploaded to your YouTube channel
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-800">
                  💡 <span className="font-semibold">Note:</span> YouTube posts require video files. 
                  Text-only posts will be skipped for YouTube.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}