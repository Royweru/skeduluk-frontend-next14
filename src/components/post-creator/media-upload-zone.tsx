// components/post-creator/MediaUploadZone.tsx
import { Upload, Image, Video, FileVideo, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPreview } from './media-preview';

interface MediaUploadZoneProps {
  uploadedMedia: File[];
  onMediaUpload: (files: FileList | null) => void;
  onMediaRemove: (index: number) => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  platformId?: string;
}

export function MediaUploadZone({
  uploadedMedia,
  onMediaUpload,
  onMediaRemove,
  dragActive,
  setDragActive,
  platformId
}: MediaUploadZoneProps) {
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      onMediaUpload(e.dataTransfer.files);
    }
  };

  const inputId = platformId ? `media-${platformId}` : 'media-upload';
  
  const imageCount = uploadedMedia.filter(f => f.type.startsWith('image/')).length;
  const videoCount = uploadedMedia.filter(f => f.type.startsWith('video/')).length;

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold flex items-center gap-2">
        <FileImage className="h-4 w-4 text-indigo-600" />
        Media Files
        {uploadedMedia.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {uploadedMedia.length} file{uploadedMedia.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </label>
      
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group",
          "hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50",
          dragActive 
            ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg ring-4 ring-blue-200" 
            : "border-gray-300 hover:border-blue-400"
        )}
      >
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => onMediaUpload(e.target.files)}
          className="hidden"
          id={inputId}
        />
        
        <label htmlFor={inputId} className="cursor-pointer">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
            "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:scale-110",
            dragActive && "scale-110 rotate-12"
          )}>
            <Upload className="h-8 w-8 text-white" />
          </div>
          
          <p className="text-base font-semibold text-gray-700 mb-2">
            {dragActive ? '📦 Drop files here!' : '📁 Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 mb-3">
            or click to browse your files
          </p>
          
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <FileImage className="h-3 w-3 text-blue-500" />
              <span>Images (10MB max)</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1">
              <FileVideo className="h-3 w-3 text-purple-500" />
              <span>Videos (500MB max)</span>
            </div>
          </div>
        </label>
      </div>

      {/* Media Grid */}
      {uploadedMedia.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Uploaded ({uploadedMedia.length})
            </p>
            <p className="text-xs text-gray-500">
              {imageCount} image{imageCount !== 1 ? 's' : ''} • {' '}
              {videoCount} video{videoCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadedMedia.map((file, idx) => (
              <MediaPreview
                key={idx}
                file={file}
                index={idx}
                onRemove={() => onMediaRemove(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium", className)}>
      {children}
    </span>
  );
}