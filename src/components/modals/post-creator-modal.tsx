import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Sparkles, AlertCircle } from 'lucide-react';
import { usePostCreator } from '@/hooks/api/use-post-creator';
import { ContentEditor } from '../post-creator/content-editor';
import { Platform, PlatformSelector } from '../post-creator/platform-selector';
import { PlatformCustomizer } from '../post-creator/platform-customizer';
import { MediaManager } from '../post-creator/media-manager';
import { VoiceTranscription } from '../post-creator/voice-transcription';
import { AIToolsPanel } from '../post-creator/ai-tools-panel';
import { SchedulePicker } from '../post-creator/schedule-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PostCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms:Platform[]
  connectedPlatforms: string[];
}

export function PostCreatorModal({ 
  isOpen, 
  onClose, 
  platforms,
  connectedPlatforms 
}: PostCreatorModalProps) {
  const {
    content,
    selectedPlatforms,
    reset,
    createPost,
    isCreating,
    activeAITool,
    setContent,
    scheduledDate,
  } = usePostCreator();

  const hasContent = content.trim().length > 0;
  const canSubmit = hasContent && selectedPlatforms.length > 0;

  const handleClose = () => {
    if (hasContent) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await createPost();
      handleClose();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    if (content) {
      setContent(content + '\n\n' + text);
    } else {
      setContent(text);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 flex gap-0">
        {/* Main Editor - 2/3 width */}
        <div className="flex-1 flex flex-col min-w-0">
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Create Post
              {activeAITool !== 'none' && (
                <span className="text-sm text-purple-600 animate-pulse">
                  • AI Working...
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="compose" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 my-4 grid grid-cols-4 gap-2">
              <TabsTrigger value="compose">✍️ Compose</TabsTrigger>
              <TabsTrigger 
                value="platforms" 
                disabled={selectedPlatforms.length === 0}
              >
                🎯 Customize ({selectedPlatforms.length})
              </TabsTrigger>
              <TabsTrigger value="media">📸 Media</TabsTrigger>
              <TabsTrigger value="schedule">📅 Schedule</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6 pb-6">
              {/* COMPOSE TAB */}
              <TabsContent value="compose" className="space-y-6 mt-0">
                <PlatformSelector 
                  platforms={platforms}
                  connectedPlatforms={connectedPlatforms}
                />
                
                <ContentEditor />
                
                <VoiceTranscription 
                  onTranscriptionComplete={handleTranscriptionComplete}
                  autoProofread={true}
                />

                {/* Validation Warnings */}
                {hasContent && selectedPlatforms.length === 0 && (
                  <Alert variant="default" className="border-yellow-500 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      Please select at least one platform to post to
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* PLATFORMS TAB */}
              <TabsContent value="platforms" className="space-y-4 mt-0">
                {selectedPlatforms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select platforms from the Compose tab first</p>
                  </div>
                ) : (
                  selectedPlatforms.map((platformId) => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    
                    return (
                      <PlatformCustomizer
                        key={platformId}
                        platformId={platformId}
                        platformName={platform.name}
                        platformColor={platform.color}
                      />
                    );
                  })
                )}
              </TabsContent>

              {/* MEDIA TAB */}
              <TabsContent value="media" className="mt-0">
                <MediaManager />
              </TabsContent>

              {/* SCHEDULE TAB */}
              <TabsContent value="schedule" className="mt-0">
                <SchedulePicker />
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <div className="p-6 border-t bg-white flex items-center justify-between">
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isCreating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {scheduledDate ? 'Schedule Post' : 'Publish Now'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Sidebar - 1/3 width */}
        <div className="w-96 border-l bg-gradient-to-b from-purple-50 to-blue-50">
          <AIToolsPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
}