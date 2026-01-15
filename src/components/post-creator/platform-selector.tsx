import { CheckCircle2, AlertCircle } from 'lucide-react';
import { usePostCreator } from '@/hooks/api/use-post-creator';
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
}

export function PlatformSelector({ platforms, connectedPlatforms }: PlatformSelectorProps) {
  const { selectedPlatforms, setSelectedPlatforms } = usePostCreator();

  const togglePlatform = (platformId: string) => {
    const isConnected = connectedPlatforms.includes(platformId.toLowerCase());
    
    if (!isConnected) {
      toast.error(`${platforms.find(p => p.id === platformId)?.name} is not connected`);
      return;
    }

    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div>
      <label className="text-sm font-semibold mb-3 block">
        Select Platforms *
      </label>
      
      <div className="grid grid-cols-3 gap-3">
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
                "p-4 rounded-xl border-2 transition-all relative group",
                !isConnected && "opacity-50 cursor-not-allowed",
                isSelected 
                  ? "border-blue-500 bg-blue-50 shadow-md scale-105" 
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Icon */}
                <div className={cn(
                  "p-3 rounded-lg text-white transition-transform",
                  platform.color,
                  isSelected && "scale-110"
                )}>
                  <PlatformIcon className="h-6 w-6" />
                </div>

                {/* Name */}
                <span className="text-xs font-medium text-center">
                  {platform.name}
                </span>

                {/* Status Badge */}
                {!isConnected && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600">
                    Not Connected
                  </span>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Hover Tooltip */}
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Count */}
      {selectedPlatforms.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>{selectedPlatforms.length}</strong> platform{selectedPlatforms.length !== 1 ? 's' : ''} selected: {' '}
            {selectedPlatforms.map(id => 
              platforms.find(p => p.id === id)?.name
            ).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}