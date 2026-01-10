// src/hooks/api/use-templates.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'hashtags' | 'url';
  placeholder: string;
  required: boolean;
  default_value?: string;
}

export interface Template {
  id: number;
  user_id?: number;
  name: string;
  description?: string;
  category: string;
  content_template: string;
  variables?: TemplateVariable[];
  platform_variations?: Record<string, string>;
  supported_platforms: string[];
  tone: string;
  suggested_hashtags?: string[];
  suggested_media_type?: string;
  is_public: boolean;
  is_system: boolean;
  is_favorite: boolean;
  usage_count: number;
  success_rate: number;
  avg_engagement?: Record<string, number>;
  folder_id?: number;
  thumbnail_url?: string;
  color_scheme: string;
  icon: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export interface TemplateFolder {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  template_count?: number;
  created_at: string;
}

export interface TemplateSearchParams {
  query?: string;
  category?: string;
  tone?: string;
  platforms?: string;
  is_favorite?: boolean;
  folder_id?: number;
  include_system?: boolean;
  include_community?: boolean;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  offset?: number;
}

export interface TemplateAnalytics {
  total_uses: number;
  success_rate: number;
  avg_engagement_rate: number;
  platform_breakdown: Record<string, number>;
  recent_posts: Array<{
    post_id: number;
    platform: string;
    engagement_rate: number;
    likes: number;
    comments: number;
    shares: number;
    posted_at: string;
  }>;
  engagement_trend: Array<{
    date: string;
    engagement_rate: number;
  }>;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const templatesApi = {
  search: async (params: TemplateSearchParams) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await axios.get(
      `${API_URL}/templates/search?${queryParams.toString()}`,
      getAuthHeaders()
    );
    return response.data;
  },

  getById: async (id: number): Promise<Template> => {
    const response = await axios.get(
      `${API_URL}/templates/${id}`,
      getAuthHeaders()
    );
    return response.data;
  },

  create: async (data: Partial<Template>) => {
    const response = await axios.post(
      `${API_URL}/templates/`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  update: async ({ id, data }: { id: number; data: Partial<Template> }) => {
    const response = await axios.put(
      `${API_URL}/templates/${id}`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  delete: async (id: number) => {
    await axios.delete(`${API_URL}/templates/${id}`, getAuthHeaders());
  },

  toggleFavorite: async (id: number) => {
    const response = await axios.post(
      `${API_URL}/templates/${id}/favorite`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  use: async (id: number, data: any) => {
    const response = await axios.post(
      `${API_URL}/templates/use/${id}`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  getAnalytics: async (id: number): Promise<TemplateAnalytics> => {
    const response = await axios.get(
      `${API_URL}/templates/${id}/analytics`,
      getAuthHeaders()
    );
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(
      `${API_URL}/templates/categories/list`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Folders
  createFolder: async (data: Partial<TemplateFolder>) => {
    const response = await axios.post(
      `${API_URL}/templates/folders`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  getFolders: async (): Promise<TemplateFolder[]> => {
    const response = await axios.get(
      `${API_URL}/templates/folders`,
      getAuthHeaders()
    );
    return response.data;
  },

  deleteFolder: async (id: number) => {
    await axios.delete(`${API_URL}/templates/folders/${id}`, getAuthHeaders());
  },
};

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
      templatesApi.use(id, data),
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