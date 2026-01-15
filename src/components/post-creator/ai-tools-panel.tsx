import { useState } from 'react';
import { Wand2, SpellCheck, Hash, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePostCreator } from '@/hooks/api/use-post-creator';
import { cn } from '@/lib/utils';

const TONES = [
  { value: 'engaging', label: 'Engaging', icon: '✨', desc: 'Captivating and energetic' },
  { value: 'professional', label: 'Professional', icon: '💼', desc: 'Formal and authoritative' },
  { value: 'casual', label: 'Casual', icon: '😊', desc: 'Relaxed and friendly' },
  { value: 'humorous', label: 'Humorous', icon: '😄', desc: 'Witty and playful' },
  { value: 'inspirational', label: 'Inspirational', icon: '🚀', desc: 'Motivating and uplifting' },
];

export function AIToolsPanel() {
  const [activeTab, setActiveTab] = useState<'proofread' | 'enhance' | 'hashtags'>('proofread');
  
  const {
    content,
    selectedPlatforms,
    aiTone,
    setAiTone,
    handleProofread,
    handleEnhance,
    isProofreading,
    isEnhancing,
    activeAITool,
    aiEnhancements,
    applyEnhancement,
  } = usePostCreator();

  const isBusy = activeAITool !== 'none';
  const hasContent = content.trim().length > 0;
  const hasPlatforms = selectedPlatforms.length > 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Header */}
      <div className="p-4 border-b bg-white/80">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          AI Assistant
        </h3>
        <p className="text-xs text-gray-600 mt-1">Enhance your content with AI</p>
      </div>

      {/* Tool Tabs */}
      <div className="flex gap-2 p-4 bg-white/50">
        <Button
          size="sm"
          variant={activeTab === 'proofread' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('proofread')}
          className="flex-1"
        >
          <SpellCheck className="h-4 w-4 mr-2" />
          Proofread
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'enhance' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('enhance')}
          className="flex-1"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Enhance
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'hashtags' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('hashtags')}
          className="flex-1"
        >
          <Hash className="h-4 w-4 mr-2" />
          Hashtags
        </Button>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 p-4">
        {/* PROOFREAD TAB */}
        {activeTab === 'proofread' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="text-sm font-semibold mb-2">What Proofreading Does</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Fixes grammar mistakes</li>
                <li>✓ Corrects spelling errors</li>
                <li>✓ Improves sentence flow</li>
                <li>✗ Does NOT change your tone</li>
                <li>✗ Does NOT add emojis/hashtags</li>
              </ul>
            </div>

            <Button
              onClick={handleProofread}
              disabled={!hasContent || isBusy}
              className="w-full"
            >
              {isProofreading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <SpellCheck className="h-4 w-4 mr-2" />
                  Check Grammar & Spelling
                </>
              )}
            </Button>

            {!hasContent && (
              <p className="text-xs text-gray-500 text-center">
                Write some content first
              </p>
            )}
          </div>
        )}

        {/* ENHANCE TAB */}
        {activeTab === 'enhance' && (
          <div className="space-y-4">
            {/* Tone Selector */}
            <div>
              <Label className="text-sm font-semibold mb-2">Tone</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      <div className="flex items-center gap-2">
                        <span>{tone.icon}</span>
                        <div>
                          <div className="font-medium">{tone.label}</div>
                          <div className="text-xs text-gray-500">{tone.desc}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* What Enhancement Does */}
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="text-sm font-semibold mb-2">What Enhancement Does</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Optimizes for each platform</li>
                <li>✓ Adjusts tone & style</li>
                <li>✓ Adds relevant hashtags</li>
                <li>✓ Improves engagement</li>
                <li>✓ Platform-specific versions</li>
              </ul>
            </div>

            <Button
              onClick={handleEnhance}
              disabled={!hasContent || !hasPlatforms || isBusy}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Enhance with AI
                </>
              )}
            </Button>

            {!hasPlatforms && hasContent && (
              <p className="text-xs text-gray-500 text-center">
                Select at least one platform
              </p>
            )}

            {/* Enhancements List */}
            {aiEnhancements.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Enhanced Versions</Label>
                {aiEnhancements.map((enh) => (
                  <div key={enh.platform} className="p-3 bg-white rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{enh.platform}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => applyEnhancement(enh.platform, enh.enhanced_content)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Use This
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700">{enh.enhanced_content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HASHTAGS TAB */}
        {activeTab === 'hashtags' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="text-sm font-semibold mb-2">Coming Soon</h4>
              <p className="text-xs text-gray-600">
                AI-powered hashtag generation based on your content
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}