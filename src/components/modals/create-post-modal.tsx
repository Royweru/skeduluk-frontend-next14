import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { cn } from '@/lib/utils';
import { ImageIcon, Mic, Send, Sparkles, X, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

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
}:{
    platforms:any[],
    showCreateModal:boolean,
    setShowCreateModal:React.Dispatch<React.SetStateAction<boolean>>,
    connectedPlatforms:any[],
    selectedPlatforms:any[],
    togglePlatform:(platformId:string)=>void,
    postContent:string,
    setPostContent:React.Dispatch<React.SetStateAction<string>>,
    aiEnhanced:boolean,
    isEnhancing:boolean,
    handleEnhanceContent:()=>void,
    uploadedImages:File[],
    setUploadedImages:React.Dispatch<React.SetStateAction<File[]>>,
    handleImageUpload:(e:React.ChangeEvent<HTMLInputElement>)=>void,
    scheduledDate:string,
    setScheduledDate:React.Dispatch<React.SetStateAction<string>>,
}) => {
  return (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Post
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              
              {/* Platform Selection */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Select Platforms</Label>
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
                          "p-4 rounded-xl border-2 transition-all",
                          !isConnected && "opacity-50 cursor-not-allowed",
                          isSelected 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn("p-3 rounded-lg text-white", platform.color)}>
                            <PlatformIcon className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium">{platform.name}</span>
                          {!isConnected && (
                            <span className="text-xs text-red-600">Not connected</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Input */}
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
                  onChange={(e:any) => setPostContent(e.target.value)}
                  placeholder="What's on your mind? Share your thoughts..."
                  className="min-h-[150px] resize-none"
                />
                
                {/* Character Count */}
                {selectedPlatforms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPlatforms.map(platformId => {
                      const platform = platforms.find(p => p.id === platformId);
                      if (!platform) return null;
                      
                      const isOver = postContent.length > platform.limit;
                      const isNear = postContent.length > platform.limit * 0.9;
                      
                      return (
                        <div
                          key={platformId}
                          className={cn(
                            "text-xs px-3 py-1 rounded-full font-medium",
                            isOver ? "bg-red-100 text-red-700" :
                            isNear ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          )}
                        >
                          {platform.name}: {postContent.length}/{platform.limit}
                        </div>
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
                <Label className="text-sm font-semibold mb-3 block">Add Media</Label>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload Images</p>
                    </div>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer">
                    <Mic className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Record Audio</p>
                  </div>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img 
                          src={URL.createObjectURL(img)} 
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Schedule (Optional)</Label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
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
            </div>
          </DialogContent>
        </Dialog>
  )
}

export default CreatePostModal