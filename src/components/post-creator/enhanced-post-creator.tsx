'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Image as ImageIcon, Mic, Send, X, Zap, 
  AlertTriangle, Clock, Calendar, Loader2
} from 'lucide-react';
import { useCreatePost, useEnhanceContent, useTranscribeAudio } from '@/hooks/api/use-posts';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Platform {
  id: string;
  name: string;
  icon: any;
  color: string;
  limit: number;
  maxImages: number;
}

interface EnhancedPostCreatorProps {
  platforms: Platform[];
  connectedPlatforms: string[];
  onSuccess?: () => void;
}

export function EnhancedPostCreator({ platforms, connectedPlatforms, onSuccess }: EnhancedPostCreatorProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiEnhancements, setAiEnhancements] = useState<any[]>([]);
  const [useEnhanced, setUseEnhanced] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const createPostMutation = useCreatePost();
  const enhanceMutation = useEnhanceContent();
  const transcribeMutation = useTranscribeAudio();

  // Validation
  const validationIssues = selectedPlatforms.map(platformId => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return null;
    
    const issues = [];
    if (content.length > platform.limit) {
      issues.push({
        type: 'error',
        message: `Content exceeds ${platform.limit} chars for ${platform.name}`
      });
    }
    if (images.length > platform.maxImages) {
      issues.push({
        type: 'error',
        message: `Too many images for ${platform.name} (max: ${platform.maxImages})`
      });
    }
    return { platform: platform.name, issues };
  }).filter(Boolean);

  const hasErrors = validationIssues.some(v => v?.issues.some(i => i.type === 'error'));

  const handleEnhance = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) {
      toast.error('Add content and select platforms');
      return;
    }

    try {
      const result = await enhanceMutation.mutateAsync({
        content,
        platforms: selectedPlatforms,
        image_count: images.length
      });
      
      setAiEnhancements(result.enhancements);
      setUseEnhanced(true);
      toast.success('Content enhanced!');
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        
        try {
          const result = await transcribeMutation.mutateAsync(audioFile);
          setContent(prev => prev ? `${prev}\n\n${result.transcription}` : result.transcription);
          toast.success('Audio transcribed!');
        } catch (error) {
          // Error handled in mutation
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    if (!connectedPlatforms.includes(platformId)) {
      toast.error('Platform not connected');
      return;
    }
    
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please add content');
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }
    
    if (hasErrors) {
      toast.error('Fix validation errors first');
      return;
    }

    const formData = new FormData();
    formData.append('original_content', content);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    
    if (useEnhanced && aiEnhancements.length > 0) {
      const enhancedMap = aiEnhancements.reduce((acc, enh) => ({
        ...acc,
        [enh.platform.toLowerCase()]: enh.enhanced_content
      }), {});
      formData.append('enhanced_content', JSON.stringify(enhancedMap));
    }
    
    if (scheduledDate) {
      formData.append('scheduled_for', new Date(scheduledDate).toISOString());
    }
    
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      await createPostMutation.mutateAsync(formData);
      
      // Reset form
      setContent('');
      setSelectedPlatforms([]);
      setImages([]);
      setScheduledDate('');
      setAiEnhancements([]);
      setUseEnhanced(false);
      
      onSuccess?.();
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Select Platforms *</Label>
        <div className="grid grid-cols-3 gap-3">
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
                  "p-4 rounded-xl border-2 transition-all relative",
                  !isConnected && "opacity-50 cursor-not-allowed",
                  isSelected 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={cn("p-3 rounded-lg text-white", platform.color)}>
                    <PlatformIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-center">{platform.name}</span>
                  {!isConnected && (
                    <Badge variant="destructive" className="text-[10px] px-2 py-0">
                      Not Connected
                    </Badge>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Enhanced Content Preview */}
      {aiEnhancements.length > 0 && (
        <div className="rounded-xl p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-semibold text-purple-900">AI Enhanced Versions</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useEnhanced}
                onChange={(e) => setUseEnhanced(e.target.checked)}
                className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-purple-800 font-medium">Use enhanced</span>
            </label>
          </div>
          
          <div className="space-y-3">
            {aiEnhancements.map((enhancement: any) => {
              const platform = platforms.find(p => p.id === enhancement.platform.toLowerCase());
              return (
                <div key={enhancement.platform} className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {platform?.name || enhancement.platform}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {enhancement.enhanced_content?.length || 0} characters
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {enhancement.enhanced_content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold">Post Content *</Label>
          <Button
            onClick={handleEnhance}
            disabled={!content.trim() || selectedPlatforms.length === 0 || enhanceMutation.isPending}
            size="sm"
            variant="outline"
            className="gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50"
          >
            {enhanceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share your thoughts, ideas, or announcements..."
          className={cn(
            "min-h-[150px] resize-none text-base",
            hasErrors && "border-red-300 bg-red-50"
          )}
        />
        
        {/* Character Counters */}
        {selectedPlatforms.length > 0 && content && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedPlatforms.map(platformId => {
              const platform = platforms.find(p => p.id === platformId);
              if (!platform) return null;
              
              const isOver = content.length > platform.limit;
              const isNear = content.length > platform.limit * 0.9;
              
              return (
                <div
                  key={platformId}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium",
                    isOver ? "bg-red-100 text-red-700 border border-red-300" :
                    isNear ? "bg-yellow-100 text-yellow-700 border border-yellow-300" :
                    "bg-gray-100 text-gray-600"
                  )}
                >
                  {platform.name}: {content.length.toLocaleString()}/{platform.limit.toLocaleString()}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-2">Please fix these issues:</p>
              <ul className="space-y-1">
                {validationIssues.map((v: any, idx: number) => 
                  v?.issues.map((issue: any, issueIdx: number) => (
                    <li key={`${idx}-${issueIdx}`} className="text-xs text-red-700">
                      • {issue.message}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Media Upload & Voice */}
      <div className="grid grid-cols-2 gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Upload Images</p>
            <p className="text-xs text-gray-500 mt-1">Click to browse</p>
          </div>
        </label>
        
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={transcribeMutation.isPending}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-all",
            isRecording 
              ? "border-red-400 bg-red-50" 
              : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
          )}
        >
          <Mic className={cn(
            "h-8 w-8 mx-auto mb-2",
            isRecording ? "text-red-600 animate-pulse" : "text-gray-400"
          )} />
          <p className="text-sm font-medium text-gray-700">
            {transcribeMutation.isPending ? 'Transcribing...' : isRecording ? 'Stop Recording' : 'Record Audio'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isRecording ? 'Click to stop' : 'Voice to text'}
          </p>
        </button>
      </div>

      {/* Uploaded Images Preview */}
      {images.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-2 block">
            Uploaded Images ({images.length})
          </Label>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                <img 
                  src={URL.createObjectURL(img)} 
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      <div>
        <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Schedule Post (Optional)
        </Label>
        <input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {scheduledDate && (
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Post will be published on {new Date(scheduledDate).toLocaleString()}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || selectedPlatforms.length === 0 || hasErrors || createPostMutation.isPending}
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {scheduledDate ? 'Scheduling...' : 'Publishing...'}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              {scheduledDate ? 'Schedule Post' : 'Publish Now'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}