import { useCallback } from 'react';
import { Upload, X, Image, Video } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { usePostCreator } from '@/hooks/api/use-post-creator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function MediaManager() {
  const { mediaFiles, handleMediaUpload, removeMedia } = usePostCreator();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file sizes
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

    const validFiles = acceptedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max ${isImage ? '10MB' : '500MB'}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      handleMediaUpload(validFiles);
      toast.success(`${validFiles.length} file(s) added`);
    }
  }, [handleMediaUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    maxSize: 500 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
          isDragActive 
            ? "border-blue-500 bg-blue-50 scale-105" 
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn(
          "h-12 w-12 mx-auto mb-4 transition-colors",
          isDragActive ? "text-blue-600" : "text-gray-400"
        )} />
        <p className="text-sm font-medium mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-gray-500">
          or click to browse • Images (max 10MB) • Videos (max 500MB)
        </p>
      </div>

      {/* Media Preview Grid */}
      {mediaFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">
              Uploaded Media ({mediaFiles.length})
            </p>
            <Badge variant="outline" className="text-xs">
              {mediaFiles.filter(f => f.type === 'image').length} images, {' '}
              {mediaFiles.filter(f => f.type === 'video').length} videos
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {mediaFiles.map((media, index) => (
              <MediaPreview
                key={`${media.file.name}-${index}`}
                media={media}
                onRemove={() => removeMedia(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MediaPreviewProps {
  media: { file: File; preview: string; type: 'image' | 'video' };
  onRemove: () => void;
}

function MediaPreview({ media, onRemove }: MediaPreviewProps) {
  const isVideo = media.type === 'video';

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all">
      {isVideo ? (
        <video 
          src={media.preview} 
          className="w-full h-full object-cover" 
          muted 
        />
      ) : (
        <img 
          src={media.preview} 
          alt={media.file.name} 
          className="w-full h-full object-cover" 
        />
      )}

      {/* Type Badge */}
      <Badge 
        className="absolute top-2 left-2 text-xs"
        variant={isVideo ? "default" : "secondary"}
      >
        {isVideo ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
        {isVideo ? 'Video' : 'Image'}
      </Badge>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Filename Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white text-xs truncate">{media.file.name}</p>
        <p className="text-white/70 text-[10px]">
          {(media.file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
}