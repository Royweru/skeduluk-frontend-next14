// components/post-creator/PlatformCustomizer.tsx
"use client";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Facebook, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaUploadZone } from "./media-upload-zone";

const PLATFORM_ICONS: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

interface PlatformCustomizerProps {
  platformId: string;
  platformName: string;
  platformColor: string;
  platformLimit: number;
  content: string;
  platformSpecific: Record<string, { text: string; media: File[] }>;
  setPlatformSpecific: (value: any) => void;
  customizePerPlatform: boolean;
  uploadedMedia: File[];
  onMediaUpload: (files: FileList | null, platformId?: string) => void;
  onMediaRemove: (index: number, platformId?: string) => void;
}

export function PlatformCustomizer({
  platformId,
  platformName,
  platformColor,
  platformLimit,
  content,
  platformSpecific,
  setPlatformSpecific,
  customizePerPlatform,
  uploadedMedia,
  onMediaUpload,
  onMediaRemove,
}: PlatformCustomizerProps) {
  const [dragActive, setDragActive] = useState(false);
  const PlatformIcon = PLATFORM_ICONS[platformId.toLowerCase()] || Twitter;

  const currentText =
    platformSpecific[platformId.toLowerCase()]?.text || content;
  const currentMedia = customizePerPlatform
    ? platformSpecific[platformId.toLowerCase()]?.media || []
    : uploadedMedia;

  const count = currentText.length;
  const isOver = count > platformLimit;
  const isNear = count > platformLimit * 0.9;
  const percentage = (count / platformLimit) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlatformSpecific((prev: any) => ({
      ...prev,
      [platformId.toLowerCase()]: {
        ...prev[platformId.toLowerCase()],
        text: e.target.value,
      },
    }));
  };

  const handleMediaUploadInternal = (files: FileList | null) => {
    onMediaUpload(files, platformId.toLowerCase());
  };

  const handleMediaRemoveInternal = (index: number) => {
    onMediaRemove(index, platformId.toLowerCase());
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300 border-2 border-gray-200 rounded-xl overflow-hidden">
      {/* Platform Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b">
        <div className="flex items-center gap-3">
          <div
            className={cn("p-2 rounded-lg text-white shadow-md", platformColor)}
          >
            <PlatformIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{platformName}</h4>
            <p className="text-xs text-gray-500">
              {platformSpecific[platformId.toLowerCase()]?.text
                ? "Custom version"
                : "Using main content"}
            </p>
          </div>
        </div>
        <Badge
          variant={isOver ? "destructive" : isNear ? "default" : "outline"}
          className="font-mono text-xs"
        >
          {count.toLocaleString()} / {platformLimit.toLocaleString()}
        </Badge>
      </div>
      {/* Content Editor */}
      <div className="px-4 space-y-4">
        <div>
          <Label className="text-sm font-semibold mb-2 block">
            {platformSpecific[platformId.toLowerCase()]?.text
              ? `Custom ${platformName} content`
              : `Click to customize for ${platformName}`}
          </Label>

          <Textarea
            value={currentText}
            onChange={handleChange}
            placeholder={`Write your ${platformName} post here...\n\nThis version will only be used for ${platformName}.`}
            className={cn(
              "min-h-[200px] resize-none transition-all",
              isOver && "border-red-500 bg-red-50",
              !platformSpecific[platformId.toLowerCase()]?.text &&
                "border-blue-200 bg-blue-50/30",
            )}
          />

          {/* Progress Bar */}
          <div className="mt-3 space-y-2">
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden shadow-inner">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isOver
                    ? "bg-red-500"
                    : isNear
                      ? "bg-yellow-500"
                      : "bg-gradient-to-r from-green-500 to-blue-500",
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            {/* Character Stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {count.toLocaleString()} characters
              </span>
              {isOver && (
                <span className="text-red-600 font-semibold animate-pulse">
                  ⚠️ {(count - platformLimit).toLocaleString()} over limit!
                </span>
              )}
            </div>
          </div>

          {/* Helper Banners */}
          {!platformSpecific[platformId.toLowerCase()]?.text && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Start typing to create a custom version
                for {platformName}. The main content will be used as fallback.
              </p>
            </div>
          )}

          {isOver && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">
                ⚠️ <strong>Warning:</strong> This post exceeds {platformName}'s
                character limit and may be truncated when published.
              </p>
            </div>
          )}
        </div>

        {/* Media Upload */}
        <MediaUploadZone
          uploadedMedia={currentMedia}
          onMediaUpload={handleMediaUploadInternal}
          onMediaRemove={handleMediaRemoveInternal}
          dragActive={dragActive}
          setDragActive={setDragActive}
          platformId={platformId}
        />
      </div>
      <div className="h-4" /> {/* Spacing */}
    </div>
  );
}
