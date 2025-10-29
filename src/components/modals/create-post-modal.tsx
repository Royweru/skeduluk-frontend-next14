import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';
import { 
  ImageIcon, Video, Send, Sparkles, X, Zap, 
  Calendar, CheckCircle2, AlertCircle, 
  Upload, FileVideo, Hash, TrendingUp,
  Image as ImageIconLucide, Wand2, Copy,
  ChevronDown, ChevronUp, Lightbulb, Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useEnhanceContent, useGenerateHashtags, useAIProviders, useCreatePost, useTestAIProviders } from '@/hooks/api/use-posts';
import toast from 'react-hot-toast';

interface PlatformContent {
  text: string;
  media: File[];
  enabled: boolean;
}

interface CreatePostModalProps {
  platforms: any[];
  showCreateModal: boolean;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  connectedPlatforms: any[];
  selectedPlatforms: any[];
  togglePlatform: (platformId: string) => void;
  postContent: string;
  setPostContent: React.Dispatch<React.SetStateAction<string>>;
  uploadedImages: File[];
  setUploadedImages: React.Dispatch<React.SetStateAction<File[]>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scheduledDate: string;
  setScheduledDate: React.Dispatch<React.SetStateAction<string>>;
  onPostCreated?: () => void;
}

const TONES = [
  { value: 'engaging', label: '✨ Engaging', description: 'Captivating and attention-grabbing' },
  { value: 'professional', label: '💼 Professional', description: 'Formal and business-focused' },
  { value: 'casual', label: '😊 Casual', description: 'Friendly and conversational' },
  { value: 'humorous', label: '😄 Humorous', description: 'Witty and entertaining' },
  { value: 'inspirational', label: '🚀 Inspirational', description: 'Motivational and uplifting' },
];

