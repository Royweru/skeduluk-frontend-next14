import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';
import { ImageIcon, Video, Send, Sparkles, X, Zap, Calendar, CheckCircle2, AlertCircle, Upload, FileVideo, Image as ImageIconLucide } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface PlatformContent {
  text: string;
  media: File[];
  enabled: boolean;
}

interface CreatePostModalProps {
  platforms: any[];
  showCreateModal: boolean;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  connectedPlatforms: any[];
  selectedPlatforms: any[];
  togglePlatform: (platformId: string) => void;
  postContent: string;
  setPostContent: React.Dispatch<React.SetStateAction<string>>;
  aiEnhanced: boolean;
  isEnhancing: boolean;
  handleEnhanceContent: () => void;
  uploadedImages: File[];
  setUploadedImages: React.Dispatch<React.SetStateAction<File[]>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scheduledDate: string;
  setScheduledDate: React.Dispatch<React.SetStateAction<string>>;
}

const CreatePostModal = ({
  platforms,
  showCreateModal,
  setShowCreateModal,
  connectedPlatforms,
  selectedPlatforms,
  togglePlatform,
  postContent,
  setPostContent,
  aiEnhanced,
  isEnhancing,
  handleEnhanceContent,
  uploadedImages,
  setUploadedImages,
  handleImageUpload,
  scheduledDate,
  setScheduledDate,
}: CreatePostModalProps) => {
  const [activeTab, setActiveTab] = useState('compose');
  const [platformSpecific, setPlatformSpecific] = useState<Record<string, PlatformContent>>({});
  const [customizePerPlatform, setCustomizePerPlatform] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Initialize platform-specific content
  React.useEffect(() => {
    const initialContent: Record<string, PlatformContent> = {};
    selectedPlatforms.forEach(platformId => {
      if (!platformSpecific[platformId]) {
        initialContent[platformId] = {
          text: postContent,
          media: [...uploadedImages],
          enabled: true
        };
      }
    });
    if (Object.keys(initialContent).length > 0) {
      setPlatformSpecific(prev => ({ ...prev, ...initialContent }));
    }
  }, [selectedPlatforms]);

  const handleMediaUpload = (files: FileList | null, platformId?: string) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (customizePerPlatform && platformId) {
      setPlatformSpecific(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          media: [...(prev[platformId]?.media || []), ...newFiles]
        }
      }));
    } else {
      setUploadedImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, platformId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMediaUpload(e.dataTransfer.files, platformId);
    }
  };

  const removeMedia = (index: number, platformId?: string) => {
    if (customizePerPlatform && platformId) {
      setPlatformSpecific(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          media: prev[platformId].media.filter((_, i) => i !== index)
        }
      }));
    } else {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getCharacterCount = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return { count: 0, limit: 0, percentage: 0 };
    
    const text = customizePerPlatform ? (platformSpecific[platformId]?.text || '') : postContent;
    const count = text.length;
    const limit = platform.limit;
    const percentage = (count / limit) * 100;
    
    return { count, limit, percentage };
  };

  const getPlatformMedia = (platformId: string) => {
    return customizePerPlatform ? (platformSpecific[platformId]?.media || []) : uploadedImages;
  };

  const MediaPreview = ({ file, index, platformId }: { file: File; index: number; platformId?: string }) => {
    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    return (
      <div className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all">
        {isVideo ? (
          <div className="relative w-full h-full bg-black">
            <video 
              src={url} 
              className="w-full h-full object-contain"
              controls
            />
            <Badge className="absolute top-2 left-2 bg-black/70 text-white">
              <FileVideo className="h-3 w-3 mr-1" />
              Video
            </Badge>
          </div>
        ) : (
          <img 
            src={url} 
            alt={`Upload ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
        <button 
          onClick={() => removeMedia(index, platformId)}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs truncate">{file.name}</p>
          <p className="text-white/70 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  };

  const PlatformContentEditor = ({ platformId }: { platformId: string }) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return null;

    const PlatformIcon = platform.icon;
    const { count, limit, percentage } = getCharacterCount(platformId);
    const isOver = count > limit;
    const isNear = percentage > 90;
    const media = getPlatformMedia(platformId);

    return (
      <div className="space-y-4">
        {/* Platform Header */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg text-white", platform.color)}>
              <PlatformIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{platform.name}</p>
              <p className="text-xs text-gray-600">Customize content for this platform</p>
            </div>
          </div>
          {customizePerPlatform && (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold">Content</Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs font-mono",
                  isOver ? "border-red-500 text-red-700 bg-red-50" :
                  isNear ? "border-yellow-500 text-yellow-700 bg-yellow-50" :
                  "border-gray-300"
                )}
              >
                {count} / {limit}
              </Badge>
            </div>
          </div>
          
          <Textarea
            value={customizePerPlatform ? (platformSpecific[platformId]?.text || '') : postContent}
            onChange={(e) => {
              if (customizePerPlatform) {
                setPlatformSpecific(prev => ({
                  ...prev,
                  [platformId]: { ...prev[platformId], text: e.target.value }
                }));
              } else {
                setPostContent(e.target.value);
              }
            }}
            placeholder={`Write your ${platform.name} post...`}
            className="min-h-[120px] resize-none"
          />

          {/* Character Progress Bar */}
          <div className="mt-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300",
                  isOver ? "bg-red-500" :
                  isNear ? "bg-yellow-500" :
                  "bg-blue-500"
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Media</Label>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, customizePerPlatform ? platformId : undefined)}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
            )}
          >
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => handleMediaUpload(e.target.files, customizePerPlatform ? platformId : undefined)}
              className="hidden"
              id={`media-upload-${platformId}`}
            />
            <label htmlFor={`media-upload-${platformId}`} className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500">
                Images and videos supported • Max 10MB per file
              </p>
            </label>
          </div>

          {/* Media Grid */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {media.map((file, idx) => (
                <MediaPreview 
                  key={idx} 
                  file={file} 
                  index={idx} 
                  platformId={customizePerPlatform ? platformId : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Platform-specific tips */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-900">Platform Tips</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-0.5">
                {platform.id === 'instagram' && (
                  <>
                    <li>• Square images (1:1) work best</li>
                    <li>• Up to 10 images or 1 video per post</li>
                    <li>• First 125 characters show in feed</li>
                  </>
                )}
                {platform.id === 'tiktok' && (
                  <>
                    <li>• Vertical videos (9:16) recommended</li>
                    <li>• Videos between 15-60 seconds perform best</li>
                    <li>• Use trending sounds for better reach</li>
                  </>
                )}
                {platform.id === 'youtube' && (
                  <>
                    <li>• Shorts: Under 60 seconds, vertical format</li>
                    <li>• Add compelling thumbnails for videos</li>
                    <li>• Use timestamps for longer videos</li>
                  </>
                )}
                {platform.id === 'twitter' && (
                  <>
                    <li>• Up to 4 images or 1 video per tweet</li>
                    <li>• Videos up to 2:20 minutes</li>
                    <li>• Use threads for longer content</li>
                  </>
                )}
                {platform.id === 'facebook' && (
                  <>
                    <li>• Landscape images (1.91:1) recommended</li>
                    <li>• Videos should have captions</li>
                    <li>• Tag relevant pages for more reach</li>
                  </>
                )}
                {platform.id === 'linkedin' && (
                  <>
                    <li>• Professional tone works best</li>
                    <li>• Documents and PDFs supported</li>
                    <li>• Add relevant hashtags (3-5)</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="platforms">Platforms ({selectedPlatforms.length})</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 pr-4">
            {/* COMPOSE TAB */}
            <TabsContent value="compose" className="space-y-6 mt-0">
              {/* Platform Selection */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Select Platforms</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {platforms.map((platform) => {
                    const isConnected = connectedPlatforms.includes(platform.id);
                    const isSelected = selectedPlatforms.includes(platform.id);
                    const PlatformIcon = platform.icon;
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        disabled={!isConnected}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all relative",
                          !isConnected && "opacity-50 cursor-not-allowed",
                          isSelected 
                            ? "border-blue-500 bg-blue-50 shadow-md" 
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn("p-2 rounded-lg text-white", platform.color)}>
                            <PlatformIcon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-medium text-center">{platform.name}</span>
                          {!isConnected && (
                            <span className="text-xs text-red-600">Not connected</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedPlatforms.length > 0 && (
                <>
                  {/* Customize Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-sm">Customize per platform</p>
                        <p className="text-xs text-gray-600">Create unique content for each platform</p>
                      </div>
                    </div>
                    <Button
                      variant={customizePerPlatform ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCustomizePerPlatform(!customizePerPlatform)}
                    >
                      {customizePerPlatform ? "Enabled" : "Enable"}
                    </Button>
                  </div>

                  {/* Universal Content or Platform-Specific */}
                  {customizePerPlatform ? (
                    <div className="space-y-6">
                      {selectedPlatforms.map(platformId => (
                        <PlatformContentEditor key={platformId} platformId={platformId} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Universal Editor */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-semibold">Post Content</Label>
                          <Button
                            onClick={handleEnhanceContent}
                            disabled={!postContent.trim() || isEnhancing}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            {isEnhancing ? (
                              <>
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                                Enhancing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                AI Enhance
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <Textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="What's on your mind? Share your thoughts..."
                          className="min-h-[150px] resize-none"
                        />
                        
                        {/* Character Counts */}
                        {selectedPlatforms.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {selectedPlatforms.map(platformId => {
                              const { count, limit, percentage } = getCharacterCount(platformId);
                              const platform = platforms.find(p => p.id === platformId);
                              if (!platform) return null;
                              
                              const isOver = count > limit;
                              const isNear = percentage > 90;
                              
                              return (
                                <Badge
                                  key={platformId}
                                  variant="outline"
                                  className={cn(
                                    "text-xs font-mono",
                                    isOver ? "border-red-500 text-red-700 bg-red-50" :
                                    isNear ? "border-yellow-500 text-yellow-700 bg-yellow-50" :
                                    "border-gray-300"
                                  )}
                                >
                                  {platform.name}: {count}/{limit}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        {aiEnhanced && (
                          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                            <div className="flex items-center gap-2 text-sm text-purple-800">
                              <Zap className="h-4 w-4" />
                              <span className="font-medium">AI Enhanced ✨</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Media Upload */}
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">Media</Label>
                        
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                          )}
                        >
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleMediaUpload(e.target.files)}
                            className="hidden"
                            id="media-upload"
                          />
                          <label htmlFor="media-upload" className="cursor-pointer">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Drag and drop files here or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                              Images and videos supported • Max 10MB per file
                            </p>
                          </label>
                        </div>

                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                            {uploadedImages.map((file, idx) => (
                              <MediaPreview key={idx} file={file} index={idx} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* PLATFORMS TAB */}
            <TabsContent value="platforms" className="space-y-4 mt-0">
              {selectedPlatforms.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No platforms selected</h3>
                  <p className="text-gray-600 mb-4">Select at least one platform to continue</p>
                  <Button onClick={() => setActiveTab('compose')}>
                    Select Platforms
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    const PlatformIcon = platform.icon;
                    const { count, limit } = getCharacterCount(platformId);
                    const media = getPlatformMedia(platformId);

                    return (
                      <div key={platformId} className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg text-white", platform.color)}>
                              <PlatformIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold">{platform.name}</p>
                              <p className="text-xs text-gray-600">{count} / {limit} characters</p>
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        
                        {media.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {media.slice(0, 4).map((file, idx) => (
                              <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border">
                                {file.type.startsWith('video/') ? (
                                  <div className="w-full h-full bg-black flex items-center justify-center">
                                    <FileVideo className="h-6 w-6 text-white" />
                                  </div>
                                ) : (
                                  <img 
                                    src={URL.createObjectURL(file)} 
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                )}
                              </div>
                            ))}
                            {media.length > 4 && (
                              <div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                                +{media.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* SCHEDULE TAB */}
            <TabsContent value="schedule" className="space-y-6 mt-0">
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Schedule Post (Optional)
                </Label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {scheduledDate && (
                  <p className="text-sm text-gray-600 mt-2">
                    Your post will be published on {new Date(scheduledDate).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-blue-900 mb-1">Scheduling Tips</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Best times vary by platform and audience</li>
                      <li>• Schedule posts when your audience is most active</li>
                      <li>• Leave schedule empty to post immediately</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => setShowCreateModal(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            disabled={!postContent.trim() || selectedPlatforms.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="mr-2 h-4 w-4" />
            {scheduledDate ? 'Schedule Post' : 'Post Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;