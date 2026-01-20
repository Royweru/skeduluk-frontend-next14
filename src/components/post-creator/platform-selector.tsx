// components/post-creator/PlatformSelector.tsx
import { CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  limit: number;
}

interface PlatformSelectorProps {
  platforms: Platform[];
  connectedPlatforms: string[];
  selectedPlatforms: string[];
  onToggle: (platformId: string) => void;
}

export function PlatformSelector({ 
  platforms, 
  connectedPlatforms, 
  selectedPlatforms,
  onToggle
}: PlatformSelectorProps) {

  const togglePlatform = (platformId: string) => {
    const isConnected = connectedPlatforms.includes(platformId.toLowerCase());
    
    if (!isConnected) {
      toast.error(`${platforms.find(p => p.id === platformId)?.name} is not connected`);
      return;
    }

    onToggle(platformId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold flex items-center gap-2">
          <span>Select Platforms</span>
          <span className="text-xs text-gray-500 font-normal">*Required</span>
        </label>
        {selectedPlatforms.length > 0 && (
          <span className="text-xs text-gray-600 px-2 py-1 bg-blue-50 rounded-full">
            {selectedPlatforms.length} selected
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {platforms.map((platform) => {
          const PlatformIcon = platform.icon;
          const isConnected = connectedPlatforms.includes(platform.id.toLowerCase());
          const isSelected = selectedPlatforms.includes(platform.id);

          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              disabled={!isConnected}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all group",
                !isConnected && "opacity-50 cursor-not-allowed bg-gray-50",
                isConnected && !isSelected && "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm",
                isSelected && "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md scale-[1.02]"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Icon */}
                <div className={cn(
                  "p-3 rounded-lg text-white transition-transform",
                  platform.color,
                  isSelected && "scale-110 shadow-lg",
                  !isConnected && "grayscale"
                )}>
                  <PlatformIcon className="h-6 w-6" />
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-center text-gray-900">
                  {platform.name}
                </span>

                {/* Status Badge */}
                {!isConnected ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    <Lock className="h-3 w-3" />
                    Not Connected
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500">
                    {platform.limit.toLocaleString()} chars
                  </span>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in shadow-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Not Connected Overlay */}
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      {selectedPlatforms.length === 0 && (
        <p className="text-xs text-center text-gray-500 pt-2">
          Select at least one platform to continue
        </p>
      )}
      
      {/* Connected Count */}
      <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
        <span>{connectedPlatforms.length} platform{connectedPlatforms.length !== 1 ? 's' : ''} connected</span>
        {connectedPlatforms.length < platforms.length && (
          <a href="/dashboard/social" className="text-blue-600 hover:underline">
            Connect more →
          </a>
        )}
      </div>
    </div>
  );
}