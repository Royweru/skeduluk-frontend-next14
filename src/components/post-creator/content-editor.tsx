import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
import { usePostCreator } from '@/hooks/api/use-post-creator';
import { cn } from '@/lib/utils';

export function ContentEditor() {
  const {
    content,
    setContent,
    selectedPlatforms,
    proofreading,
    applyProofreadCorrections,
    setProofreading,
    mainEditorRef,
  } = usePostCreator();

  const maxLength = selectedPlatforms.length > 0 
    ? Math.min(...selectedPlatforms.map(p => getPlatformLimit(p)))
    : 3000;

  const isOver = content.length > maxLength;
  const isNear = content.length > maxLength * 0.9;

  return (
    <div className="space-y-4">
      {/* Main Content Input */}
      <div>
        <label className="text-sm font-semibold mb-2 block">
          Post Content *
        </label>
        <Textarea
          ref={mainEditorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Write your post here..."
          className={cn(
            "min-h-[180px] resize-none text-base",
            isOver && "border-red-500 bg-red-50",
            proofreading && "border-blue-500 bg-blue-50"
          )}
        />

        {/* Character Counter Progress Bar */}
        {selectedPlatforms.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isOver ? "bg-red-500" : isNear ? "bg-yellow-500" : "bg-blue-500"
                )}
                style={{ width: `${Math.min((content.length / maxLength) * 100, 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className={isOver ? "text-red-600 font-semibold" : "text-gray-600"}>
                {content.length.toLocaleString()} / {maxLength.toLocaleString()} characters
              </span>
              {isOver && (
                <span className="text-red-600 font-semibold">
                  {(content.length - maxLength).toLocaleString()} over limit
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Proofreading Suggestion Banner */}
      {proofreading && (
        <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Grammar Corrections</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProofreading(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-blue-700 mb-1">Before:</p>
              <p className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-200">
                {proofreading.original}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1">After:</p>
              <p className="text-sm text-gray-900 bg-white p-2 rounded border border-blue-200 font-medium">
                {proofreading.corrected}
              </p>
            </div>
          </div>

          <Button
            onClick={applyProofreadCorrections}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Apply Corrections
          </Button>
        </div>
      )}

      {/* Per-Platform Character Limits */}
      {selectedPlatforms.length > 1 && content && (
        <div className="flex flex-wrap gap-2">
          {selectedPlatforms.map(platform => {
            const limit = getPlatformLimit(platform);
            const platformOver = content.length > limit;
            const platformNear = content.length > limit * 0.9;

            return (
              <Badge
                key={platform}
                variant="outline"
                className={cn(
                  "text-xs font-medium",
                  platformOver && "bg-red-100 border-red-300 text-red-700",
                  platformNear && !platformOver && "bg-yellow-100 border-yellow-300 text-yellow-700"
                )}
              >
                {platform}: {content.length.toLocaleString()}/{limit.toLocaleString()}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getPlatformLimit(platform: string): number {
  const limits: Record<string, number> = {
    twitter: 280,
    linkedin: 3000,
    facebook: 63206,
    instagram: 2200,
    tiktok: 2200,
    youtube: 5000
  };
  return limits[platform.toLowerCase()] || 3000;
}