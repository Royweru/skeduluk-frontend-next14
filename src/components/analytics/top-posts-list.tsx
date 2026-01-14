// src/components/analytics/top-posts-list.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TopPerformingPost } from '@/app/types';
import { TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface TopPostsListProps {
  posts: TopPerformingPost[];
}

export function TopPostsList({ posts }: TopPostsListProps) {
  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Top Performing Posts
            </CardTitle>
            <CardDescription>Your best content this period</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts with analytics yet</p>
              <p className="text-sm text-gray-400 mt-1">Publish some posts to see performance data</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <Link
                key={post.post_id}
                href={`/dashboard/posts/${post.post_id}`}
                className="block p-4 rounded-lg border-2 border-gray-200 hover:border-amber-300 hover:shadow-md transition-all bg-white group"
              >
                <div className="flex items-start gap-3">
                  {/* Rank badge */}
                  <div className="flex-shrink-0">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white' :
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Content preview */}
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                      {post.content}
                    </p>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span className="font-medium">{post.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span className="font-medium">{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span className="font-medium">{post.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        <span className="font-medium">{post.shares.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Platform and engagement */}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.platform}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-amber-500 text-amber-700 bg-amber-50"
                      >
                        {post.engagement_rate.toFixed(1)}% engagement
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(post.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}