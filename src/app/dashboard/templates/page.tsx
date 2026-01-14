// src/app/dashboard/templates/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Star,
  Sparkles,
  Filter,
  SlidersHorizontal,
  FolderPlus,
  Folder,
  TrendingUp,
  Clock,
  Zap,
  ArrowUpDown,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { TemplateCard } from '@/components/templates/template-card';
import {
  useTemplates,
  useTemplateCategories,
  useTemplateFolders,
  useToggleFavorite,
  useDeleteTemplate
} from '@/hooks/api/use-templates';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
// Add these imports
import { TemplateDetailModal } from '@/components/templates/template-detail-modal';
import { TemplateUseModal } from '@/components/templates/template-use-modal';
import { TemplateEditorModal } from '@/components/templates/template-editor-modal';
import { FolderManager } from '@/components/templates/folder-manager';
import { Template } from '@/types';
export default function TemplatesPage() {
  // State
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Modals
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // Build search params
  const searchParams = useMemo(() => {
    const params: any = {
      query: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      is_favorite: showFavorites || undefined,
      folder_id: selectedFolder || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      include_system: activeTab === 'all' || activeTab === 'official',
      include_community: activeTab === 'all' || activeTab === 'community',
      limit: 50,
    };
    
    return params;
  }, [searchQuery, selectedCategory, showFavorites, selectedFolder, sortBy, sortOrder, activeTab]);

  // Queries
  const { data: templatesData, isLoading: templatesLoading, isError,error } = useTemplates(searchParams);
  const { data: categoriesData } = useTemplateCategories();
  const { data: folders } = useTemplateFolders();
  
  // Mutations
  const toggleFavoriteMutation = useToggleFavorite();
  const deleteTemplateMutation = useDeleteTemplate();

  const templates = templatesData?.templates || [];
  const categories = categoriesData?.categories || [];

  // Handlers
  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowUseModal(true);
  };

  const handleViewDetails = (template: Template) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditorModal(true);
  };

  const handleToggleFavorite = async (template: Template) => {
    try {
      await toggleFavoriteMutation.mutateAsync(template.id);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await deleteTemplateMutation.mutateAsync(template.id);
      } catch (error) {
        // Error handled in mutation
      }
    }
  };

  // Quick filters
  const quickFilters = [
    { id: 'all', label: 'All Templates', icon: LayoutGrid },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recently Used', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  if (isError) { 
    console.log('Error loading the templates : ', error)
  
  return (
    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-red-300">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Error Loading Templates</h3>
      <p className="text-gray-600 mb-4">
        {error?.message || 'Authentication error - please try logging in again.'}
      </p>
      <Button onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/auth/login'; }}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Login
      </Button>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600
             bg-clip-text text-transparent">
              📝 Content Templates
            </h1>
            <p className="text-gray-600 mt-1">
              Create posts faster with pre-built templates
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button
              onClick={() => {
                setSelectedTemplate(null);
                setShowEditorModal(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">
              <LayoutGrid className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="official">
              <Sparkles className="h-4 w-4 mr-2" />
              Official
            </TabsTrigger>
            <TabsTrigger value="mine">
              <Folder className="h-4 w-4 mr-2" />
              My Templates
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category.replace('_', ' ')} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Folder Filter */}
            {folders && folders.length > 0 && (
              <Select
                value={selectedFolder?.toString() || 'all'}
                onValueChange={(value:any) =>
                  setSelectedFolder(value === 'all' ? null : parseInt(value))
                }
              >
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      📁 {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="usage_count">Most Used</SelectItem>
                <SelectItem value="success_rate">Success Rate</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('grid')}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
            <Button
              variant={showFavorites ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <Star className={cn('h-3.5 w-3.5 mr-1', showFavorites && 'fill-current')} />
              Favorites
            </Button>
            {searchQuery || selectedCategory !== 'all' || selectedFolder || showFavorites ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedFolder(null);
                  setShowFavorites(false);
                }}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {templatesLoading ? (
                'Loading...'
              ) : (
                <>
                  Showing <span className="font-semibold">{templates.length}</span>{' '}
                  {templatesData?.total && templatesData.total > templates.length
                    ? `of ${templatesData.total} `
                    : ''}
                  template{templates.length !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Templates Grid/List */}
        {templatesLoading ? (
          <div className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-3'
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[280px] rounded-xl" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full 
            flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first template to get started'}
            </p>
            <Button
              onClick={() => {
                setSelectedTemplate(null);
                setShowEditorModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-3'
            )}
          >
            {templates.map((template:any) => (
              <TemplateCard
                key={template.id}
                template={template}
                view={view}
                onUse={handleUseTemplate}
                onEdit={template.is_system ? undefined : handleEditTemplate}
                onDelete={template.is_system ? undefined : handleDeleteTemplate}
                onViewDetails={handleViewDetails}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {templatesData?.total && templatesData.total > templates.length && (
          <div className="flex justify-center pt-6">
            <Button variant="outline" size="lg">
              Load More Templates
            </Button>
          </div>
        )}
      </div>

     {/* Template Detail Modal */}
<TemplateDetailModal
  template={selectedTemplate}
  open={showDetailModal}
  onOpenChange={setShowDetailModal}
  onUse={handleUseTemplate}
  onEdit={handleEditTemplate}
  onToggleFavorite={handleToggleFavorite}
/>

{/* Template Use Modal */}
<TemplateUseModal
  template={selectedTemplate}
  open={showUseModal}
  onOpenChange={setShowUseModal}
  onSuccess={() => {
    toast.success('Post created from template!');
  }}
/>

{/* Template Editor Modal */}
<TemplateEditorModal
  template={selectedTemplate}
  open={showEditorModal}
  onOpenChange={setShowEditorModal}
  onSuccess={() => {
    // Refresh templates list
  }}
/>

{/* Folder Manager */}
<FolderManager
  open={showCreateFolder}
  onOpenChange={setShowCreateFolder}
/>
    </div>
  );
}