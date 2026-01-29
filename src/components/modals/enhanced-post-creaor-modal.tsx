// components/post-creator/enhanced-post-creator-modal.tsx
/**
 * Enhanced Post Creator Modal
 *
 * This version accepts template data and pre-fills the post creator
 * when a user comes from the templates page.
 *
 * Key improvements:
 * - Accepts pre-filled content from templates
 * - Pre-selects platforms from template
 * - Shows a banner when created from a template
 * - Allows users to further customize template content
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  X,
  Loader2,
  Zap,
  AlertCircle,
  Sparkles,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCreatePost, useAIProviders } from "@/hooks/api/use-posts";
import { useFacebookPages } from "@/hooks/api/use-facebook";
import { PlatformSelector } from "../post-creator/platform-selector";
import { ContentEditor } from "../post-creator/content-editor";
import { PlatformCustomizer } from "../post-creator/platform-customizer";
import { AIEnhancementPanel } from "../post-creator/ai-enhancement-panel";
import { SchedulePicker } from "../post-creator/schedule-picker";
import { usePostCreatorState } from "@/hooks/use-post-creator-state";
import { useTemplateCreator } from "@/hooks/use-template-creator";
import { cn } from "@/lib/utils";

interface EnhancedPostCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Array<{
    id: string;
    name: string;
    icon: any;
    color: string;
    limit: number;
    maxImages: number;
  }>;
  connectedPlatforms: string[];
}

export function EnhancedPostCreatorModal({
  isOpen,
  onClose,
  platforms,
  connectedPlatforms,
}: EnhancedPostCreatorModalProps) {
  const [activeTab, setActiveTab] = useState("compose");
  const state = usePostCreatorState();
  const createMutation = useCreatePost();
  const { data: aiProviders } = useAIProviders();
  const { data: facebookPages } = useFacebookPages();

  // Get template data from the template creator state
  const {
    selectedTemplate,
    preFilledContent,
    preSelectedPlatforms,
    reset: resetTemplateState,
  } = useTemplateCreator();

  // Pre-fill content when modal opens with template data
  useEffect(() => {
    if (isOpen && preFilledContent && selectedTemplate) {
      // Set the content
      state.setContent(preFilledContent);

      // Pre-select platforms that are both:
      // 1. Supported by the template
      // 2. Connected by the user
      const availablePlatforms = preSelectedPlatforms.filter((platform) =>
        connectedPlatforms.includes(platform.toLowerCase()),
      );

      // Clear existing selections and set new ones
      state.setSelectedPlatforms([]);
      availablePlatforms.forEach((platform) => {
        state.togglePlatform(platform);
      });

      // Show success message
      toast.success(`Template "${selectedTemplate.name}" loaded!`, {
        icon: "✨",
        duration: 3000,
      });
    }
  }, [
    isOpen,
    preFilledContent,
    selectedTemplate,
    preSelectedPlatforms,
    connectedPlatforms,
  ]);

  const hasAIProvider =
    aiProviders &&
    Object.values(aiProviders).some(
      (value, index) => index < 5 && value === true,
    );

  const isFromTemplate = !!selectedTemplate && !!preFilledContent;

  const handleSubmit = async () => {
    if (!state.content.trim()) {
      toast.error("Please add content");
      return;
    }

    if (state.selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    // Validate character limits
    const violations = state.selectedPlatforms.filter((platformId) => {
      const platform = platforms.find((p) => p.id === platformId);
      if (!platform) return false;
      const text = state.customizePerPlatform
        ? state.platformSpecific[platformId]?.text || ""
        : state.content;
      return text.length > platform.limit;
    });

    if (violations.length > 0) {
      toast.error("Some platforms exceed character limits");
      return;
    }

    // Facebook page validation
    if (state.selectedPlatforms.includes("facebook")) {
      const selectedPage = facebookPages?.pages?.find((p) => p.is_selected);
      if (!selectedPage) {
        toast.error("Please select a Facebook Page in Social Connections");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("original_content", state.content);
      formData.append("platforms", JSON.stringify(state.selectedPlatforms));

      if (state.scheduledDate) {
        formData.append(
          "scheduled_for",
          new Date(state.scheduledDate).toISOString(),
        );
      }

      // Enhanced content
      let finalEnhanced: Record<string, string> = {};

      if (state.customizePerPlatform) {
        state.selectedPlatforms.forEach((platformId) => {
          if (state.platformSpecific[platformId]?.text) {
            finalEnhanced[platformId] = state.platformSpecific[platformId].text;
          }
        });
      } else if (state.aiEnhancements.length > 0 && state.selectedEnhancement) {
        finalEnhanced = state.aiEnhancements.reduce(
          (acc, enh) => ({
            ...acc,
            [enh.platform.toLowerCase()]: enh.enhanced_content,
          }),
          {},
        );
      }

      if (Object.keys(finalEnhanced).length > 0) {
        formData.append("enhanced_content", JSON.stringify(finalEnhanced));
      }

      // Media handling
      const addedMedia = new Set<File>();

      if (state.customizePerPlatform) {
        state.selectedPlatforms.forEach((platformId) => {
          const media = state.platformSpecific[platformId]?.media || [];
          media.forEach((file) => {
            if (!addedMedia.has(file)) {
              formData.append(
                file.type.startsWith("image/") ? "images" : "videos",
                file,
              );
              addedMedia.add(file);
            }
          });
        });
      } else {
        state.uploadedMedia.forEach((file) => {
          formData.append(
            file.type.startsWith("image/") ? "images" : "videos",
            file,
          );
        });
      }

      await createMutation.mutateAsync(formData);

      state.reset();
      resetTemplateState(); // Reset template state too
      onClose();

      toast.success(
        state.scheduledDate
          ? `📅 Scheduled for ${new Date(state.scheduledDate).toLocaleString()}`
          : "🚀 Publishing now!",
        { duration: 4000 },
      );
    } catch (error: any) {
      if (error.response?.status === 413) {
        toast.error("Files too large. Reduce file sizes and try again");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || "Validation error");
      } else {
        toast.error("Failed to create post. Please try again");
      }
    }
  };

  const handleClose = () => {
    if (state.content.trim() || state.uploadedMedia.length > 0) {
      const confirmed = confirm("You have unsaved changes. Close anyway?");
      if (!confirmed) return;
    }
    state.reset();
    resetTemplateState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 flex gap-0">
        <div className="flex-1 flex flex-col min-w-0">
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  {isFromTemplate && (
                    <FileText className="h-6 w-6 text-purple-600" />
                  )}
                  Create Post
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {isFromTemplate
                    ? `Using template: ${selectedTemplate.name}`
                    : "Craft engaging content for multiple platforms"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasAIProvider && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3 text-purple-600" />
                    AI: {aiProviders?.configured_provider}
                  </Badge>
                )}
                {isFromTemplate && (
                  <Badge className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600">
                    <Sparkles className="h-3 w-3" />
                    From Template
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Template Banner */}
          {isFromTemplate && (
            <div className="mx-6 mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    backgroundColor: selectedTemplate.color_scheme + "20",
                  }}
                >
                  ✨
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900">
                    Template content has been loaded
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Feel free to customize the content below, add media, select
                    specific platforms, and schedule your post. The template
                    content is just a starting point!
                  </p>
                </div>
              </div>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <TabsList className="mx-6 my-4 grid grid-cols-3 gap-2">
              <TabsTrigger value="compose" className="gap-2">
                ✏️ Compose
              </TabsTrigger>
              <TabsTrigger value="platforms" className="gap-2">
                🎯 Customize ({state.selectedPlatforms.length})
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2">
                📅 Schedule
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 h-0 px-6 pb-6">
              <TabsContent value="compose" className="space-y-6 mt-0">
                {!hasAIProvider && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        No AI Provider Configured
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Configure Groq, Gemini, or OpenAI in settings to unlock
                        AI features
                      </p>
                    </div>
                  </div>
                )}

                <PlatformSelector
                  platforms={platforms}
                  connectedPlatforms={connectedPlatforms}
                  selectedPlatforms={state.selectedPlatforms}
                  onToggle={state.togglePlatform}
                />

                <ContentEditor
                  content={state.content}
                  setContent={state.setContent}
                  selectedPlatforms={state.selectedPlatforms}
                  customizePerPlatform={state.customizePerPlatform}
                  setCustomizePerPlatform={state.setCustomizePerPlatform}
                  platforms={platforms}
                  hasAIProvider={!!hasAIProvider}
                  onEnhance={state.handleEnhance}
                  onGenerateHashtags={state.handleGenerateHashtags}
                  isEnhancing={state.isEnhancing}
                  isGeneratingHashtags={state.isGeneratingHashtags}
                  generatedHashtags={state.generatedHashtags}
                  onInsertHashtags={state.insertHashtags}
                  selectedTone={state.selectedTone}
                  setSelectedTone={state.setSelectedTone}
                  showToneSelector={state.showToneSelector}
                  setShowToneSelector={state.setShowToneSelector}
                  uploadedMedia={state.uploadedMedia}
                  onMediaUpload={state.handleMediaUpload}
                  onMediaRemove={state.removeMedia}
                  dragActive={state.dragActive}
                  setDragActive={state.setDragActive}
                />
              </TabsContent>

              <TabsContent value="platforms" className="mt-0">
                {state.selectedPlatforms.length === 0 ? (
                  <div className="text-center py-16">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No platforms selected
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select at least one platform to customize content
                    </p>
                    <Button
                      onClick={() => setActiveTab("compose")}
                      variant="outline"
                    >
                      Select Platforms
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.selectedPlatforms.map((platformId) => {
                      const platform = platforms.find(
                        (p) => p.id === platformId,
                      );
                      if (!platform) return null;

                      return (
                        <PlatformCustomizer
                          key={platformId}
                          platformId={platformId}
                          platformName={platform.name}
                          platformColor={platform.color}
                          platformLimit={platform.limit}
                          content={state.content}
                          platformSpecific={state.platformSpecific}
                          setPlatformSpecific={state.setPlatformSpecific}
                          customizePerPlatform={state.customizePerPlatform}
                          uploadedMedia={state.uploadedMedia}
                          onMediaUpload={state.handleMediaUpload}
                          onMediaRemove={state.removeMedia}
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <SchedulePicker
                  scheduledDate={state.scheduledDate}
                  setScheduledDate={state.setScheduledDate}
                  selectedPlatforms={state.selectedPlatforms}
                  platforms={platforms}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex gap-3 p-6 border-t bg-white">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !state.content.trim() ||
                state.selectedPlatforms.length === 0 ||
                createMutation.isPending
              }
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {state.scheduledDate ? "Scheduling..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {state.scheduledDate ? "Schedule Post" : "Publish Now"}
                </>
              )}
            </Button>
          </div>
        </div>

        {state.showAIPanel && state.aiEnhancements.length > 0 && (
          <AIEnhancementPanel
            enhancements={state.aiEnhancements}
            selectedEnhancement={state.selectedEnhancement}
            platforms={platforms}
            onUse={state.useEnhancement}
            onCopy={state.copyEnhancement}
            onClose={() => state.setShowAIPanel(false)}
            onRegenerate={state.handleEnhance}
            isRegenerating={state.isEnhancing}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
