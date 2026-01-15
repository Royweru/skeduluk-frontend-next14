// hooks/use-post-creator.ts
import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface PlatformContent {
  [platform: string]: string;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export type AITool = 'none' | 'proofread' | 'enhance' | 'hashtags';

export function usePostCreator() {
  const queryClient = useQueryClient();
  
  // Core content state
  const [content, setContent] = useState('');
  const [platformSpecific, setPlatformSpecific] = useState<PlatformContent>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // Media state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // Schedule state
  const [scheduledDate, setScheduledDate] = useState('');
  
  // AI state
  const [activeAITool, setActiveAITool] = useState<AITool>('none');
  const [aiTone, setAiTone] = useState('engaging');
  const [aiEnhancements, setAiEnhancements] = useState<any[]>([]);
  const [proofreading, setProofreading] = useState<{original: string; corrected: string} | null>(null);
  
  // Refs for focus management
  const platformRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const mainEditorRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Focus helper
  const focusPlatformInput = useCallback((platformId: string) => {
    setTimeout(() => {
      platformRefs.current[platformId]?.focus();
    }, 100);
  }, []);
  
  // Proofread mutation
  const proofreadMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch('/api/posts/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      if (!res.ok) throw new Error('Proofreading failed');
      return res.json();
    },
    onSuccess: (data) => {
      setProofreading({
        original: data.original_content,
        corrected: data.corrected_content
      });
      
      if (data.corrections_made) {
        toast.success('✓ Grammar corrections applied');
      } else {
        toast.success('✓ No corrections needed - looks good!');
      }
    },
    onError: () => {
      toast.error('Proofreading failed');
    }
  });
  
  // Enhance mutation
  const enhanceMutation = useMutation({
    mutationFn: async (params: { content: string; platforms: string[]; tone: string }) => {
      const res = await fetch('/api/posts/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: params.content,
          platforms: params.platforms,
          tone: params.tone,
          image_count: mediaFiles.length
        })
      });
      if (!res.ok) throw new Error('Enhancement failed');
      return res.json();
    },
    onSuccess: (data) => {
      setAiEnhancements(data.enhancements);
      toast.success('✨ Content enhanced for each platform');
    },
    onError: () => {
      toast.error('Enhancement failed');
    }
  });
  
  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('🎉 Post created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    }
  });
  
  // Handlers
  const handleProofread = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content first');
      return;
    }
    setActiveAITool('proofread');
    await proofreadMutation.mutateAsync(content);
    setActiveAITool('none');
  };
  
  const handleEnhance = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) {
      toast.error('Please enter content and select platforms');
      return;
    }
    setActiveAITool('enhance');
    await enhanceMutation.mutateAsync({
      content,
      platforms: selectedPlatforms,
      tone: aiTone
    });
    setActiveAITool('none');
  };
  
  const handleMediaUpload = useCallback((files: File[]) => {
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image' as 'image' | 'video'
    }));
    setMediaFiles(prev => [...prev, ...newMedia]);
  }, []);
  
  const removeMedia = useCallback((index: number) => {
    setMediaFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);
  
  const applyProofreadCorrections = () => {
    if (proofreading) {
      setContent(proofreading.corrected);
      setProofreading(null);
      toast.success('✓ Corrections applied');
    }
  };
  
  const applyEnhancement = (platform: string, enhancedText: string) => {
    setPlatformSpecific(prev => ({
      ...prev,
      [platform.toLowerCase()]: enhancedText
    }));
    toast.success(`✓ Applied enhancement for ${platform}`);
  };
  
  const createPost = async () => {
    const formData = new FormData();
    formData.append('original_content', content);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    
    if (Object.keys(platformSpecific).length > 0) {
      formData.append('platform_specific_content', JSON.stringify(platformSpecific));
    }
    
    if (scheduledDate) {
      formData.append('scheduled_for', new Date(scheduledDate).toISOString());
    }
    
    mediaFiles.forEach(media => {
      if (media.type === 'image') {
        formData.append('images', media.file);
      } else {
        formData.append('videos', media.file);
      }
    });
    
    if (audioFile) {
      formData.append('audio', audioFile);
    }
    
    await createMutation.mutateAsync(formData);
  };
  
  const reset = () => {
    setContent('');
    setPlatformSpecific({});
    setSelectedPlatforms([]);
    mediaFiles.forEach(m => URL.revokeObjectURL(m.preview));
    setMediaFiles([]);
    setAudioFile(null);
    setScheduledDate('');
    setAiEnhancements([]);
    setProofreading(null);
  };
  
  return {
    // State
    content,
    setContent,
    platformSpecific,
    setPlatformSpecific,
    selectedPlatforms,
    setSelectedPlatforms,
    mediaFiles,
    audioFile,
    setAudioFile,
    scheduledDate,
    setScheduledDate,
    activeAITool,
    aiTone,
    setAiTone,
    aiEnhancements,
    proofreading,
    setProofreading,
    
    // Refs
    platformRefs,
    mainEditorRef,
    
    // Actions
    handleProofread,
    handleEnhance,
    handleMediaUpload,
    removeMedia,
    applyProofreadCorrections,
    applyEnhancement,
    createPost,
    reset,
    focusPlatformInput,
    
    // Loading states
    isCreating: createMutation.isPending,
    isProofreading: proofreadMutation.isPending,
    isEnhancing: enhanceMutation.isPending,
  };
}