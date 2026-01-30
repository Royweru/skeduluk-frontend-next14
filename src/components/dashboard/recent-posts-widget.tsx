// components/dashboard/recent-posts-widget.tsx
/**
 * Recent Posts Widget
 *
 * Displays the user's most recent posts with status indicators.
 * Small, focused component for the dashboard.
 */

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Eye,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Post } from "@/types";

interface RecentPostsWidgetProps {
  posts: Post[];
  loading?: boolean;
  onViewAll: () => void;
  onViewPost: (post: Post) => void;
}

const statusConfig = {
  posted: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    label: "Posted",
  },
  scheduled: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Scheduled",
  },
  processing: {
    icon: Loader2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Processing",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Failed",
  },
  partial: {
    icon: CheckCircle2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Partial",
  },
};

const PLATFORM_EMOJIS: Record<string, string> = {
  TWITTER: "𝕏",
  FACEBOOK: "📘",
  LINKEDIN: "💼",
  INSTAGRAM: "📷",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
};

export function RecentPostsWidget({
  posts,
  loading = false,
  onViewAll,
  onViewPost,
}: RecentPostsWidgetProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border-2 border-gray-200
               animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="gap-1 text-xs"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="p-8 text-center rounded-xl border-2 border-dashed border-gray-300">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">No posts yet</p>
          <p className="text-xs text-gray-500">
            Create your first post to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.slice(0, 5).map((post) => {
            const status =
              statusConfig[post.status as keyof typeof statusConfig] ||
              statusConfig.processing;
            const StatusIcon = status.icon;

            return (
              <div
                key={post.id}
                onClick={() => onViewPost(post)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                  status.border,
                  status.bg,
                )}
              >
                <div
                  className="flex items-start justify-between
                 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    {/* Content preview */}
                    <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                      {post.original_content}
                    </p>

                    {/* Platforms */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {post.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="text-xs"
                          title={platform}
                        >
                          {PLATFORM_EMOJIS[platform] || "📱"}
                        </span>
                      ))}
                    </div>

                    {/* Time */}
                    <p className="text-[10px] text-gray-600">
                      {post.scheduled_for
                        ? `Scheduled for ${format(new Date(post.scheduled_for), "MMM d, h:mm a")}`
                        : `Created ${format(new Date(post.created_at), "MMM d, h:mm a")}`}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        status.color,
                        status.bg,
                        status.border,
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          "h-3 w-3 mr-1",
                          post.status === "processing" && "animate-spin",
                        )}
                      />
                      {status.label}
                    </Badge>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPost(post);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/80
                       transition-colors"
                    >
                      <Eye className="h-3 w-3 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
