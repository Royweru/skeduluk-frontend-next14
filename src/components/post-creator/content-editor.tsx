// components/post-creator/ContentEditor.tsx
"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Hash, Wand2, TrendingUp, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToneSelector } from "./tone-selector";
import { HashtagGenerator } from "./hashtag-generator";
import { MediaUploadZone } from "./media-upload-zone";
import { VoiceRecorder } from "./voice-recorder";

interface ContentEditorProps {
  content: string;
  setContent: (content: string) => void;
  selectedPlatforms: string[];
  customizePerPlatform: boolean;
  setCustomizePerPlatform: (value: boolean) => void;
  platforms: Array<{
    id: string;
    name: string;
    limit: number;
  }>;
  hasAIProvider: boolean;
  onEnhance: () => void;
  onGenerateHashtags: () => void;
  isEnhancing: boolean;
  isGeneratingHashtags: boolean;
  generatedHashtags: string[];
  onInsertHashtags: () => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  showToneSelector: boolean;
  setShowToneSelector: (show: boolean) => void;
  uploadedMedia: File[];
  onMediaUpload: (files: FileList | null) => void;
  onMediaRemove: (index: number) => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
}

export function ContentEditor({
  content,
  setContent,
  selectedPlatforms,
  customizePerPlatform,
  setCustomizePerPlatform,
  platforms,
  hasAIProvider,
  onEnhance,
  onGenerateHashtags,
  isEnhancing,
  isGeneratingHashtags,
  generatedHashtags,
  onInsertHashtags,
  selectedTone,
  setSelectedTone,
  showToneSelector,
  setShowToneSelector,
  uploadedMedia,
  onMediaUpload,
  onMediaRemove,
  dragActive,
  setDragActive,
}: ContentEditorProps) {
  // Calculate character stats
  const getMaxLength = () => {
    if (selectedPlatforms.length === 0) return 3000;
    return Math.min(
      ...selectedPlatforms.map((id) => {
        const platform = platforms.find((p) => p.id === id);
        return platform?.limit || 3000;
      }),
    );
  };

  const maxLength = getMaxLength();
  const currentLength = content.length;
  const percentage = (currentLength / maxLength) * 100;
  const isOver = currentLength > maxLength;
  const isNear = percentage > 90;

  const handleVoiceTranscription = (transcription: string) => {
    if (content) {
      setContent(content + "\n\n" + transcription);
    } else {
      setContent(transcription);
    }
  };

  const insertHashtag = (hashtag: string) => {
    setContent(content + " " + hashtag);
  };

  return (
    <div className="space-y-6">
      {/* AI Tone Selector */}
      {hasAIProvider && selectedPlatforms.length > 0 && (
        <ToneSelector
          selectedTone={selectedTone}
          setSelectedTone={setSelectedTone}
          showToneSelector={showToneSelector}
          setShowToneSelector={setShowToneSelector}
        />
      )}

      {/* Customize Per Platform Toggle */}
      {selectedPlatforms.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-indigo-900">
                  Platform-Specific Customization
                </p>
                <p className="text-xs text-indigo-700">
                  Tailor unique content for each platform
                </p>
              </div>
            </div>
            <Button
              variant={customizePerPlatform ? "default" : "outline"}
              size="sm"
              onClick={() => setCustomizePerPlatform(!customizePerPlatform)}
              className={cn(
                "transition-all",
                customizePerPlatform &&
                  "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md",
              )}
            >
              {customizePerPlatform ? "✓ Enabled" : "Enable"}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!customizePerPlatform && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-600" />
                Post Content *
              </Label>

              {/* AI Action Buttons */}
              {hasAIProvider && selectedPlatforms.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={onGenerateHashtags}
                    disabled={!content.trim() || isGeneratingHashtags}
                    size="sm"
                    variant="outline"
                    className="gap-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    {isGeneratingHashtags ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <Hash className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="hidden sm:inline">Hashtags</span>
                  </Button>

                  <Button
                    onClick={onEnhance}
                    disabled={!content.trim() || isEnhancing}
                    size="sm"
                    className="gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Enhancing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">AI Enhance</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Textarea */}
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share your story, announce something exciting, or start a conversation..."
                className={cn(
                  "min-h-[200px] resize-none text-base leading-relaxed transition-all",
                  "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                  isOver && "border-red-500 bg-red-50/50 focus:ring-red-500",
                )}
              />

              {/* Floating character count */}
              {content && (
                <div className="absolute bottom-3 right-3">
                  <Badge
                    variant={isOver ? "destructive" : "outline"}
                    className={cn(
                      "font-mono text-xs transition-all",
                      isNear &&
                        !isOver &&
                        "bg-yellow-50 border-yellow-500 text-yellow-700",
                    )}
                  >
                    {currentLength.toLocaleString()} /{" "}
                    {maxLength.toLocaleString()}
                  </Badge>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {selectedPlatforms.length > 0 && content && (
              <div className="mt-3 space-y-2">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      "bg-gradient-to-r",
                      isOver
                        ? "from-red-500 to-red-600 animate-pulse"
                        : isNear
                          ? "from-yellow-400 to-orange-500"
                          : "from-blue-500 via-purple-500 to-pink-500",
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {/* Platform-specific badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.map((platformId) => {
                    const platform = platforms.find((p) => p.id === platformId);
                    if (!platform) return null;

                    const platformOver = currentLength > platform.limit;
                    const platformNear =
                      (currentLength / platform.limit) * 100 > 90;

                    return (
                      <Badge
                        key={platformId}
                        variant="outline"
                        className={cn(
                          "text-xs font-mono px-3 py-1 transition-all",
                          platformOver &&
                            "border-red-500 bg-red-50 text-red-700 animate-pulse",
                          platformNear &&
                            !platformOver &&
                            "border-yellow-500 bg-yellow-50 text-yellow-700",
                          !platformNear &&
                            "border-gray-300 hover:border-blue-400",
                        )}
                      >
                        {platform.name}: {currentLength.toLocaleString()}/
                        {platform.limit.toLocaleString()}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Hashtag Generator */}
          {generatedHashtags.length > 0 && (
            <HashtagGenerator
              hashtags={generatedHashtags}
              onInsert={onInsertHashtags}
              onInsertSingle={insertHashtag}
            />
          )}

          {/* Voice Recorder */}
          <VoiceRecorder onTranscriptionComplete={handleVoiceTranscription} />

          {/* Media Upload Zone */}
          <MediaUploadZone
            uploadedMedia={uploadedMedia}
            onMediaUpload={onMediaUpload}
            onMediaRemove={onMediaRemove}
            dragActive={dragActive}
            setDragActive={setDragActive}
          />
        </div>
      )}
    </div>
  );
}
