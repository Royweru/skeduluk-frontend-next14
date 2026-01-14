// src/components/templates/template-editor-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  X,
  Save,
  Eye,
  Sparkles,
  Info,
  AlertCircle,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
 
  useCreateTemplate,
  useUpdateTemplate,
} from '@/hooks/api/use-templates';
import toast from 'react-hot-toast';
import { Template, TemplateVariable } from '@/types';
interface TemplateEditorModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'product_launch', label: '🚀 Product Launch', emoji: '🚀' },
  { value: 'event_promotion', label: '📅 Event Promotion', emoji: '📅' },
  { value: 'blog_post', label: '📝 Blog Post', emoji: '📝' },
  { value: 'engagement', label: '💬 Engagement', emoji: '💬' },
  { value: 'educational', label: '💡 Educational', emoji: '💡' },
  { value: 'promotional', label: '🎁 Promotional', emoji: '🎁' },
  { value: 'seasonal', label: '🎄 Seasonal', emoji: '🎄' },
  { value: 'announcement', label: '📢 Announcement', emoji: '📢' },
  { value: 'behind_scenes', label: '🎬 Behind the Scenes', emoji: '🎬' },
  { value: 'user_generated', label: '📸 User Generated', emoji: '📸' },
  { value: 'testimonial', label: '⭐ Testimonial', emoji: '⭐' },
  { value: 'inspirational', label: '✨ Inspirational', emoji: '✨' },
];

const TONES = [
  { value: 'professional', label: '💼 Professional' },
  { value: 'casual', label: '😊 Casual' },
  { value: 'humorous', label: '😄 Humorous' },
  { value: 'inspirational', label: '🚀 Inspirational' },
  { value: 'educational', label: '📚 Educational' },
  { value: 'urgent', label: '⚡ Urgent' },
  { value: 'friendly', label: '👋 Friendly' },
  { value: 'engaging', label: '✨ Engaging' },
];

const PLATFORMS = [
  { id: 'TWITTER', name: 'Twitter/X', icon: '𝕏' },
  { id: 'FACEBOOK', name: 'Facebook', icon: '📘' },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: '💼' },
  { id: 'INSTAGRAM', name: 'Instagram', icon: '📷' },
  { id: 'TIKTOK', name: 'TikTok', icon: '🎵' },
  { id: 'YOUTUBE', name: 'YouTube', icon: '▶️' },
];

