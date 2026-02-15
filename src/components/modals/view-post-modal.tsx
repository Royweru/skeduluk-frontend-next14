// components/modals/view-post-modal.tsx
/**
 * Premium Post View Modal
 *
 * A sleek, modern modal for viewing post details with:
 * - Glassmorphism design with gradient overlays
 * - Platform-specific styling and badges
 * - Media gallery with image/video support
 * - Action buttons for publish, edit, delete
 * - Smooth Framer Motion animations
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Send,
  Pencil,
  Trash2,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MoreHorizontal,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Post, PostStatus, SocialPlatform } from "@/types";
import {useViewPostModalStore } from "@/store/view-post-modal-store";
import { usePublishPost, useDeletePost } from "@/hooks/api/use-posts";
import toast from "react-hot-toast";

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

const PLATFORM_CONFIG: Record<
  string,
  {
    name: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  TWITTER: {
    name: "X (Twitter)",
    icon: "𝕏",
    color: "text-gray-900",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
  },
  FACEBOOK: {
    name: "Facebook",
    icon: "📘",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  LINKEDIN: {
    name: "LinkedIn",
    icon: "💼",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  INSTAGRAM: {
    name: "Instagram",
    icon: "📷",
    color: "text-pink-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    borderColor: "border-pink-200",
  },
  TIKTOK: {
    name: "TikTok",
    icon: "🎵",
    color: "text-gray-900",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
  },
  YOUTUBE: {
    name: "YouTube",
    icon: "▶️",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<
  PostStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    bgColor: string;
    borderColor: string;
    pulse?: boolean;
  }
> = {
  draft: {
    label: "Draft",
    icon: Pencil,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    pulse: true,
  },
  posting: {
    label: "Posting",
    icon: Send,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    pulse: true,
  },
  posted: {
    label: "Posted",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
  },
  partial: {
    label: "Partial Success",
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
  },
};

// ============================================================================
// MEDIA GALLERY COMPONENT
// ============================================================================

interface MediaGalleryProps {
  mediaUrls: string[];
}

function MediaGallery({ mediaUrls }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const isVideo = (url: string) => {
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  const currentMedia = mediaUrls[activeIndex];
  const isCurrentVideo = isVideo(currentMedia);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative rounded-2xl overflow-hidden bg-gray-900"
    >
      {/* Main Media Display */}
      <div className="relative aspect-video">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {isCurrentVideo ? (
              <video
                src={currentMedia}
                className="w-full h-full object-contain"
                controls={false}
                muted={isMuted}
                autoPlay={isPlaying}
                loop
                onClick={() => setIsPlaying(!isPlaying)}
              />
            ) : (
              <Image
                src={currentMedia}
                alt={`Media ${activeIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Video Controls */}
        {isCurrentVideo && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {mediaUrls.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Media Counter */}
        {mediaUrls.length > 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
            {activeIndex + 1} / {mediaUrls.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {mediaUrls.length > 1 && (
        <div className="flex gap-2 p-3 bg-gray-950 overflow-x-auto">
          {mediaUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all",
                activeIndex === index
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              {isVideo(url) ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
              ) : (
                <Image
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// PLATFORM BADGE COMPONENT
// ============================================================================

interface PlatformBadgeProps {
  platform: string;
  size?: "sm" | "md" | "lg";
}

function PlatformBadge({ platform, size = "md" }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform] || {
    name: platform,
    icon: "📱",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium transition-shadow hover:shadow-md",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
      )}
    >
      <span>{config.icon}</span>
      <span>{config.name}</span>
    </motion.div>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  status: PostStatus;
  size?: "sm" | "md" | "lg";
}

function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const StatusIcon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        config.pulse && "animate-pulse",
      )}
    >
      <StatusIcon
        className={cn(
          iconSizes[size],
          status === "processing" && "animate-spin",
        )}
      />
      <span>{config.label}</span>
    </motion.div>
  );
}



export function ViewPostModal() {
  const { isOpen, selectedPost, closeModal } = useViewPostModalStore();
  const publishPost = usePublishPost();
  const deletePost = useDeletePost();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedPost) return null;

  const post = selectedPost;
  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;

  const handlePublishNow = async () => {
    try {
      await publishPost.mutateAsync(post.id);
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post.id);
      closeModal();
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(post.original_content);
    toast.success("Content copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
        {/* Gradient Header Background */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />

        <ScrollArea className="max-h-[90vh]">
          <div className="relative p-6 space-y-6">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between gap-4"
            >
              <div className="space-y-3 flex-1">
                {/* Status Badge */}
                <StatusBadge status={post.status} size="md" />

                {/* Platform Badges */}
                <div className="flex flex-wrap gap-2">
                  {post.platforms.map((platform) => (
                    <PlatformBadge
                      key={platform}
                      platform={platform}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base">
                  {post.original_content}
                </p>

                {/* Copy Button */}
                <button
                  onClick={handleCopyContent}
                  className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  title="Copy content"
                >
                  <Copy className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>
            </motion.div>

            {/* Enhanced Content Preview (if available) */}
            {post.enhanced_content &&
              Object.keys(post.enhanced_content).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-3"
                >
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    AI-Enhanced Versions
                  </h4>
                  <div className="grid gap-3">
                    {Object.entries(post.enhanced_content).map(
                      ([platform, content]) => (
                        <div
                          key={platform}
                          className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-blue-100"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">
                              {PLATFORM_CONFIG[platform]?.icon || "📱"}
                            </span>
                            <span className="text-xs font-medium text-gray-600">
                              {PLATFORM_CONFIG[platform]?.name || platform}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {content}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </motion.div>
              )}

            {/* Media Gallery */}
            {post.image_urls && post.image_urls.length > 0 && (
              <MediaGallery mediaUrls={post.image_urls} />
            )}

            {/* Error Message */}
            {post.error_message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-50 border border-red-200"
              >
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">
                      Error Details
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      {post.error_message}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Metadata Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Created</span>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {format(new Date(post.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {post.scheduled_for && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Scheduled For</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {format(
                      new Date(post.scheduled_for),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.scheduled_for), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              {/* Publish Now - Only show for scheduled/draft posts */}
              {(post.status === "scheduled" || post.status === "draft") && (
                <Button
                  onClick={handlePublishNow}
                  disabled={publishPost.isPending}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                  {publishPost.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Now
                    </>
                  )}
                </Button>
              )}

              {/* Retry - Only show for failed posts */}
              {post.status === "failed" && (
                <Button
                  onClick={handlePublishNow}
                  disabled={publishPost.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {publishPost.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Retry Post
                    </>
                  )}
                </Button>
              )}

              {/* Delete Button */}
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-sm text-red-700">Are you sure?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deletePost.isPending}
                    className="h-8"
                  >
                    {deletePost.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Yes, Delete"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Copy Content */}
              <Button variant="ghost" onClick={handleCopyContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ViewPostModal;
