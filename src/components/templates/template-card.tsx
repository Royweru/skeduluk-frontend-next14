// src/components/templates/template-card.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Star,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  Edit,
  BarChart3,
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import { Template } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onViewDetails: (template: Template) => void;
  onToggleFavorite: (template: Template) => void;
  view?: 'grid' | 'list';
}

const PLATFORM_ICONS = {
  TWITTER: '𝕏',
  FACEBOOK: '📘',
  LINKEDIN: '💼',
  INSTAGRAM: '📷',
  TIKTOK: '🎵',
  YOUTUBE: '▶️',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  product_launch: '🚀',
  event_promotion: '📅',
  blog_post: '📝',
  engagement: '💬',
  educational: '💡',
  promotional: '🎁',
  seasonal: '🎄',
  announcement: '📢',
  behind_scenes: '🎬',
  user_generated: '📸',
  testimonial: '⭐',
  inspirational: '✨',
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUse,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleFavorite,
  view = 'grid',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const canEdit = !template.is_system;
  const categoryEmoji = CATEGORY_EMOJIS[template.category] || '📄';

  if (view === 'list') {
    return (
      <Card
        className="border-2 hover:border-blue-300 transition-all hover:shadow-md bg-white cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewDetails(template)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: template.color_scheme + '20' }}
            >
              {categoryEmoji}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate">
                    {template.name}
                  </h3>
                  {template.is_system && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-700"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Official
                    </Badge>
                  )}
                  {template.is_favorite && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {template.usage_count}
                    </div>
                    {template.success_rate > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        {template.success_rate}%
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUse(template);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Use
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(template)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleFavorite(template)}>
                        <Star
                          className={cn(
                            'h-4 w-4 mr-2',
                            template.is_favorite && 'fill-yellow-500 text-yellow-500'
                          )}
                        />
                        {template.is_favorite ? 'Unfavorite' : 'Favorite'}
                      </DropdownMenuItem>
                      {canEdit && onEdit && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete?.(template)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                            <span className="text-red-600">Delete</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                  {template.description}
                </p>
              )}

              {/* Platforms & Category */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {template.category.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-1">
                  {template.supported_platforms.slice(0, 4).map((platform:string) => (
                    <span key={platform} className="text-sm" title={platform}>
                      {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}
                    </span>
                  ))}
                  {template.supported_platforms.length > 4 && (
                    <span className="text-xs text-gray-600">
                      +{template.supported_platforms.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className={cn(
        'group border-2 hover:border-blue-300 transition-all hover:shadow-lg bg-white cursor-pointer relative overflow-hidden',
        isHovered && 'scale-[1.02]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(template)}
    >
      {/* Gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(to right, ${template.color_scheme}, ${template.color_scheme}99)`,
        }}
      />

      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: template.color_scheme + '20' }}
          >
            {categoryEmoji}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(template);
              }}
              className="h-8 w-8 p-0"
            >
              <Star
                className={cn(
                  'h-4 w-4 transition-all',
                  template.is_favorite
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-gray-400 hover:text-yellow-500'
                )}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(template)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFavorite(template)}>
                  <Star
                    className={cn(
                      'h-4 w-4 mr-2',
                      template.is_favorite && 'fill-yellow-500 text-yellow-500'
                    )}
                  />
                  {template.is_favorite ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
                {canEdit && onEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(template)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(template)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title & Badges */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base line-clamp-1">
              {template.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {template.is_system && (
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-700"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Official
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {template.category.replace('_', ' ')}
            </Badge>
          </div>

          {template.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>

        {/* Platforms */}
        <div className="flex items-center gap-1 mb-3">
          {template.supported_platforms.slice(0, 5).map((platform:string) => (
            <div
              key={platform}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-sm"
              title={platform}
            >
              {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}
            </div>
          ))}
          {template.supported_platforms.length > 5 && (
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-600">
              +{template.supported_platforms.length - 5}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3 pb-3 border-b">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{template.usage_count} uses</span>
          </div>
          {template.success_rate > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <span>{template.success_rate}% success</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onUse(template);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Zap className="h-4 w-4 mr-2" />
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};