const VARIABLE_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'hashtags', label: 'Hashtags' },
  { value: 'url', label: 'URL' },
];

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  template,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const isEditMode = !!template;

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('engagement');
  const [contentTemplate, setContentTemplate] = useState('');
  const [tone, setTone] = useState('engaging');
  const [colorScheme, setColorScheme] = useState('#3B82F6');
  const [isPublic, setIsPublic] = useState(false);
  
  // Platform Selection
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // Variables
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  
  // Platform Variations
  const [platformVariations, setPlatformVariations] = useState<Record<string, string>>({});
  const [editingVariation, setEditingVariation] = useState<string | null>(null);
  
  // Hashtags
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  
  // Media Type
  const [suggestedMediaType, setSuggestedMediaType] = useState<string>('');
  
  // UI State
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'variables' | 'platforms' | 'advanced'>('basic');

  // Mutations
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setCategory(template.category);
      setContentTemplate(template.content_template);
      setTone(template.tone);
      setColorScheme(template.color_scheme);
      setIsPublic(template.is_public);
      setSelectedPlatforms(template.supported_platforms);
      setVariables(template.variables || []);
      setPlatformVariations(template.platform_variations || {});
      setHashtags(template.suggested_hashtags || []);
      setSuggestedMediaType(template.suggested_media_type || '');
    } else {
      // Reset form for new template
      setName('');
      setDescription('');
      setCategory('engagement');
      setContentTemplate('');
      setTone('engaging');
      setColorScheme('#3B82F6');
      setIsPublic(false);
      setSelectedPlatforms(['TWITTER', 'FACEBOOK', 'LINKEDIN']);
      setVariables([]);
      setPlatformVariations({});
      setHashtags([]);
      setSuggestedMediaType('');
    }
  }, [template]);

  // Handlers
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      name: `variable_${variables.length + 1}`,
      label: 'New Variable',
      type: 'text',
      placeholder: 'Enter value...',
      required: true,
    };
    setVariables([...variables, newVariable]);
  };

  const updateVariable = (index: number, field: keyof TemplateVariable, value: any) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#')
        ? hashtagInput.trim()
        : `#${hashtagInput.trim()}`;
      
      if (!hashtags.includes(tag)) {
        setHashtags([...hashtags, tag]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const insertVariableIntoContent = (variableName: string) => {
    const cursorPosition = (document.getElementById('content-template') as HTMLTextAreaElement)?.selectionStart || contentTemplate.length;
    const before = contentTemplate.substring(0, cursorPosition);
    const after = contentTemplate.substring(cursorPosition);
    setContentTemplate(`${before}{${variableName}}${after}`);
  };

  // Generate preview
  const generatePreview = () => {
    let preview = contentTemplate;
    variables.forEach((variable) => {
      preview = preview.replace(
        new RegExp(`\\{${variable.name}\\}`, 'g'),
        `[${variable.label}]`
      );
    });
    return preview;
  };

  // Validation
  const isValid = () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return false;
    }
    if (!contentTemplate.trim()) {
      toast.error('Please enter template content');
      return false;
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return false;
    }

    // Check for undefined variables in content
    const variablesInContent = contentTemplate.match(/\{(\w+)\}/g) || [];
    const definedVariableNames = variables.map((v) => `{${v.name}}`);
    const undefinedVars = variablesInContent.filter(
      (v) => !definedVariableNames.includes(v)
    );

    if (undefinedVars.length > 0) {
      toast.error(`Undefined variables: ${undefinedVars.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isValid()) return;

    const templateData = {
      name,
      description,
      category,
      content_template: contentTemplate,
      variables: variables.length > 0 ? variables : undefined,
      platform_variations: Object.keys(platformVariations).length > 0 ? platformVariations : undefined,
      supported_platforms: selectedPlatforms,
      tone,
      suggested_hashtags: hashtags.length > 0 ? hashtags : undefined,
      suggested_media_type: suggestedMediaType || undefined,
      is_public: isPublic,
      color_scheme: colorScheme,
      icon: CATEGORIES.find((c) => c.value === category)?.emoji || '📄',
    };

    try {
      if (isEditMode && template) {
        await updateMutation.mutateAsync({
          id: template.id,
          data: templateData,
        });
      } else {
        await createMutation.mutateAsync(templateData);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">
            {isEditMode ? `Edit Template: ${template.name}` : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r bg-gray-50 p-4">
            <nav className="space-y-2">
              {[
                { id: 'basic', label: 'Basic Info', icon: '📝' },
                { id: 'variables', label: 'Variables', icon: '🔤' },
                { id: 'platforms', label: 'Platforms', icon: '🌐' },
                { id: 'advanced', label: 'Advanced', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-900 font-semibold'
                      : 'hover:bg-gray-200'
                  )}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Preview Button */}
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1 px-6 py-4">
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="mb-2 flex items-center gap-2">
                    Template Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Product Launch Announcement"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="mb-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of when to use this template..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="mb-2">
                    Category *
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div>
                  <Label htmlFor="tone" className="mb-2">
                    Tone *
                  </Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Template */}
                <div>
                  <Label htmlFor="content-template" className="mb-2 flex items-center gap-2">
                    Content Template *
                  </Label>
                  <Textarea
                    id="content-template"
                    placeholder="Write your template here. Use {variable_name} for dynamic content..."
                    value={contentTemplate}
                    onChange={(e) => setContentTemplate(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    <Info className="h-3 w-3 inline mr-1" />
                    Use {'{'}curly braces{'}'} to insert variables. Example: {'{'}product_name{'}'}
                  </p>
                </div>

                {/* Variable Quick Insert */}
                {variables.length > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-medium mb-2">Quick Insert Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable) => (
                        <Button
                          key={variable.name}
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariableIntoContent(variable.name)}
                        >
                          {'{'}
                          {variable.name}
                          {'}'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {showPreview && (
                  <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                    <p className="text-sm font-semibold mb-2">Preview:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {generatePreview()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VARIABLES TAB */}
            {activeTab === 'variables' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Template Variables</h3>
                    <p className="text-sm text-gray-600">
                      Define variables that users will fill when using this template
                    </p>
                  </div>
                  <Button onClick={addVariable} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>

                {variables.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Info className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-4">No variables defined</p>
                    <Button onClick={addVariable} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Variable
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variables.map((variable, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border-2 border-gray-200 bg-white space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm font-semibold">
                              Variable #{index + 1}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariable(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Variable Name *</Label>
                            <Input
                              placeholder="e.g., product_name"
                              value={variable.name}
                              onChange={(e) =>
                                updateVariable(index, 'name', e.target.value)
                              }
                              className="font-mono text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={variable.type}
                              onValueChange={(value) =>
                                updateVariable(index, 'type', value)
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {VARIABLE_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-2">
                            <Label className="text-xs">Label *</Label>
                            <Input
                              placeholder="e.g., Product Name"
                              value={variable.label}
                              onChange={(e) =>
                                updateVariable(index, 'label', e.target.value)
                              }
                            />
                          </div>

                          <div className="col-span-2">
                            <Label className="text-xs">Placeholder</Label>
                            <Input
                              placeholder="Example value..."
                              value={variable.placeholder}
                              onChange={(e) =>
                                updateVariable(index, 'placeholder', e.target.value)
                              }
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-between">
                            <Label className="text-xs">Required</Label>
                            <Switch
                              checked={variable.required}
                              onCheckedChange={(checked) =>
                                updateVariable(index, 'required', checked)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PLATFORMS TAB */}
            {activeTab === 'platforms' && (
              <div className="space-y-6">
                {/* Platform Selection */}
                <div>
                  <Label className="mb-3 block text-lg font-semibold">
                    Supported Platforms *
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all',
                          selectedPlatforms.includes(platform.id)
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">{platform.icon}</span>
                          <span className="text-sm font-medium">{platform.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform-Specific Variations */}
                <div>
                  <Label className="mb-3 block text-lg font-semibold">
                    Platform Variations (Optional)
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Create customized content for specific platforms. Leave empty to use the
                    universal template.
                  </p>

                  <div className="space-y-3">
                    {selectedPlatforms.map((platformId) => {
                      const platform = PLATFORMS.find((p) => p.id === platformId);
                      if (!platform) return null;

                      return (
                        <div
                          key={platformId}
                          className="p-4 rounded-lg border-2 border-gray-200 bg-white"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{platform.icon}</span>
                              <span className="font-semibold">{platform.name}</span>
                            </div>
                            {platformVariations[platformId] && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = { ...platformVariations };
                                  delete updated[platformId];
                                  setPlatformVariations(updated);
                                }}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>

                          <Textarea
                            placeholder={`Custom content for ${platform.name} (optional)...`}
                            value={platformVariations[platformId] || ''}
                            onChange={(e) =>
                              setPlatformVariations({
                                ...platformVariations,
                                [platformId]: e.target.value,
                              })
                            }
                            className="min-h-[100px] text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                {/* Suggested Hashtags */}
                <div>
                  <Label className="mb-3 block text-lg font-semibold">
                    Suggested Hashtags
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add hashtag..."
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addHashtag();
                        }
                      }}
                    />
                    <Button onClick={addHashtag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1 cursor-pointer hover:bg-red-100"
                          onClick={() => removeHashtag(index)}
                        >
                          {tag}
                          <X className="h-3 w-3 ml-2" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Media Type */}
                <div>
                  <Label className="mb-3 block text-lg font-semibold">
                    Suggested Media Type
                  </Label>
                  <Select
                    value={suggestedMediaType}
                    onValueChange={setSuggestedMediaType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Scheme */}
                <div>
                  <Label className="mb-3 block text-lg font-semibold">
                    Color Scheme
                  </Label>
                  <div className="flex gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setColorScheme(color)}
                        className={cn(
                          'w-10 h-10 rounded-lg transition-all',
                          colorScheme === color && 'ring-4 ring-offset-2 ring-blue-500'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <Input
                      type="color"
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      className="w-10 h-10 p-0 border-0"
                    />
                  </div>
                </div>

                {/* Public Template */}
                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-white">
                  <div>
                    <p className="font-medium">Public Template</p>
                    <p className="text-sm text-gray-600">
                      Allow other users to discover and use this template
                    </p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Template' : 'Create Template'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};