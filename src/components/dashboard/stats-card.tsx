// components/dashboard/stats-card.tsx
/**
 * Reusable Stats Card Component
 *
 * A small, focused component for displaying a single stat on the dashboard.
 * This promotes code reusability and makes the dashboard more maintainable.
 */

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  colorScheme?: "blue" | "purple" | "green" | "amber" | "red" | "pink";
  loading?: boolean;
}

const colorSchemes = {
  blue: {
    bg: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    icon: "text-blue-600",
    value: "text-blue-700",
    trend: {
      positive: "text-green-600 bg-green-50",
      negative: "text-red-600 bg-red-50",
    },
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    border: "border-purple-200",
    icon: "text-purple-600",
    value: "text-purple-700",
    trend: {
      positive: "text-green-600 bg-green-50",
      negative: "text-red-600 bg-red-50",
    },
  },
  green: {
    bg: "from-green-50 to-green-100",
    border: "border-green-200",
    icon: "text-green-600",
    value: "text-green-700",
    trend: {
      positive: "text-green-600 bg-green-50",
      negative: "text-red-600 bg-red-50",
    },
  },
  amber: {
    bg: "from-amber-50 to-amber-100",
    border: "border-amber-200",
    icon: "text-amber-600",
    value: "text-amber-700",
    trend: {
      positive: "text-green-600 bg-green-50",
      negative: "text-red-600 bg-red-50",
    },
  },
  red: {
    bg: "from-red-50 to-red-100",
    border: "border-red-200",
    icon: "text-red-600",
    value: "text-red-700",
    trend: {
      positive: "text-green-600 bg-green-50",
      negative: "text-red-600 bg-red-50",
    },
  },
  pink: {
    bg: "from-pink-50 to-pink-100",
    border: "border-pink-200",
    icon: "text-pink-600",
    value: "text-pink-700",
    trend: {
      positive: "text-green-600 bg-green-50",
      negative: "text-red-600 bg-red-50",
    },
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  colorScheme = "blue",
  loading = false,
}: StatsCardProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-gradient-to-br border-2 transition-all hover:shadow-md",
        colors.bg,
        colors.border,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "p-2 rounded-lg bg-white/70 backdrop-blur-sm shadow-sm",
            colors.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {trend && (
          <div
            className={cn(
              "px-2 py-1 rounded-full text-xs font-semibold",
              trend.value >= 0 ? colors.trend.positive : colors.trend.negative,
            )}
          >
            {trend.value > 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-700 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-white/50 animate-pulse rounded" />
        ) : (
          <p className={cn("text-2xl font-bold", colors.value)}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
        {trend && (
          <p className="text-[10px] text-gray-600 mt-1">{trend.label}</p>
        )}
      </div>
    </div>
  );
}
