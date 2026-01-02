'use client';

import { PlatformConnectionCard } from '@/components/oauth/platform-connection-card';
import { FacebookPageSelector } from '@/components/facebook/page-selector';
import { useSocialConnections } from '@/hooks/api/use-social-connections';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function SocialConnectionsPage() {
  const { connections, isLoading } = useSocialConnections();

  const hasFacebookConnection = connections?.some(
    (c: any) => c.platform.toLowerCase() === 'facebook' && c.is_active
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-64 mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
      <PlatformConnectionCard connections={connections || []} />
      
      {/* ✅ Show Facebook Page Selector if Facebook is connected */}
      {hasFacebookConnection && (
        <div>
          <h2 className="text-xl font-bold mb-4">Facebook Page Settings</h2>
          <FacebookPageSelector />
        </div>
      )}
    </div>
  );
}