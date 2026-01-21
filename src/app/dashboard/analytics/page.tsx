// src/app/dashboard/analytics/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Sparkles,
} from "lucide-react";
import { MetricCard } from "@/components/analytics/metric-card";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import { PlatformBreakdown } from "@/components/analytics/platform-breakdown";
import { TopPostsList } from "@/components/analytics/top-posts-list";
import { AISuggestionsPanel } from "@/components/analytics/ai-suggestions-panel";
import {
  useDashboardAnalytics,
  usePlatformComparison,
} from "@/hooks/api/use-analytics";
import { cn } from "@/lib/utils";

const TIME_PERIODS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last year" },
];

const PLATFORMS = [
  { value: "all", label: "All Platforms" },
  { value: "TWITTER", label: "Twitter/X" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedPlatform, setSelectedPlatform] = useState<string | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch analytics data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useDashboardAnalytics(
    parseInt(selectedPeriod),
    selectedPlatform === "all" ? undefined : selectedPlatform,
  );

  const { data: comparisonData, isLoading: isComparisonLoading } =
    usePlatformComparison(parseInt(selectedPeriod));

  const isLoading = isDashboardLoading || isComparisonLoading;

  const summary = dashboardData?.summary;
  const topPosts = dashboardData?.top_posts || [];
  const trends = dashboardData?.analytics_over_time || [];

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Track your social media performance and insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetchDashboard()}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Time Period
                  </label>
                </div>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Platform
                  </label>
                </div>
                <Select
                  value={selectedPlatform || "all"}
                  onValueChange={(val) =>
                    setSelectedPlatform(val === "all" ? undefined : val)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 shadow-md animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Metrics */}
        {!isLoading && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Views"
              value={summary.total_views}
              icon={Eye}
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Total Engagement"
              value={summary.total_engagement}
              icon={TrendingUp}
              iconColor="text-amber-600"
            />
            <MetricCard
              title="Avg. Engagement Rate"
              value={`${summary.avg_engagement_rate.toFixed(1)}%`}
              icon={Sparkles}
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Total Posts"
              value={summary.total_posts}
              icon={BarChart3}
              iconColor="text-teal-600"
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Engagement Chart */}
            {!isLoading && trends.length > 0 && (
              <EngagementChart
                data={trends}
                title="Engagement Trends"
                description={`Performance over the last ${selectedPeriod} days`}
              />
            )}

            {/* Secondary Metrics */}
            {!isLoading && summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Likes
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {summary.total_likes.toLocaleString()}
                        </p>
                      </div>
                      <Heart className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Comments
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {summary.total_comments.toLocaleString()}
                        </p>
                      </div>
                      <MessageCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Shares
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {summary.total_shares.toLocaleString()}
                        </p>
                      </div>
                      <Share2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && (!summary || summary.total_posts === 0) && (
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No Analytics Data Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Publish some posts to start seeing analytics
                    </p>
                    <Button>Create Your First Post</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <AISuggestionsPanel days={parseInt(selectedPeriod)} />
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            {!isLoading && comparisonData && (
              <PlatformBreakdown
                platforms={comparisonData.platforms}
                bestPlatform={comparisonData.best_platform}
              />
            )}

            {!isLoading &&
              (!comparisonData ||
                Object.keys(comparisonData.platforms).length === 0) && (
                <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <p className="text-gray-600">
                        No platform data available
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          {/* Top Posts Tab */}
          <TabsContent value="top-posts" className="space-y-6">
            <TopPostsList posts={topPosts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
