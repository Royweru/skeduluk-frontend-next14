// src/hooks/api/use-templates.ts
import api, { templatesApi } from '@/lib/api';
import { TemplateSearchParams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';






// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export const useTemplates = (params: TemplateSearchParams = {}) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesApi.search(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTemplate = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesApi.getById(id),
    enabled: enabled && !!id,
  });
};

export const useTemplateAnalytics = (id: number) => {
  return useQuery({
    queryKey: ['template-analytics', id],
    queryFn: () => templatesApi.getAnalytics(id),
    enabled: !!id,
  });
};

export const useTemplateCategories = () => {
  return useQuery({
    queryKey: ['template-categories'],
    queryFn: () => templatesApi.getCategories(),
  });
};

export const useTemplateFolders = () => {
  return useQuery({
    queryKey: ['template-folders'],
    queryFn: () => templatesApi.getFolders(),
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully! 🎉');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create template');
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', data.id] });
      toast.success('Template updated! ✨');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update template');
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete template');
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update favorite status');
    },
  });
};

export const useUseTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      templatesApi.useTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created from template! 🚀');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to use template');
    },
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-folders'] });
      toast.success('Folder created! 📁');
    },
    onError: (error: any) => {
      toast.error('Failed to create folder');
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-folders'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Folder deleted');
    },
    onError: (error: any) => {
      toast.error('Failed to delete folder');
    },
  });
};