// app/dashboard/posts/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Send,
  TrendingUp,
  BarChart3,
  FileText,
  ChevronDown,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  LayoutList,
  CalendarClock,
  Sparkles,
  Image as ImageIcon,
  Video,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isSameDay,
} from "date-fns";
import { Post, PostStatus, SocialPlatform } from "@/types";
import { usePosts, useDeletePost, usePublishPost } from "@/hooks/api/use-posts";
import { usePostModalStore } from "@/store/post-modal-store";
import { ViewPostModal } from "@/components/modals/view-post-modal";
import { EnhancedPostCreatorModal } from "@/components/modals/enhanced-post-creaor-modal";
import toast from "react-hot-toast";
import Image from "next/image";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type ViewMode = "grid" | "list" | "timeline";
type SortField = "created_at" | "scheduled_for" | "status";
type SortOrder = "asc" | "desc";

const STATUS_CONFIG: Record<
  PostStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
  }
> = {
  draft: {
    label: "Draft",
    icon: Pencil,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    dotColor: "bg-gray-400",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  posting: {
    label: "Posting",
    icon: Send,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    dotColor: "bg-indigo-500",
  },
  posted: {
    label: "Posted",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    dotColor: "bg-green-500",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
  },
  partial: {
    label: "Partial",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
  },
};

const PLATFORM_CONFIG: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  TWITTER: { name: "X", icon: "𝕏", color: "bg-gray-900 text-white" },
  FACEBOOK: { name: "Facebook", icon: "📘", color: "bg-blue-600 text-white" },
  LINKEDIN: { name: "LinkedIn", icon: "💼", color: "bg-blue-700 text-white" },
  INSTAGRAM: {
    name: "Instagram",
    icon: "📷",
    color: "bg-gradient-to-br from-purple-600 to-pink-500 text-white",
  },
  TIKTOK: { name: "TikTok", icon: "🎵", color: "bg-gray-900 text-white" },
  YOUTUBE: { name: "YouTube", icon: "▶️", color: "bg-red-600 text-white" },
};

// ============================================================================
// HERO STATS COMPONENT
// ============================================================================

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: typeof FileText;
  trend?: number;
  color: string;
  bgGradient: string;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  bgGradient,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-gradient-to-br shadow-lg",
        bgGradient,
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-2 rounded-xl bg-white/20 backdrop-blur-sm")}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                trend >= 0
                  ? "bg-green-500/20 text-green-100"
                  : "bg-red-500/20 text-red-100",
              )}
            >
              <TrendingUp
                className={cn("h-3 w-3", trend < 0 && "rotate-180")}
              />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/80 mt-1">{title}</p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// POST CARD COMPONENT (GRID VIEW)
// ============================================================================

interface PostCardProps {
  post: Post;
  onView: () => void;
  onDelete: () => void;
  onPublish: () => void;
}

