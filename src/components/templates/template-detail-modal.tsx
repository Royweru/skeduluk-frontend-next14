// src/components/templates/template-detail-modal.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Star,
  Zap,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Copy,
  Edit,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Info,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTemplateAnalytics } from "@/hooks/api/use-templates";
import { Template } from "@/types";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TemplateDetailModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onToggleFavorite: (template: Template) => void;
}

const PLATFORM_ICONS = {
  TWITTER: "𝕏",
  FACEBOOK: "📘",
  LINKEDIN: "💼",
  INSTAGRAM: "📷",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
};

const PLATFORM_COLORS: Record<string, string> = {
  TWITTER: "#1DA1F2",
  FACEBOOK: "#1877F2",
  LINKEDIN: "#0A66C2",
  INSTAGRAM: "#E4405F",
  TIKTOK: "#000000",
  YOUTUBE: "#FF0000",
};

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  open,
  onOpenChange,
  onUse,
  onEdit,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState("preview");

  const templateId = template?.id || 0;
  const { data: analytics, isLoading: analyticsLoading } =
    useTemplateAnalytics(templateId);

  if (!template) return null;

  const canEdit = !template.is_system;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(template.content_template);
    toast.success("Content copied to clipboard!");
  };

  const renderVariablesList = () => {
    if (!template.variables || template.variables.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No variables defined for this template</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {template.variables.map((variable: any, index: any) => (
          <div
            key={index}
            className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-blue-600">
                  {`{${variable.name}}`}
                </span>
                {variable.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {variable.type}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-1">{variable.label}</p>
            <p className="text-xs text-gray-500">
              Example: {variable.placeholder}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderPlatformVariations = () => {
    if (
      !template.platform_variations ||
      Object.keys(template.platform_variations).length === 0
    ) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Using universal content for all platforms</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(template.platform_variations).map(
          ([platform, content]) => (
            <div
              key={platform}
              className="p-4 rounded-lg border-2 border-gray-200 bg-white"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    backgroundColor: PLATFORM_COLORS[platform] || "#6366F1",
                  }}
                >
                  {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] ||
                    "📱"}
                </div>
                <span className="font-semibold">{platform}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (analyticsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (!analytics || analytics.total_uses === 0) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">No analytics data yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Use this template to start tracking performance
          </p>
        </div>
      );
    }

    // Prepare pie chart data
    const platformData = Object.entries(analytics.platform_breakdown).map(
      ([platform, count]) => ({
        name: platform,
        value: count,
        color: PLATFORM_COLORS[platform] || "#6366F1",
      }),
    );

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">
                Total Uses
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {analytics.total_uses}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                Success Rate
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {analytics.success_rate}%
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">
                Avg Engagement
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {analytics.avg_engagement_rate}%
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-700 font-medium">
                Recent Posts
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {analytics.recent_posts.length}
            </p>
          </div>
        </div>

        {/* Platform Distribution */}
        {platformData.length > 0 && (
          <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
            <h4 className="font-semibold mb-4">Platform Distribution</h4>
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {platformData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.value} post{item.value !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Trend */}
        {analytics.engagement_trend.length > 0 && (
          <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
            <h4 className="font-semibold mb-4">
              Engagement Trend (Last 30 Days)
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.engagement_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="engagement_rate"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Posts */}
        {analytics.recent_posts.length > 0 && (
          <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
            <h4 className="font-semibold mb-4">Recent Posts</h4>
            <div className="space-y-3">
              {analytics.recent_posts.slice(0, 5).map((post, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{post.platform}</Badge>
                    <span className="text-xs text-gray-600">
                      {format(new Date(post.posted_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {post.shares}
                    </div>
                    <div className="ml-auto">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          post.engagement_rate > 5 &&
                            "bg-green-100 text-green-800",
                        )}
                      >
                        {post.engagement_rate}% engagement
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DialogTitle className="text-2xl">{template.name}</DialogTitle>
                {template.is_system && (
                  <Badge className="bg-blue-100 text-blue-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
                )}
                {template.is_favorite && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {template.description && (
                <p className="text-gray-600">{template.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline">
                  {template.category.replace("_", " ")}
                </Badge>
                <Badge variant="secondary">{template.tone}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {template.usage_count} uses
                </div>
                {template.success_rate > 0 && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    {template.success_rate}% success
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleFavorite(template)}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    template.is_favorite && "fill-yellow-500 text-yellow-500",
                  )}
                />
              </Button>
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(template);
                    onOpenChange(false);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  onUse(template);
                  onOpenChange(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6 pb-6">
              <TabsContent value="preview" className="mt-4 space-y-4">
                {/* Main Content Preview */}
                <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Template Content</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyContent}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {template.content_template}
                    </p>
                  </div>
                </div>

                {/* Supported Platforms */}
                <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                  <h4 className="font-semibold mb-3">Supported Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.supported_platforms.map((platform) => (
                      <div
                        key={platform}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 bg-gray-50"
                      >
                        <span className="text-lg">
                          {
                            PLATFORM_ICONS[
                              platform as keyof typeof PLATFORM_ICONS
                            ]
                          }
                        </span>
                        <span className="text-sm font-medium">{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Hashtags */}
                {template.suggested_hashtags &&
                  template.suggested_hashtags.length > 0 && (
                    <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                      <h4 className="font-semibold mb-3">Suggested Hashtags</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.suggested_hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="secondary">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Media Type */}
                {template.suggested_media_type && (
                  <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                    <h4 className="font-semibold mb-2">Suggested Media</h4>
                    <Badge variant="outline" className="capitalize">
                      {template.suggested_media_type}
                    </Badge>
                  </div>
                )}

                {/* Metadata */}
                <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                  <h4 className="font-semibold mb-3">Template Info</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium">
                        {format(new Date(template.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <p className="font-medium">
                        {format(new Date(template.updated_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    {template.last_used_at && (
                      <div>
                        <span className="text-gray-600">Last Used:</span>
                        <p className="font-medium">
                          {format(
                            new Date(template.last_used_at),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variables" className="mt-4">
                {renderVariablesList()}
              </TabsContent>

              <TabsContent value="platforms" className="mt-4">
                {renderPlatformVariations()}
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                {renderAnalytics()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
