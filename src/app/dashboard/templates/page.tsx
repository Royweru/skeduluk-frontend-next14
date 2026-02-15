// app/dashboard/templates/page.tsx
/**
 * Templates Page
 *
 * This page displays all available templates and allows users to:
 * 1. Browse templates by category, search, filter
 * 2. View template details
 * 3. Click "Use Template" which:
 *    - Opens the template variables modal
 *    - User fills in variables
 *    - Opens the post creator modal with pre-filled content
 *    - User customizes and publishes the post
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Folder,
  Grid3x3,
  List,
  Star,
  Sparkles,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateDetailModal } from "@/components/templates/template-detail-modal";
import { TemplateVariablesModal } from "@/components/modals/template-variables-modal";
import { PostCreatorModal } from "@/components/modals/post-creaor-modal";
import { FolderManager } from "@/components/templates/folder-manager";
import {
  useTemplates,
  useTemplateCategories,
  useToggleFavorite,
  useDeleteTemplate,
} from "@/hooks/api/use-templates";
import { useSocialConnections } from "@/hooks/api/use-social-connections";
import { useTemplateCreator } from "@/hooks/use-template-creator";
import { Template } from "@/types";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Video,
} from "lucide-react";

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

export default function TemplatesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTone, setSelectedTone] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFolderManager, setShowFolderManager] = useState(false);

  // Template modals
  const [selectedTemplateForDetails, setSelectedTemplateForDetails] =
    useState<Template | null>(null);
  const [selectedTemplateForUse, setSelectedTemplateForUse] =
    useState<Template | null>(null);

  // Post creator modal
  const { showPostCreator, setShowPostCreator } = useTemplateCreator();

  // Queries
  const { data: templatesData, isLoading } = useTemplates({
    query: searchQuery || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    tone: selectedTone !== "all" ? selectedTone : undefined,
    include_system: true,
    include_community: false,
  });

  const { data: categoriesData } = useTemplateCategories();
  const { connections } = useSocialConnections();
  const toggleFavoriteMutation = useToggleFavorite();
  const deleteTemplateMutation = useDeleteTemplate();

  // Connected platforms
  const connectedPlatforms =
    connections?.map((c: any) => c.platform.toLowerCase()) || [];

  const templates = templatesData?.templates || [];

  // Handlers
  const handleUseTemplate = (template: Template) => {
    setSelectedTemplateForUse(template);
  };

  const handleContinueToPostCreator = () => {
    setSelectedTemplateForUse(null);
    setShowPostCreator(true);
  };

  const handleViewDetails = (template: Template) => {
    setSelectedTemplateForDetails(template);
  };

  const handleToggleFavorite = async (template: Template) => {
    try {
      await toggleFavoriteMutation.mutateAsync(template.id);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      await deleteTemplateMutation.mutateAsync(template.id);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const categories = categoriesData?.categories || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Post Templates
            </h1>
            <p className="text-gray-600 mt-1">
              Professional templates to create engaging content faster
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFolderManager(true)}
              variant="outline"
              className="gap-2"
            >
              <Folder className="h-4 w-4" />
              Manage Folders
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">
                Total Templates
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {templates.length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-900">
                Favorites
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {templates.filter((t: any) => t.is_favorite).length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-900">
                System Templates
              </span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {templates.filter((t: any) => t.is_system).length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Grid3x3 className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-900">
                My Templates
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-700">
              {templates.filter((t: any) => !t.is_system).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.category} value={cat.category}>
                {cat.category.replace("_", " ")} ({cat.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tone */}
        <Select value={selectedTone} onValueChange={setSelectedTone}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tones</SelectItem>
            <SelectItem value="engaging">Engaging</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="humorous">Humorous</SelectItem>
            <SelectItem value="inspirational">Inspirational</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode */}
        <div className="flex gap-1 border-2 border-gray-200 rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Templates Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No templates found
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Try adjusting your filters or create a new template
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {templates.map((template: Template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
              onViewDetails={handleViewDetails}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteTemplate}
              view={viewMode}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TemplateDetailModal
        template={selectedTemplateForDetails}
        open={!!selectedTemplateForDetails}
        onOpenChange={(open) => !open && setSelectedTemplateForDetails(null)}
        onUse={handleUseTemplate}
        onToggleFavorite={handleToggleFavorite}
        onEdit={() => {}}
      />

      <TemplateVariablesModal
        template={selectedTemplateForUse}
        open={!!selectedTemplateForUse}
        onOpenChange={(open) => !open && setSelectedTemplateForUse(null)}
        onContinueToPostCreator={handleContinueToPostCreator}
      />

      <PostCreatorModal
        isOpen={showPostCreator}
        onClose={() => setShowPostCreator(false)}
        platforms={PLATFORMS}
        connectedPlatforms={connectedPlatforms}
      />

      <FolderManager
        open={showFolderManager}
        onOpenChange={setShowFolderManager}
      />
    </div>
  );
}
