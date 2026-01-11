// src/components/templates/folder-manager.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Folder,
  Plus,
  Trash2,
  Edit,
  FolderOpen,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  useTemplateFolders,
  useCreateFolder,
  useDeleteFolder,
} from '@/hooks/api/use-templates';

interface FolderManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FOLDER_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#14B8A6', label: 'Teal' },
];

const FOLDER_ICONS = [
  'folder',
  'briefcase',
  'star',
  'heart',
  'bookmark',
  'target',
  'trending-up',
  'zap',
];

export const FolderManager: React.FC<FolderManagerProps> = ({
  open,
  onOpenChange,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [selectedIcon, setSelectedIcon] = useState('folder');

  const { data: folders, isLoading } = useTemplateFolders();
  const createMutation = useCreateFolder();
  const deleteMutation = useDeleteFolder();

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: folderName,
        description: folderDescription || undefined,
        color: selectedColor,
        icon: selectedIcon,
      });

      // Reset form
      setFolderName('');
      setFolderDescription('');
      setSelectedColor('#6366F1');
      setSelectedIcon('folder');
      setShowCreateForm(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (confirm('Are you sure you want to delete this folder? Templates inside will not be deleted.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // Error handled in mutation
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Folders</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create Form */}
          {showCreateForm ? (
            <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 space-y-3">
              <div>
                <Label htmlFor="folder-name">Folder Name *</Label>
                <Input
                  id="folder-name"
                  placeholder="e.g., Marketing Campaigns"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="folder-description">Description</Label>
                <Input
                  id="folder-description"
                  placeholder="Optional description..."
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block">Color</Label>
                <div className="flex gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        selectedColor === color.value &&
                          'ring-4 ring-offset-2 ring-blue-500'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFolderName('');
                    setFolderDescription('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!folderName.trim() || createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Folder'}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowCreateForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Folder
            </Button>
          )}

          {/* Folders List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading folders...</div>
            ) : !folders || folders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No folders yet</p>
                <p className="text-sm">Create your first folder to organize templates</p>
              </div>
            ) : (
              folders.map((folder: any) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: folder.color + '20' }}
                    >
                      <Folder
                        className="h-5 w-5"
                        style={{ color: folder.color }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{folder.name}</p>
                      {folder.description && (
                        <p className="text-xs text-gray-600">{folder.description}</p>
                      )}
                      <Badge variant="secondary" className="text-xs mt-1">
                        {folder.template_count || 0} templates
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};