// src/hooks/api/use-media.ts
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export interface TranscriptionResponse {
  transcription: string;
  duration: number;
  confidence: number;
}

export function useTranscribeAudio() {
  return useMutation({
    mutationFn: async (audioFile: File): Promise<TranscriptionResponse> => {
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      const response = await api.post('/posts/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    },
  });
}