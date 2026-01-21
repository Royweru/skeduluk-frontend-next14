// src/components/analytics/ai-suggestions-panel.tsx
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  RefreshCw,
  Clock,
  Target,
  Hash,
  TrendingUp,
  Users,
  MessageCircle,
  ChevronRight,
  Lightbulb,
  Zap,
} from "lucide-react";
import {
  useAISuggestions,
  useRefreshAISuggestions,
} from "@/hooks/api/use-analytics";
import { cn } from "@/lib/utils";
import type { AISuggestion } from "@/lib/api";

const CATEGORY_CONFIG: Record<
  string,
  { icon: any; color: string; bgColor: string }
> = {
  timing: { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100" },
  content: {
    icon: MessageCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  hashtags: { icon: Hash, color: "text-green-600", bgColor: "bg-green-100" },
  platform: {
    icon: Target,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  engagement: {
    icon: TrendingUp,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  growth: { icon: Users, color: "text-teal-600", bgColor: "bg-teal-100" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: {
    label: "High Priority",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  low: { label: "Low", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

interface AISuggestionsPanelProps {
  days?: number;
  className?: string;
  compact?: boolean;
}

export function AISuggestionsPanel({
  days = 30,
  className,
  compact = false,
}: AISuggestionsPanelProps) {
  const { data, isLoading, error, refetch } = useAISuggestions(days);
  const refreshMutation = useRefreshAISuggestions();
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(
    null,
  );

  const handleRefresh = async () => {
    await refreshMutation.mutateAsync(days);
    refetch();
  };

  if (isLoading) {
    return (
      <Card
        className={cn(
          "border-0 shadow-md bg-white/80 backdrop-blur",
          className,
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Suggestions</CardTitle>
              <CardDescription>Loading insights...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card
        className={cn(
          "border-0 shadow-md bg-white/80 backdrop-blur",
          className,
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">AI Suggestions</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Unable to load suggestions</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const suggestions = data.suggestions || [];

  return (
    <Card
      className={cn("border-0 shadow-md bg-white/80 backdrop-blur", className)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                AI Suggestions
                <Badge variant="secondary" className="text-xs font-normal">
                  <Zap className="h-3 w-3 mr-1" />
                  {suggestions.length} tips
                </Badge>
              </CardTitle>
              <CardDescription>
                Based on {data.analyzed_posts} posts analyzed
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                refreshMutation.isPending && "animate-spin",
              )}
            />
          </Button>
        </div>

        {data.best_performing_platform && (
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Best Platform:{" "}
                <span className="font-bold">
                  {data.best_performing_platform}
                </span>
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className={compact ? "h-[300px]" : "h-[400px]"}>
          <div className="space-y-3 pr-4">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                isExpanded={expandedSuggestion === index}
                onToggle={() =>
                  setExpandedSuggestion(
                    expandedSuggestion === index ? null : index,
                  )
                }
                compact={compact}
              />
            ))}

            {suggestions.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Publish more posts to get personalized suggestions
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
  isExpanded: boolean;
  onToggle: () => void;
  compact?: boolean;
}

function SuggestionCard({
  suggestion,
  isExpanded,
  onToggle,
  compact,
}: SuggestionCardProps) {
  const categoryConfig =
    CATEGORY_CONFIG[suggestion.category] || CATEGORY_CONFIG.engagement;
  const priorityConfig =
    PRIORITY_CONFIG[suggestion.priority] || PRIORITY_CONFIG.medium;
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all cursor-pointer hover:shadow-md",
        isExpanded ? "bg-white shadow-md" : "bg-white/50 hover:bg-white",
      )}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-lg flex-shrink-0",
              categoryConfig.bgColor,
            )}
          >
            <CategoryIcon className={cn("h-4 w-4", categoryConfig.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                {suggestion.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    priorityConfig.color,
                  )}
                >
                  {priorityConfig.label}
                </Badge>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform",
                    isExpanded && "rotate-90",
                  )}
                />
              </div>
            </div>

            <p
              className={cn(
                "text-xs text-gray-600",
                !isExpanded && "line-clamp-2",
              )}
            >
              {suggestion.description}
            </p>

            {isExpanded &&
              suggestion.action_items &&
              suggestion.action_items.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Action Items:
                  </p>
                  <ul className="space-y-1">
                    {suggestion.action_items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
