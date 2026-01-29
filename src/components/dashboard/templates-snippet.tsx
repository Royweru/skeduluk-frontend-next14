// components/dashboard/templates-snippet.tsx
/**
 * Templates Discovery Snippet
 *
 * A small banner/card component that appears on the dashboard to
 * introduce new users to the templates feature.
 *
 * Features:
 * - Can be dismissed
 * - Shows 3 popular templates
 * - Links to templates page
 * - Remembers dismissal in localStorage
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTemplates } from "@/hooks/api/use-templates";
import { cn } from "@/lib/utils";
import { Template } from "@/types";

export function TemplatesSnippet() {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  // Fetch top 3 templates
  const { data: templatesData } = useTemplates({
    include_system: true,
    limit: 3,
    sort_by: "usage_count",
    sort_order: "desc",
  });

  const topTemplates = templatesData?.templates || [];

  // Check if user has dismissed this
  useEffect(() => {
    const isDismissed = localStorage.getItem("templates-snippet-dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("templates-snippet-dismissed", "true");
    setDismissed(true);
  };

  const handleExplore = () => {
    router.push("/dashboard/templates");
  };

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[2px]">
      <div className="relative bg-white rounded-2xl p-6">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">
                Discover Post Templates
              </h3>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                New
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Create professional content in seconds with our pre-built
              templates
            </p>
          </div>
        </div>

        {/* Popular templates preview */}
        {topTemplates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {topTemplates.map((template: Template, idx: number) => (
              <div
                key={template.id}
                className="p-3 rounded-lg border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white hover:border-purple-200 transition-all cursor-pointer group"
                onClick={handleExplore}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: template.color_scheme + "20" }}
                  >
                    {template.category === "product_launch"
                      ? "🚀"
                      : template.category === "engagement"
                        ? "💬"
                        : template.category === "promotional"
                          ? "🎁"
                          : "✨"}
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    #{idx + 1}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                  {template.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600">
                  <TrendingUp className="h-3 w-3" />
                  {template.usage_count} uses
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">
              <strong>Save Time:</strong> Pre-written content
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">
              <strong>Customizable:</strong> Fill in your details
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600 flex-shrink-0" />
            <span className="text-xs text-gray-700">
              <strong>Proven:</strong> High engagement rates
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleExplore}
          className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all"
        >
          <span>Explore Templates</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
