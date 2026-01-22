// src/hooks/api/use-media.ts
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export interface TranscriptionResponse {
  transcription: string;
  language?: string;
  duration?: number;
  success: boolean;
}

export function useTranscribeAudio() {
  return useMutation({
    mutationFn: async ({
      audio,
      auto_proofread = true,
    }: {
      audio: File | Blob;
      auto_proofread?: boolean;
    }): Promise<TranscriptionResponse> => {
      const formData = new FormData();
      formData.append("audio", audio, "recording.webm");
      formData.append("auto_proofread", String(auto_proofread));

      const response = await api.post("/posts/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },
  });
}
