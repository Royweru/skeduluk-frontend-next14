import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePostCreator } from '@/hooks/api/use-post-creator';
import { Twitter, Linkedin, Facebook, Instagram, Music, Youtube } from 'lucide-react';

const PLATFORM_ICONS: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music,
  youtube: Youtube,
};

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  facebook: 63206,
  instagram: 2200,
  tiktok: 2200,
  youtube: 5000,
};

interface PlatformCustomizerProps {
  platformId: string;
  platformName: string;
  platformColor: string;
}

export function PlatformCustomizer({
  platformId,
  platformName,
  platformColor,
}: PlatformCustomizerProps) {
  const {
    content,
    platformSpecific,
    setPlatformSpecific,
    focusPlatformInput,
    platformRefs,
  } = usePostCreator();

  const PlatformIcon = PLATFORM_ICONS[platformId.toLowerCase()] || Twitter;
  const characterLimit = PLATFORM_LIMITS[platformId.toLowerCase()] || 3000;
  
  // Use platform-specific content if available, otherwise use main content
  const currentText = platformSpecific[platformId.toLowerCase()] || content;
  const count = currentText.length;
  const isOver = count > characterLimit;
  const isNear = count > characterLimit * 0.9;

  // Auto-focus when component mounts or platformId changes
  useEffect(() => {
    focusPlatformInput(platformId.toLowerCase());
  }, [platformId, focusPlatformInput]);

  // Handle ref assignment
  const setRef = (el: HTMLTextAreaElement | null) => {
    if (el) {
      platformRefs.current[platformId.toLowerCase()] = el;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlatformSpecific((prev:any) => ({
      ...prev,
      [platformId.toLowerCase()]: e.target.value,
    }));
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-200">
      {/* Platform Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg text-white", platformColor)}>
            <PlatformIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold">{platformName}</h4>
            <p className="text-xs text-gray-500">Customize for this platform</p>
          </div>
        </div>
        <Badge
          variant={isOver ? "destructive" : isNear ? "default" : "outline"}
          className="font-mono text-xs"
        >
          {count.toLocaleString()} / {characterLimit.toLocaleString()}
        </Badge>
      </div>

      {/* Content Editor */}
      <div className="px-4 pb-4">
        <Label className="text-sm font-semibold mb-2 block">
          {platformSpecific[platformId.toLowerCase()] 
            ? `Custom ${platformName} version` 
            : `Using main content (click to customize)`
          }
        </Label>
        
        <Textarea
          ref={setRef}
          value={currentText}
          onChange={handleChange}
          placeholder={`Write your ${platformName} post here...\n\nThis version will only be used for ${platformName}.`}
          className={cn(
            "min-h-[200px] resize-none transition-all",
            isOver && "border-red-500 bg-red-50",
            !platformSpecific[platformId.toLowerCase()] && "border-blue-200 bg-blue-50/30"
          )}
        />

        {/* Visual Progress Bar */}
        <div className="mt-3 space-y-2">
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                isOver ? "bg-red-500" : isNear ? "bg-yellow-500" : "bg-green-500"
              )}
              style={{ width: `${Math.min((count / characterLimit) * 100, 100)}%` }}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {count.toLocaleString()} characters
            </span>
            {isOver && (
              <span className="text-red-600 font-semibold">
                {(count - characterLimit).toLocaleString()} over limit!
              </span>
            )}
          </div>
        </div>

        {/* Info Banner */}
        {!platformSpecific[platformId.toLowerCase()] && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Start typing to create a custom version for {platformName}. 
              The main content will be used as a fallback.
            </p>
          </div>
        )}

        {isOver && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700">
              ⚠️ <strong>Warning:</strong> This post exceeds {platformName}'s character limit 
              and may be truncated when published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}