// hooks/use-post-creator-state.ts
import { useState, useCallback } from 'react';
import { useEnhanceContent, useGenerateHashtags } from '@/hooks/api/use-posts';
import toast from 'react-hot-toast';

interface PlatformContent {
  text: string;
  media: File[];
}

export function usePostCreatorState() {
  // Core content
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformSpecific, setPlatformSpecific] = useState<Record<string, PlatformContent>>({});
  const [customizePerPlatform, setCustomizePerPlatform] = useState(false);
  
  // Media
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  // Scheduling
  const [scheduledDate, setScheduledDate] = useState('');
  
  // AI Enhancement
  const [selectedTone, setSelectedTone] = useState('engaging');
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [aiEnhancements, setAiEnhancements] = useState<any[]>([]);
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // Hashtags
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  
  // API mutations
  const enhanceMutation = useEnhanceContent();
  const hashtagsMutation = useGenerateHashtags();

  // Toggle platform selection
  const togglePlatform = useCallback((platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  }, []);

  // Media upload handler
  const handleMediaUpload = useCallback((files: FileList | null, platformId?: string) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      
      const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max ${isVideo ? '500MB' : '10MB'}`);
        return false;
      }
      
      return true;
    });

    if (customizePerPlatform && platformId) {
      setPlatformSpecific(prev => ({
        ...prev,
        [platformId]: {
          text: prev[platformId]?.text || '',
          media: [...(prev[platformId]?.media || []), ...newFiles]
        }
      }));
    } else {
      setUploadedMedia(prev => [...prev, ...newFiles]);
    }

    if (newFiles.length > 0) {
      toast.success(`✅ ${newFiles.length} file(s) uploaded`);
    }
  }, [customizePerPlatform]);

  // Remove media
  const removeMedia = useCallback((index: number, platformId?: string) => {
    if (customizePerPlatform && platformId) {
      setPlatformSpecific(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          media: prev[platformId].media.filter((_, i) => i !== index)
        }
      }));
    } else {
      setUploadedMedia(prev => prev.filter((_, i) => i !== index));
    }
  }, [customizePerPlatform]);

  // AI Enhancement
  const handleEnhance = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Please add content first');
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    try {
      const result = await enhanceMutation.mutateAsync({
        content,
        platforms: selectedPlatforms,
        image_count: uploadedMedia.length,
        tone: selectedTone
      });

      setAiEnhancements(result.enhancements);
      setShowAIPanel(true);
      toast.success('✨ Content enhanced for all platforms!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Enhancement failed');
    }
  }, [content, selectedPlatforms, uploadedMedia.length, selectedTone, enhanceMutation]);

  // Generate Hashtags
  const handleGenerateHashtags = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Write some content first');
      return;
    }

    try {
      const result = await hashtagsMutation.mutateAsync({ content, count: 5 });
      setGeneratedHashtags(result);
      toast.success('# Hashtags generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate hashtags');
    }
  }, [content, hashtagsMutation]);

  // Insert all hashtags
  const insertHashtags = useCallback(() => {
    if (generatedHashtags.length === 0) return;
    const hashtagsText = '\n\n' + generatedHashtags.join(' ');
    setContent(prev => prev + hashtagsText);
    toast.success('✅ Hashtags added to content!');
  }, [generatedHashtags]);

  // Use AI enhancement
  const useEnhancement = useCallback((enhancement: any) => {
    if (customizePerPlatform) {
      setPlatformSpecific(prev => ({
        ...prev,
        [enhancement.platform.toLowerCase()]: {
          ...prev[enhancement.platform.toLowerCase()],
          text: enhancement.enhanced_content
        }
      }));
    } else {
      setContent(enhancement.enhanced_content);
    }
    
    setSelectedEnhancement(enhancement.platform);
    toast.success(`✅ Using ${enhancement.platform} version!`);
  }, [customizePerPlatform]);

  // Copy enhancement to clipboard
  const copyEnhancement = useCallback(async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`📋 ${platform} content copied!`);
    } catch (error) {
      toast.error('Failed to copy');
    }
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setContent('');
    setSelectedPlatforms([]);
    setPlatformSpecific({});
    setCustomizePerPlatform(false);
    setUploadedMedia([]);
    setScheduledDate('');
    setAiEnhancements([]);
    setShowAIPanel(false);
    setSelectedEnhancement(null);
    setGeneratedHashtags([]);
    setSelectedTone('engaging');
    setShowToneSelector(false);
  }, []);

  return {
    // State
    content,
    setContent,
    selectedPlatforms,
    setSelectedPlatforms,
    platformSpecific,
    setPlatformSpecific,
    customizePerPlatform,
    setCustomizePerPlatform,
    uploadedMedia,
    setUploadedMedia,
    scheduledDate,
    setScheduledDate,
    dragActive,
    setDragActive,
    selectedTone,
    setSelectedTone,
    showToneSelector,
    setShowToneSelector,
    aiEnhancements,
    setAiEnhancements,
    selectedEnhancement,
    setSelectedEnhancement,
    showAIPanel,
    setShowAIPanel,
    generatedHashtags,
    setGeneratedHashtags,
    
    // Actions
    togglePlatform,
    handleMediaUpload,
    removeMedia,
    handleEnhance,
    handleGenerateHashtags,
    insertHashtags,
    useEnhancement,
    copyEnhancement,
    reset,
    
    // Loading states
    isEnhancing: enhanceMutation.isPending,
    isGeneratingHashtags: hashtagsMutation.isPending,
  };
}