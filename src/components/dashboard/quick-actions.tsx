// components/dashboard/quick-actions.tsx
/**
 * Quick Actions Component
 *
 * Provides quick access to common actions from the dashboard.
 * Small, focused component that promotes user engagement.
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  FileText,
  BarChart3,
  Link as LinkIcon,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onCreatePost: () => void;
  onViewCalendar: () => void;
  onViewTemplates: () => void;
  onViewAnalytics: () => void;
  onConnectPlatform: () => void;
}

const actions = [
  {
    id: "create-post",
    label: "Create Post",
    icon: Plus,
    color: "from-blue-600 to-purple-600",
    description: "Compose new content",
  },
  {
    id: "use-template",
    label: "Use Template",
    icon: FileText,
    color: "from-purple-600 to-pink-600",
    description: "Start from a template",
  },
  {
    id: "view-calendar",
    label: "Calendar",
    icon: Calendar,
    color: "from-green-600 to-teal-600",
    description: "Schedule & manage posts",
  },
  {
    id: "view-analytics",
    label: "Analytics",
    icon: BarChart3,
    color: "from-amber-600 to-orange-600",
    description: "Track performance",
  },
  {
    id: "connect-platform",
    label: "Connect Platform",
    icon: LinkIcon,
    color: "from-pink-600 to-red-600",
    description: "Add social accounts",
  },
];

export function QuickActions({
  onCreatePost,
  onViewCalendar,
  onViewTemplates,
  onViewAnalytics,
  onConnectPlatform,
}: QuickActionsProps) {
  const handlers: Record<string, () => void> = {
    "create-post": onCreatePost,
    "use-template": onViewTemplates,
    "view-calendar": onViewCalendar,
    "view-analytics": onViewAnalytics,
    "connect-platform": onConnectPlatform,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <Zap className="h-5 w-5 text-purple-600" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={handlers[action.id]}
              className="group relative p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all hover:shadow-lg overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
                  action.color,
                )}
              />

              {/* Content */}
              <div className="relative flex flex-col items-center gap-2 text-center">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform",
                    action.color,
                  )}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