function PostCard({ post, onView, onDelete, onPublish }: PostCardProps) {
  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;
  const hasMedia = post.image_urls && post.image_urls.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onView}
      className="group relative rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Media Preview */}
      {hasMedia && (
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          <Image
            src={post.image_urls![0]}
            alt="Post media"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.image_urls!.length > 1 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />+{post.image_urls!.length - 1}
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Status & Platforms Row */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              statusConfig.bgColor,
              statusConfig.color,
              statusConfig.borderColor,
              "border",
            )}
          >
            <StatusIcon
              className={cn(
                "h-3 w-3",
                post.status === "processing" && "animate-spin",
              )}
            />
            {statusConfig.label}
          </div>

          <div className="flex items-center gap-1">
            {post.platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                className="text-sm"
                title={PLATFORM_CONFIG[platform]?.name}
              >
                {PLATFORM_CONFIG[platform]?.icon || "📱"}
              </span>
            ))}
            {post.platforms.length > 3 && (
              <span className="text-xs text-gray-400">
                +{post.platforms.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
          {post.original_content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {post.scheduled_for
                ? format(new Date(post.scheduled_for), "MMM d, h:mm a")
                : format(new Date(post.created_at), "MMM d, h:mm a")}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="View"
            >
              <Eye className="h-3.5 w-3.5 text-gray-500" />
            </button>
            {(post.status === "scheduled" || post.status === "draft") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish();
                }}
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                title="Publish Now"
              >
                <Send className="h-3.5 w-3.5 text-blue-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}

// ============================================================================
// POST ROW COMPONENT (LIST VIEW)
// ============================================================================

interface PostRowProps {
  post: Post;
  onView: () => void;
  onDelete: () => void;
  onPublish: () => void;
}

function PostRow({ post, onView, onDelete, onPublish }: PostRowProps) {
  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={onView}
      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
    >
      {/* Media Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
        {post.image_urls && post.image_urls.length > 0 ? (
          <Image
            src={post.image_urls[0]}
            alt="Thumbnail"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 line-clamp-1 font-medium">
          {post.original_content}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            {post.platforms.map((platform) => (
              <span key={platform} className="text-xs">
                {PLATFORM_CONFIG[platform]?.icon || "📱"}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {post.scheduled_for
              ? `Scheduled for ${format(new Date(post.scheduled_for), "MMM d, h:mm a")}`
              : format(new Date(post.created_at), "MMM d, h:mm a")}
          </span>
        </div>
      </div>

      {/* Status */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
          statusConfig.bgColor,
          statusConfig.color,
          "border",
          statusConfig.borderColor,
        )}
      >
        <StatusIcon
          className={cn(
            "h-3 w-3",
            post.status === "processing" && "animate-spin",
          )}
        />
        {statusConfig.label}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Eye className="h-4 w-4 text-gray-500" />
        </button>
        {(post.status === "scheduled" || post.status === "draft") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPublish();
            }}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Send className="h-4 w-4 text-blue-500" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// TIMELINE GROUP COMPONENT
// ============================================================================

interface TimelineGroupProps {
  date: string;
  posts: Post[];
  onViewPost: (post: Post) => void;
  onDeletePost: (id: number) => void;
  onPublishPost: (id: number) => void;
}

function TimelineGroup({
  date,
  posts,
  onViewPost,
  onDeletePost,
  onPublishPost,
}: TimelineGroupProps) {
  const dateObj = new Date(date);
  const dateLabel = isToday(dateObj)
    ? "Today"
    : isYesterday(dateObj)
      ? "Yesterday"
      : format(dateObj, "EEEE, MMM d, yyyy");

  return (
    <div className="relative">
      {/* Date Header */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-3 px-4 -mx-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          <span className="text-sm font-semibold text-gray-700">
            {dateLabel}
          </span>
          <span className="text-xs text-gray-400">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-2 pl-3 border-l-2 border-gray-100 ml-1">
        {posts.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            onView={() => onViewPost(post)}
            onDelete={() => onDeletePost(post.id)}
            onPublish={() => onPublishPost(post.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState({
  hasFilters,
  onCreatePost,
  onClearFilters,
}: {
  hasFilters: boolean;
  onCreatePost: () => void;
  onClearFilters: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative mb-6">
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20
         to-purple-500/20 rounded-full blur-2xl"
        />
        <div
          className="relative p-6 rounded-full bg-gradient-to-br from-gray-50 to-white border
         border-gray-100 shadow-lg"
        >
          <FileText className="h-12 w-12 text-gray-300" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasFilters ? "No posts match your filters" : "No posts yet"}
      </h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">
        {hasFilters
          ? "Try adjusting your filters or search query to find what you're looking for."
          : "Create your first post to start engaging with your audience across all platforms."}
      </p>

      <div className="flex items-center gap-3">
        {hasFilters ? (
          <Button variant="outline" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        ) : (
          <Button
            onClick={onCreatePost}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Post
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN POSTS PAGE COMPONENT
// ============================================================================

export default function PostsPage() {
  const { data: postsData, isLoading } = usePosts();
  const deletePost = useDeletePost();
  const publishPost = usePublishPost();
  const { openModal } = usePostModalStore();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | "all">(
    "all",
  );
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const posts = postsData?.posts || [];

  // Filter & Sort Posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((post) =>
        post.original_content.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((post) => post.status === statusFilter);
    }

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter((post) => post.platforms.includes(platformFilter));
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortField === "created_at") {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      } else if (sortField === "scheduled_for") {
        aVal = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0;
        bVal = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0;
      } else {
        aVal = a.status;
        bVal = b.status;
      }

      return sortOrder === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });

    return result;
  }, [posts, searchQuery, statusFilter, platformFilter, sortField, sortOrder]);

  // Group posts by date for timeline view
  const groupedPosts = useMemo(() => {
    const groups: Record<string, Post[]> = {};

    filteredPosts.forEach((post) => {
      const dateKey = format(new Date(post.created_at), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(post);
    });

    return Object.entries(groups).sort(([a], [b]) =>
      sortOrder === "desc" ? b.localeCompare(a) : a.localeCompare(b),
    );
  }, [filteredPosts, sortOrder]);

  // Stats
  const stats = useMemo(
    () => ({
      total: posts.length,
      posted: posts.filter((p: any) => p.status === "posted").length,
      scheduled: posts.filter((p: any) => p.status === "scheduled").length,
      failed: posts.filter((p: any) => p.status === "failed").length,
      successRate:
        posts.length > 0
          ? Math.round(
              (posts.filter((p: any) => p.status === "posted").length /
                posts.length) *
                100,
            )
          : 0,
    }),
    [posts],
  );

  const hasFilters =
    !!searchQuery || statusFilter !== "all" || platformFilter !== "all";

  const handleDeletePost = async (id: number) => {
    try {
      await deletePost.mutateAsync(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePublishPost = async (id: number) => {
    try {
      await publishPost.mutateAsync(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlatformFilter("all");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Loading Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
        {/* Loading Posts */}
        <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your social media posts
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700
           hover:to-indigo-700 shadow-lg shadow-blue-500/25
            hover:shadow-blue-500/40 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Posts"
          value={stats.total}
          icon={FileText}
          color="blue"
          bgGradient="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Published"
          value={stats.posted}
          icon={CheckCircle2}
          trend={12}
          color="green"
          bgGradient="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Clock}
          color="purple"
          bgGradient="from-purple-500 to-indigo-600"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={TrendingUp}
          trend={5}
          color="amber"
          bgGradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Filters & View Toggle */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 
      rounded-2xl bg-white border border-gray-100 shadow-sm"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="ml-1">
                  {STATUS_CONFIG[statusFilter]?.label || statusFilter}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              <span className={cn(statusFilter === "all" && "font-semibold")}>
                All Statuses
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setStatusFilter(status as PostStatus)}
              >
                <div
                  className={cn("h-2 w-2 rounded-full mr-2", config.dotColor)}
                />
                <span
                  className={cn(statusFilter === status && "font-semibold")}
                >
                  {config.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Platform Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Platform
              {platformFilter !== "all" && (
                <span className="ml-1">
                  {PLATFORM_CONFIG[platformFilter]?.icon}
                </span>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => setPlatformFilter("all")}>
              <span className={cn(platformFilter === "all" && "font-semibold")}>
                All Platforms
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => (
              <DropdownMenuItem
                key={platform}
                onClick={() => setPlatformFilter(platform as SocialPlatform)}
              >
                <span className="mr-2">{config.icon}</span>
                <span
                  className={cn(platformFilter === platform && "font-semibold")}
                >
                  {config.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortField("created_at")}>
              <span
                className={cn(sortField === "created_at" && "font-semibold")}
              >
                Created Date
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("scheduled_for")}>
              <span
                className={cn(sortField === "scheduled_for" && "font-semibold")}
              >
                Scheduled Date
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("status")}>
              <span className={cn(sortField === "status" && "font-semibold")}>
                Status
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSortOrder("desc")}>
              <span className={cn(sortOrder === "desc" && "font-semibold")}>
                Newest First
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("asc")}>
              <span className={cn(sortOrder === "asc" && "font-semibold")}>
                Oldest First
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-50",
            )}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-50",
            )}
            title="List View"
          >
            <LayoutList className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "timeline"
                ? "bg-white shadow-sm"
                : "hover:bg-gray-50",
            )}
            title="Timeline View"
          >
            <CalendarClock className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Showing {filteredPosts.length} of {posts.length} posts
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Posts Display */}
      {filteredPosts.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onCreatePost={() => setShowCreateModal(true)}
          onClearFilters={clearFilters}
        />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onView={() => openModal(post)}
                  onDelete={() => handleDeletePost(post.id)}
                  onPublish={() => handlePublishPost(post.id)}
                />
              ))}
            </motion.div>
          )}

          {viewMode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50"
            >
              {filteredPosts.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onView={() => openModal(post)}
                  onDelete={() => handleDeletePost(post.id)}
                  onPublish={() => handlePublishPost(post.id)}
                />
              ))}
            </motion.div>
          )}

          {viewMode === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 bg-white rounded-2xl border border-gray-100 p-4"
            >
              {groupedPosts.map(([date, datePosts]) => (
                <TimelineGroup
                  key={date}
                  date={date}
                  posts={datePosts}
                  onViewPost={(post) => openModal(post)}
                  onDeletePost={handleDeletePost}
                  onPublishPost={handlePublishPost}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modals */}
      <ViewPostModal />
      <EnhancedPostCreatorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        platforms={[]}
        connectedPlatforms={[]}
      />

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 lg:hidden p-4 rounded-full bg-gradient-to-r
         from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 
         hover:shadow-xl hover:shadow-blue-500/50 transition-all z-50"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
