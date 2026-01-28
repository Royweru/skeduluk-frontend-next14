// components/post-creator/MediaPreview.tsx
"use client";
import { X, Video, Image, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface MediaPreviewProps {
  file: File;
  index: number;
  onRemove: () => void;
}

export function MediaPreview({ file, index, onRemove }: MediaPreviewProps) {
  const [preview, setPreview] = useState<string>("");
  const isVideo = file.type.startsWith("video/");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all bg-gray-100 hover:shadow-lg">
      {/* Media */}
      {isVideo ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video src={preview} className="w-full h-full object-contain" />
          {/* Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
            <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
        </div>
      ) : (
        <img
          src={preview}
          alt={`Upload ${index + 1}`}
          className="w-full h-full object-cover"
        />
      )}

      {/* Type Badge */}
      <Badge
        className={cn(
          "absolute top-2 left-2 shadow-lg",
          isVideo ? "bg-red-600" : "bg-blue-600",
        )}
      >
        {isVideo ? (
          <>
            <Video className="h-3 w-3 mr-1" />
            Video
          </>
        ) : (
          <>
            <Image className="h-3 w-3 mr-1" />
            Image
          </>
        )}
      </Badge>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className={cn(
          "absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full",
          "hover:bg-red-600 active:scale-95",
          "opacity-0 group-hover:opacity-100 transition-all",
          "shadow-lg hover:shadow-xl",
        )}
        aria-label="Remove media"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Info Overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0",
          "bg-gradient-to-t from-black/80 via-black/50 to-transparent",
          "p-3 opacity-0 group-hover:opacity-100 transition-opacity",
        )}
      >
        <p className="text-white text-xs font-medium truncate">{file.name}</p>
        <p className="text-white/80 text-[10px]">{formatFileSize(file.size)}</p>
      </div>
    </div>
  );
}
