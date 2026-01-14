// src/components/templates/template-use-modal.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Zap,
  Eye,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUseTemplate } from '@/hooks/api/use-templates';
import { Template } from '@/types';
import { useSocialConnections } from '@/hooks/api/use-social-connections';
import toast from 'react-hot-toast';

interface TemplateUseModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PLATFORM_ICONS = {
  TWITTER: '𝕏',
  FACEBOOK: '📘',
  LINKEDIN: '💼',
  INSTAGRAM: '📷',
  TIKTOK: '🎵',
  YOUTUBE: '▶️',
};

export const TemplateUseModal: React.FC<TemplateUseModalProps> = ({
  template,
  open,
  onOpenChange,
  onSuccess,
}) => {
  // State
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [useAiEnhancement, setUseAiEnhancement] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Queries & Mutations
  const { connections } = useSocialConnections();
  const useTemplateMutation = useUseTemplate();

  // Connected platforms
  const connectedPlatforms = useMemo(
    () => connections?.map((c: any) => c.platform.toUpperCase()) || [],
    [connections]
  );

  // Available platforms (connected AND supported by template)
  const availablePlatforms = useMemo(
    () =>
      template?.supported_platforms.filter((p) =>
        connectedPlatforms.includes(p)
      ) || [],
    [template, connectedPlatforms]
  );

  // Initialize on template change
  useEffect(() => {
    if (template) {
      // Set default values for variables
      const defaults: Record<string, string> = {};
      template.variables?.forEach((variable) => {
        if (variable.default_value) {
          defaults[variable.name] = variable.default_value;
        }
      });
      setVariableValues(defaults);

      // Select all available platforms by default
      setSelectedPlatforms(availablePlatforms);
    }
  }, [template, availablePlatforms]);

  if (!template) return null;

  // Generate preview content
// Around line 101
const previewContent = useMemo(() => {
  // ✅ Guard clause at the START of useMemo
  if (!template) return '';
  
  let content = template.content_template;

  // Replace variables
  Object.entries(variableValues).forEach(([key, value]) => {
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`);
  });

  return content;
}, [template, variableValues]);

  // Check if all required variables are filled
  const isFormValid = useMemo(() => {
    if (selectedPlatforms.length === 0) return false;

    const requiredVariables = template.variables?.filter((v) => v.required) || [];
    return requiredVariables.every(
      (variable:any) => variableValues[variable.name]?.trim()
    );
  }, [template, variableValues, selectedPlatforms]);

  // Get missing variables
  const missingVariables = useMemo(() => {
    const required = template.variables?.filter((v: any) => v.required) || [];
    return required.filter((variable:any) => !variableValues[variable.name]?.trim());
  }, [template, variableValues]);

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await useTemplateMutation.mutateAsync({
        id: template.id,
        data: {
          template_id: template.id,
          variable_values: variableValues,
          platforms: selectedPlatforms,
          scheduled_for: scheduledDate || undefined,
          use_ai_enhancement: useAiEnhancement,
        },
      });

      // Reset form
      setVariableValues({});
      setSelectedPlatforms([]);
      setScheduledDate('');
      setUseAiEnhancement(false);
      setShowPreview(false);

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Use Template: {template.name}</DialogTitle>
          <p className="text-gray-600 text-sm mt-1">
            Fill in the variables below to create your post
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Platform Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Select Platforms *
              </Label>
              
              {availablePlatforms.length === 0 ? (
                <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        No platforms available
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Please connect at least one of the supported platforms: {' '}
                        {template.supported_platforms.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {template.supported_platforms.map((platform) => {
                    const isConnected = connectedPlatforms.includes(platform);
                    const isSelected = selectedPlatforms.includes(platform);

                    return (
                      <button
                        key={platform}
                        onClick={() => isConnected && togglePlatform(platform)}
                        disabled={!isConnected}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all',
                          !isConnected && 'opacity-50 cursor-not-allowed',
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl">
                            {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}
                          </span>
                          <span className="text-sm font-medium">{platform}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                          {!isConnected && (
                            <span className="text-xs text-red-600">Not connected</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Variables */}
            {template.variables && template.variables.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Template Variables
                </Label>
                <div className="space-y-4">
                  {template.variables.map((variable) => (
                    <div key={variable.name}>
                      <Label htmlFor={variable.name} className="mb-2 flex items-center gap-2">
                        {variable.label}
                        {variable.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </Label>

                      {variable.type === 'text' || variable.type === 'url' ? (
                        variable.placeholder.length > 50 ? (
                          <Textarea
                            id={variable.name}
                            placeholder={variable.placeholder}
                            value={variableValues[variable.name] || ''}
                            onChange={(e) =>
                              handleVariableChange(variable.name, e.target.value)
                            }
                            className="min-h-[100px]"
                          />
                        ) : (
                          <Input
                            id={variable.name}
                            type={variable.type === 'url' ? 'url' : 'text'}
                            placeholder={variable.placeholder}
                            value={variableValues[variable.name] || ''}
                            onChange={(e) =>
                              handleVariableChange(variable.name, e.target.value)
                            }
                          />
                        )
                      ) : variable.type === 'date' ? (
                        <Input
                          id={variable.name}
                          type="date"
                          value={variableValues[variable.name] || ''}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                        />
                      ) : variable.type === 'number' ? (
                        <Input
                          id={variable.name}
                          type="number"
                          placeholder={variable.placeholder}
                          value={variableValues[variable.name] || ''}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                        />
                      ) : variable.type === 'hashtags' ? (
                        <Input
                          id={variable.name}
                          placeholder={variable.placeholder}
                          value={variableValues[variable.name] || ''}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                        />
                      ) : (
                        <Input
                          id={variable.name}
                          placeholder={variable.placeholder}
                          value={variableValues[variable.name] || ''}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Preview</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>

              {showPreview && (
                <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {previewContent}
                  </p>
                  
                  {/* Show unfilled variables */}
                  {previewContent.includes('{') && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="flex items-start gap-2 text-xs text-amber-700">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Variables in {'{'}curly braces{'}'} will be filled when you complete the form above
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* AI Enhancement */}
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-white">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">AI Enhancement</p>
                    <p className="text-sm text-gray-600">
                      Optimize content for each platform using AI
                    </p>
                  </div>
                </div>
                <Switch
                  checked={useAiEnhancement}
                  onCheckedChange={setUseAiEnhancement}
                />
              </div>

              {/* Schedule */}
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <Label className="font-medium">Schedule Post (Optional)</Label>
                </div>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {scheduledDate && (
                  <p className="text-xs text-gray-600 mt-2">
                    Post will be published on{' '}
                    {new Date(scheduledDate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Validation Messages */}
            {missingVariables.length > 0 && (
              <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      Missing required fields:
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      {missingVariables.map((variable) => (
                        <li key={variable.name}>• {variable.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || useTemplateMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {useTemplateMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {scheduledDate ? 'Schedule Post' : 'Create Post'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};