// app/dashboard/overview/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
} from "lucide-react";

// Import our modular components
import { StatsCard } from "@/components/dashboard/stats-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TemplatesSnippet } from "@/components/dashboard/templates-snippet";
import { RecentPostsWidget } from "@/components/dashboard/recent-posts-widget";
import { EnhancedPostCreatorModal } from "@/components/modals/enhanced-post-creaor-modal";

// Import hooks for data fetching
import { usePosts } from "@/hooks/api/use-posts";
import { useSocialConnections } from "@/hooks/api/use-social-connections";
import { useAuth } from "@/providers/auth-provider";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Video,
} from "lucide-react";
import { Post } from "@/types";

// Platform configs
const PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "bg-sky-500",
    limit: 280,
    maxImages: 4,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-600",
    limit: 3000,
    maxImages: 20,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-700",
    limit: 63206,
    maxImages: 10,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
    limit: 2200,
    maxImages: 10,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-600",
    limit: 5000,
    maxImages: 1,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Video,
    color: "bg-black",
    limit: 2200,
    maxImages: 10,
  },
];

export default function DashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const [showPostCreator, setShowPostCreator] = useState(false);

  // Fetch data
  const { data: postsData, isLoading: postsLoading } = usePosts();
  const { connections, isLoading: connectionsLoading } = useSocialConnections();

  const posts = postsData?.posts || [];
  const connectedPlatforms =
    connections?.map((c: any) => c.platform.toLowerCase()) || [];

  // Calculate stats
  const totalPosts = posts.length;
  const scheduledPosts = posts.filter(
    (p: Post) => p.status === "scheduled",
  ).length;
  const postedPosts = posts.filter((p: Post) => p.status === "posted").length;
  const connectedAccounts = connections?.length || 0;

  // Calculate engagement (mock data for now - would come from analytics API)
  const totalEngagement = 1234;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username || "User"}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your social media today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Posts"
          value={totalPosts}
          icon={FileText}
          colorScheme="blue"
          loading={postsLoading}
          trend={{
            value: 12,
            label: "vs last week",
          }}
        />

        <StatsCard
          title="Connected Platforms"
          value={connectedAccounts}
          icon={Users}
          colorScheme="purple"
          loading={connectionsLoading}
        />

        <StatsCard
          title="Scheduled Posts"
          value={scheduledPosts}
          icon={Calendar}
          colorScheme="green"
          loading={postsLoading}
          trend={{
            value: 8,
            label: "vs last week",
          }}
        />

        <StatsCard
          title="Total Engagement"
          value={totalEngagement}
          icon={TrendingUp}
          colorScheme="amber"
          trend={{
            value: 15,
            label: "vs last week",
          }}
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Likes"
          value={456}
          icon={Heart}
          colorScheme="pink"
          trend={{
            value: 10,
            label: "this week",
          }}
        />

        <StatsCard
          title="Comments"
          value={128}
          icon={MessageCircle}
          colorScheme="blue"
          trend={{
            value: 5,
            label: "this week",
          }}
        />

        <StatsCard
          title="Shares"
          value={89}
          icon={Share2}
          colorScheme="green"
          trend={{
            value: 18,
            label: "this week",
          }}
        />

        <StatsCard
          title="Views"
          value="12.5K"
          icon={Eye}
          colorScheme="purple"
          trend={{
            value: 22,
            label: "this week",
          }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions
        onCreatePost={() => setShowPostCreator(true)}
        onViewCalendar={() => router.push("/dashboard/calendar")}
        onViewTemplates={() => router.push("/dashboard/templates")}
        onViewAnalytics={() => router.push("/dashboard/analytics")}
        onConnectPlatform={() => router.push("/dashboard/social")}
      />

      {/* Templates Snippet (for new users) */}
      <TemplatesSnippet />

      {/* Recent Posts */}
      <RecentPostsWidget
        posts={posts}
        loading={postsLoading}
        onViewAll={() => router.push("/dashboard/posts")}
        onViewPost={(post) => router.push(`/dashboard/posts/${post.id}`)}
      />

      {/* Post Creator Modal */}
      <EnhancedPostCreatorModal
        isOpen={showPostCreator}
        onClose={() => setShowPostCreator(false)}
        platforms={PLATFORMS}
        connectedPlatforms={connectedPlatforms}
      />
    </div>
  );
}
