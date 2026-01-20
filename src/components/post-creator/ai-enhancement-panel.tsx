// components/post-creator/AIEnhancementPanel.tsx
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Copy, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface AIEnhancementPanelProps {
  enhancements: any[];
  selectedEnhancement: string | null;
  platforms: Array<{ id: string; name: string; icon: any; color: string }>;
  onUse: (enhancement: any) => void;
  onCopy: (text: string, platform: string) => void;
  onClose: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function AIEnhancementPanel({
  enhancements,
  selectedEnhancement,
  platforms,
  onUse,
  onCopy,
  onClose,
  onRegenerate,
  isRegenerating
}: AIEnhancementPanelProps) {
  return (
    <div className="w-96 border-l bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-purple-900">AI Enhancements</h3>
              <p className="text-xs text-purple-700">Optimized for each platform</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhancements */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-3">
          {enhancements.map((enhancement: any) => {
            const platform = platforms.find(p => p.id === enhancement.platform.toLowerCase());
            const isSelected = selectedEnhancement === enhancement.platform;
            
            return (
              <div 
                key={enhancement.platform}
                className={cn(
                  "p-4 rounded-xl border-2 bg-white transition-all",
                  "hover:shadow-lg",
                  isSelected 
                    ? "border-purple-500 shadow-lg ring-2 ring-purple-200" 
                    : "border-gray-200 hover:border-purple-300"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {platform && (
                      <div className={cn("p-1.5 rounded text-white", platform.color)}>
                        {React.createElement(platform.icon, { className: "h-4 w-4" })}
                      </div>
                    )}
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {enhancement.platform}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {enhancement.enhanced_content?.length || 0} chars
                  </span>
                </div>
                
                {/* Content */}
                <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
                  {enhancement.enhanced_content}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onUse(enhancement)}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      isSelected && "bg-gradient-to-r from-purple-600 to-pink-600"
                    )}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Using
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3 mr-1" />
                        Use This
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => onCopy(enhancement.enhanced_content, enhancement.platform)}
                    size="sm"
                    variant="ghost"
                    className="hover:bg-gray-100"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-6 border-t bg-white/80">
        <Button
          onClick={onRegenerate}
          disabled={isRegenerating}
          variant="outline"
          size="sm"
          className="w-full gap-2 border-purple-300 hover:bg-purple-50"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Regenerate All
            </>
          )}
        </Button>
      </div>
    </div>
  );
}