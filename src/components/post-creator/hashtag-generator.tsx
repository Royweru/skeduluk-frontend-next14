// components/post-creator/HashtagGenerator.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Plus, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface HashtagGeneratorProps {
  hashtags: string[];
  onInsert: () => void;
  onInsertSingle: (hashtag: string) => void;
}

export function HashtagGenerator({
  hashtags,
  onInsert,
  onInsertSingle,
}: HashtagGeneratorProps) {
  const copyHashtag = async (hashtag: string) => {
    try {
      await navigator.clipboard.writeText(hashtag);
      toast.success(`Copied ${hashtag}!`);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const copyAllHashtags = async () => {
    try {
      await navigator.clipboard.writeText(hashtags.join(" "));
      toast.success("All hashtags copied!");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md">
            <Hash className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-blue-900">
              Generated Hashtags
            </p>
            <p className="text-xs text-blue-700">
              {hashtags.length} trending tags for your post
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={copyAllHashtags}
            size="sm"
            variant="outline"
            className="gap-1.5 border-blue-300 hover:bg-blue-100"
          >
            <Copy className="h-3 w-3" />
            <span className="hidden sm:inline text-xs">Copy All</span>
          </Button>
          <Button
            onClick={onInsert}
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
          >
            <Plus className="h-3 w-3" />
            <span className="text-xs">Add to Post</span>
          </Button>
        </div>
      </div>

      {/* Hashtags Grid */}
      <div className="flex flex-wrap gap-2">
        {hashtags.map((hashtag, idx) => (
          <button
            key={idx}
            onClick={() => onInsertSingle(hashtag)}
            onContextMenu={(e) => {
              e.preventDefault();
              copyHashtag(hashtag);
            }}
            className={cn(
              "group relative px-3 py-1.5 rounded-full transition-all",
              "bg-white border-2 border-blue-200",
              "hover:border-blue-500 hover:bg-blue-50 hover:shadow-md",
              "active:scale-95",
              "cursor-pointer select-none",
            )}
          >
            <span className="font-medium text-sm text-blue-800 group-hover:text-blue-900">
              {hashtag}
            </span>

            {/* Hover tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Click to add • Right-click to copy
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="mt-3 p-2.5 rounded-lg bg-blue-100/50 border border-blue-200">
        <p className="text-xs text-blue-700 leading-relaxed">
          💡 <strong>Pro tip:</strong> Click a hashtag to add it individually,
          or use "Add to Post" for all. Right-click to copy.
        </p>
      </div>
    </div>
  );
}
