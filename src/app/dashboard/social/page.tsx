'use client';

import { PlatformConnectionCard } from '@/components/oauth/platform-connection-card';
import { useSocialConnections } from '@/hooks/api/use-social-connections';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function SocialConnectionsPage() {
  const {  connections, isLoading } = useSocialConnections();

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
    <div className="p-6">
      <PlatformConnectionCard connections={connections || []} />
    </div>
  );
}