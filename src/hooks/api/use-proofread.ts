import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface ProofreadRequest {
  content: string;
  style?: string;
}

interface ProofreadResponse {
  original_content: string;
  corrected_content: string;
  corrections_made: boolean;
  confidence_score: number;
}

export function useProofreadContent() {
  return useMutation({
    mutationFn: async (data: ProofreadRequest): Promise<ProofreadResponse> => {
      const response = await api.post('/posts/proofread', data);
      return response.data;
    },
  });
}