export const CreatePostModal = ({
  platforms,
  showCreateModal,
  setShowCreateModal,
  connectedPlatforms,
  selectedPlatforms,
  togglePlatform,
  postContent,
  setPostContent,
  uploadedImages,
  setUploadedImages,
  setSelectedPlatforms,
  handleImageUpload,
  scheduledDate,
  setScheduledDate,
  onPostCreated
}: CreatePostModalProps) => {
  const [activeTab, setActiveTab] = useState('compose');
  const [platformSpecific, setPlatformSpecific] = useState<Record<string, PlatformContent>>({});
  const [customizePerPlatform, setCustomizePerPlatform] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedTone, setSelectedTone] = useState('engaging');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiEnhancements, setAiEnhancements] = useState<any[]>([]);
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(null);
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [showToneSelector, setShowToneSelector] = useState(false);
  const {data:availableAIProviders} = useTestAIProviders();
  // Hooks
  const createPostMutation = useCreatePost();
  const enhanceMutation = useEnhanceContent();
  const hashtagsMutation = useGenerateHashtags();
  const { data: aiProviders } = useAIProviders();

  const hasAIProvider = aiProviders && Object.values(aiProviders).some(
    (value, index) => index < 5 && value === true
  );
  console.log("Available AI Providers:", availableAIProviders);
  // Initialize platform-specific content
  useEffect(() => {
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

  // AI Enhancement Handler
  const handleEnhanceWithAI = async () => {
    if (!postContent.trim()) {
      toast.error('Please write some content first');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    try {
      const result = await enhanceMutation.mutateAsync({
        content: postContent,
        platforms: selectedPlatforms,
        image_count: uploadedImages.length,
        tone: selectedTone
      });

      setAiEnhancements(result.enhancements);
      setShowAIPanel(true);
      toast.success('🎨 Content enhanced successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to enhance content');
    }
  };

  // Generate Hashtags Handler
  const handleGenerateHashtags = async () => {
    if (!postContent.trim()) {
      toast.error('Please write some content first');
      return;
    }

    try {
      const hashtags = await hashtagsMutation.mutateAsync({
        content: postContent,
        count: 5
      });

      setGeneratedHashtags(hashtags);
      toast.success('✨ Hashtags generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate hashtags');
    }
  };

  // Insert hashtags into content
  const insertHashtags = () => {
    if (generatedHashtags.length === 0) return;
    
    const hashtagsText = '\n\n' + generatedHashtags.join(' ');
    setPostContent(prev => prev + hashtagsText);
    toast.success('Hashtags added to your post!');
  };

  // Use AI enhancement
  const useEnhancement = (enhancement: any) => {
    if (customizePerPlatform) {
      // Apply to specific platform
      setPlatformSpecific(prev => ({
        ...prev,
        [enhancement.platform.toLowerCase()]: {
          ...prev[enhancement.platform.toLowerCase()],
          text: enhancement.enhanced_content
        }
      }));
    } else {
      // Apply to all platforms
      setPostContent(enhancement.enhanced_content);
    }
    
    setSelectedEnhancement(enhancement.platform);
    toast.success(`Using ${enhancement.platform} optimized version ✨`);
  };

  // Copy enhancement to clipboard
  const copyEnhancement = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${platform} version copied!`);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  // Handle post submission
  const handleSubmitPost = async () => {
    if (!postContent.trim()) {
      toast.error('Please add some content');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    // Check for character limit violations
    const violations = selectedPlatforms.filter(platformId => {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform) return false;
      const text = customizePerPlatform ? (platformSpecific[platformId]?.text || '') : postContent;
      return text.length > platform.limit;
    });

    if (violations.length > 0) {
      toast.error('Please fix character limit violations before posting');
      return;
    }

    try {
      const formData = new FormData();
      
      // Add content
      formData.append('original_content', postContent);
      formData.append('platforms', JSON.stringify(selectedPlatforms));

      // Add platform-specific content if customized
      if (customizePerPlatform) {
        const platformContent: Record<string, string> = {};
        selectedPlatforms.forEach(platformId => {
          if (platformSpecific[platformId]?.text) {
            platformContent[platformId] = platformSpecific[platformId].text;
          }
        });
        formData.append('enhanced_content', JSON.stringify(platformContent));
      } else if (aiEnhancements.length > 0 && selectedEnhancement) {
        // Add AI enhanced content
        const enhancedMap = aiEnhancements.reduce((acc, enh) => ({
          ...acc,
          [enh.platform.toLowerCase()]: enh.enhanced_content
        }), {});
        formData.append('enhanced_content', JSON.stringify(enhancedMap));
      }

      // Add schedule
      if (scheduledDate) {
        formData.append('scheduled_for', new Date(scheduledDate).toISOString());
      }

      // Add images/videos
      if (customizePerPlatform) {
        // Add platform-specific media
        selectedPlatforms.forEach(platformId => {
          const media = platformSpecific[platformId]?.media || [];
          media.forEach(file => {
            formData.append(`media_${platformId}`, file);
          });
        });
      } else {
        // Add universal media
        uploadedImages.forEach(file => {
          formData.append('images', file);
        });
      }

      await createPostMutation.mutateAsync(formData);

      // Success - reset form
      setPostContent('');
      setSelectedPlatforms([]);
      setUploadedImages([]);
      setScheduledDate('');
      setAiEnhancements([]);
      setShowAIPanel(false);
      setSelectedEnhancement(null);
      setGeneratedHashtags([]);
      setPlatformSpecific({});
      setCustomizePerPlatform(false);
      setShowCreateModal(false);

      // Call parent callback
      onPostCreated?.();
    } catch (error: any) {
      // Error already handled by mutation
      console.error('Post creation error:', error);
    }
  };

  const handleMediaUpload = (files: FileList | null, platformId?: string) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      
      if (!isUnder10MB) {
        toast.error(`${file.name} is too large. Max 10MB per file.`);
        return false;
      }
      
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

    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) uploaded`);
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
    toast.success('Media removed');
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
      <div className="space-y-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
        {/* Platform Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg text-white", platform.color)}>
              <PlatformIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{platform.name}</p>
              <p className="text-xs text-gray-600">Platform-specific content</p>
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

        {/* Media Upload for this platform */}
        <div>
          <Label className="text-sm font-semibold mb-2 block">Media</Label>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, customizePerPlatform ? platformId : undefined)}
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer",
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
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
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-600">Upload media for {platform.name}</p>
            </label>
          </div>

          {/* Media Grid */}
          {media.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
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
      </div>
    );
  };

  return (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Post
            </DialogTitle>
            {hasAIProvider && (
              <Badge variant="outline" className="gap-1.5">
                <Zap className="h-3 w-3 text-purple-600" />
                AI Active: {aiProviders?.configured_provider}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="compose">✍️ Compose</TabsTrigger>
                <TabsTrigger value="platforms">
                  🎯 Platforms ({selectedPlatforms.length})
                </TabsTrigger>
                <TabsTrigger value="schedule">📅 Schedule</TabsTrigger>
              </TabsList>

              {/* COMPOSE TAB */}
              <TabsContent value="compose" className="space-y-6">
                {/* AI Provider Warning */}
                {!hasAIProvider && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">No AI Provider Configured</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Set up Groq or Gemini API key to use AI enhancement features
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Platform Selection */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Select Platforms *</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                            "p-3 rounded-xl border-2 transition-all relative group",
                            !isConnected && "opacity-50 cursor-not-allowed",
                            isSelected 
                              ? "border-blue-500 bg-blue-50 shadow-md scale-105" 
                              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-1 shadow-lg">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="flex flex-col items-center gap-2">
                            <div className={cn("p-2 rounded-lg text-white transition-transform group-hover:scale-110", platform.color)}>
                              <PlatformIcon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-center">{platform.name}</span>
                            {!isConnected && (
                              <span className="text-[10px] text-red-600">Not connected</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedPlatforms.length > 0 && (
                  <>
                    {/* AI Tone Selector */}
                    {hasAIProvider && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-purple-600" />
                            <span className="font-semibold">AI Enhancement Options</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowToneSelector(!showToneSelector)}
                          >
                            {showToneSelector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>

                        {showToneSelector && (
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                            {TONES.map((tone) => (
                              <button
                                key={tone.value}
                                onClick={() => setSelectedTone(tone.value)}
                                className={cn(
                                  "p-3 rounded-lg border-2 text-left transition-all hover:shadow-md",
                                  selectedTone === tone.value
                                    ? "border-purple-500 bg-white shadow-md"
                                    : "border-gray-200 bg-white/50"
                                )}
                              >
                                <div className="font-medium text-sm mb-0.5">{tone.label}</div>
                                <div className="text-xs text-gray-600">{tone.description}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customize Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Platform-Specific Customization</p>
                          <p className="text-xs text-gray-600">Create unique content for each platform</p>
                        </div>
                      </div>
                      <Button
                        variant={customizePerPlatform ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomizePerPlatform(!customizePerPlatform)}
                      >
                        {customizePerPlatform ? "✓ Enabled" : "Enable"}
                      </Button>
                    </div>

                    {/* Content Editor */}
                    {customizePerPlatform ? (
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Customize for Each Platform
                        </Label>
                        {selectedPlatforms.map(platformId => (
                          <PlatformContentEditor key={platformId} platformId={platformId} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Universal Editor */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-semibold">Post Content *</Label>
                            <div className="flex gap-2">
                              {hasAIProvider && (
                                <>
                                  <Button
                                    onClick={handleGenerateHashtags}
                                    disabled={!postContent.trim() || hashtagsMutation.isPending}
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                  >
                                    {hashtagsMutation.isPending ? (
                                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    ) : (
                                      <Hash className="h-4 w-4" />
                                    )}
                                    Hashtags
                                  </Button>
                                  <Button
                                    onClick={handleEnhanceWithAI}
                                    disabled={!postContent.trim() || enhanceMutation.isPending}
                                    size="sm"
                                    className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                  >
                                    {enhanceMutation.isPending ? (
                                      <>
                                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Enhancing...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-4 w-4" />
                                        Enhance with AI
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <Textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="What's on your mind? Share your thoughts, stories, or announcements..."
                            className="min-h-[180px] resize-none text-base"
                          />
                          
                          {/* Character Counts */}
                          {selectedPlatforms.length > 0 && postContent && (
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
                                      "text-xs font-mono px-3 py-1",
                                      isOver ? "border-red-500 text-red-700 bg-red-50 animate-pulse" :
                                      isNear ? "border-yellow-500 text-yellow-700 bg-yellow-50" :
                                      "border-gray-300"
                                    )}
                                  >
                                    {platform.name}: {count.toLocaleString()}/{limit.toLocaleString()}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}

                          {/* Generated Hashtags */}
                          {generatedHashtags.length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                  <Hash className="h-4 w-4 text-blue-600" />
                                  Generated Hashtags
                                </Label>
                                <Button
                                  onClick={insertHashtags}
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs"
                                >
                                  Add to post
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {generatedHashtags.map((hashtag, idx) => (
                                  <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-blue-100"
                                    onClick={() => {
                                      setPostContent(prev => prev + ' ' + hashtag);
                                      toast.success(`Added ${hashtag}`);
                                    }}
                                  >
                                    {hashtag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
    
                        {/* Media Upload */}
                        <div>
                          <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                            <ImageIconLucide className="h-4 w-4" />
                            Media Files
                          </Label>
                          
                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={cn(
                              "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                              dragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" :
                               "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
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
              <TabsContent value="platforms" className="space-y-4">
                {selectedPlatforms.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mb-4 inline-block p-4 bg-gray-100 rounded-full">
                      <AlertCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No platforms selected</h3>
                    <p className="text-gray-600 mb-6">Select at least one platform to continue</p>
                    <Button onClick={() => setActiveTab('compose')} variant="default">
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
                      const isOver = count > limit;

                      return (
                        <div key={platformId} className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-3 rounded-lg text-white", platform.color)}>
                                <PlatformIcon className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{platform.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={isOver ? "destructive" : "outline"}
                                    className="text-xs font-mono"
                                  >
                                    {count} / {limit}
                                  </Badge>
                                  {media.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {media.length} file{media.length > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          
                          {/* Preview of content */}
                          {postContent && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {customizePerPlatform ? (platformSpecific[platformId]?.text || postContent) : postContent}
                              </p>
                            </div>
                          )}

                          {/* Media Preview */}
                          {media.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                              {media.slice(0, 5).map((file, idx) => (
                                <div key={idx} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200">
                                  {file.type.startsWith('video/') ? (
                                    <div className="w-full h-full bg-black flex items-center justify-center">
                                      <FileVideo className="h-8 w-8 text-white" />
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
                              {media.length > 5 && (
                                <div className="w-20 h-20 flex-shrink-0 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                                  +{media.length - 5}
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
              <TabsContent value="schedule" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Post (Optional)
                    </Label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    />
                    {scheduledDate && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            Scheduled for: {new Date(scheduledDate).toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Optimal Time Suggestions */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-green-900 mb-2">Best Times to Post</p>
                        <div className="space-y-2">
                          {selectedPlatforms.map(platformId => {
                            const platform = platforms.find(p => p.id === platformId);
                            if (!platform) return null;
                            
                            const optimalTimes: Record<string, string> = {
                              twitter: "Wed-Thu, 9 AM - 12 PM",
                              linkedin: "Tue-Thu, 8 AM - 10 AM",
                              facebook: "Wed-Fri, 1 PM - 3 PM",
                              instagram: "Wed, 11 AM - 1 PM",
                              tiktok: "Tue-Thu, 6 PM - 9 PM",
                              youtube: "Thu-Fri, 2 PM - 4 PM"
                            };
                            
                            return (
                              <div key={platformId} className="flex items-center justify-between text-xs">
                                <span className="text-green-800 font-medium">{platform.name}:</span>
                                <span className="text-green-700">{optimalTimes[platformId] || "Varies"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling Tips */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-blue-900 mb-2">Scheduling Tips</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Post when your audience is most active for better engagement</li>
                          <li>• Consider time zones of your target audience</li>
                          <li>• Test different times to find what works best for you</li>
                          <li>• Leave schedule empty to publish immediately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Panel Sidebar */}
          {showAIPanel && aiEnhancements.length > 0 && (
            <div className="w-96 border-l bg-gradient-to-b from-purple-50 to-blue-50 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI Enhancements</h3>
                      <p className="text-xs text-gray-600">Optimized for each platform</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {aiEnhancements.map((enhancement: any) => {
                    const platform = platforms.find(p => p.id === enhancement.platform.toLowerCase());
                    const isSelected = selectedEnhancement === enhancement.platform;
                    
                    return (
                      <div 
                        key={enhancement.platform}
                        className={cn(
                          "p-4 rounded-xl border-2 bg-white transition-all",
                          isSelected ? "border-purple-500 shadow-lg" : "border-gray-200 hover:border-purple-300"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {platform && (
                              <div className={cn("p-1.5 rounded text-white", platform.color)}>
                                {React.createElement(platform.icon, { className: "h-4 w-4" })}
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs font-semibold">
                              {enhancement.platform}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {enhancement.enhanced_content?.length || 0} chars
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
                          {enhancement.enhanced_content}
                        </p>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => useEnhancement(enhancement)}
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            className="flex-1"
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
                            onClick={() => copyEnhancement(enhancement.enhanced_content, enhancement.platform)}
                            size="sm"
                            variant="ghost"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleEnhanceWithAI}
                  disabled={enhanceMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t bg-white">
          <Button
            onClick={() => {
              setShowCreateModal(false);
              setAiEnhancements([]);
              setShowAIPanel(false);
              setGeneratedHashtags([]);
            }}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            disabled={!postContent.trim() || selectedPlatforms.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            onClick={onPostCreated}
          >
            <Send className="mr-2 h-4 w-4" />
            {scheduledDate ? 'Schedule Post' : 'Publish Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};