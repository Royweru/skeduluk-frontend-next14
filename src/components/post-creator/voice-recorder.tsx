// components/post-creator/VoiceRecorder.tsx
"use client";
import { useState, useRef } from "react";
import { Mic, Square, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTranscribeAudio } from "@/hooks/api/use-media";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { mutateAsync: transcribe } = useTranscribeAudio();
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await handleTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      toast.success("🎤 Recording started");
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const result = await transcribe({
        audio: audioBlob,
        auto_proofread: true,
      });

      if (result.success && result.transcription) {
        onTranscriptionComplete(result.transcription);
        toast.success("✨ Transcribed & auto-corrected!");
      } else {
        throw new Error("Transcription failed");
      }
    } catch (error) {
      toast.error("Transcription failed");
      console.error("Transcription error:", error);
    } finally {
      setIsTranscribing(false);
      setDuration(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        variant="outline"
        className={cn(
          "w-full h-24 flex flex-col gap-2.5 transition-all relative overflow-hidden",
          "border-2",
          isRecording && "border-red-500 bg-red-50",
          isTranscribing && "opacity-60 cursor-not-allowed",
          !isRecording &&
            !isTranscribing &&
            "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
        )}
      >
        {/* Background gradient animation */}
        {isRecording && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 animate-pulse" />
        )}

        <div className="relative z-10">
          {isTranscribing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Transcribing...
              </span>
              <span className="text-xs text-blue-700">
                AI is processing your audio
              </span>
            </>
          ) : isRecording ? (
            <>
              <Square className="h-8 w-8 text-red-600" />
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-red-900">
                  Stop Recording
                </span>
                <span className="text-xs text-red-600 font-mono">
                  {formatDuration(duration)}
                </span>
              </div>
            </>
          ) : (
            <>
              <Mic className="h-8 w-8 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">
                Voice to Text
              </span>
              <span className="text-xs text-purple-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Auto-corrects grammar with AI
              </span>
            </>
          )}
        </div>
      </Button>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-1 -right-1 flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <div className="w-3 h-3 bg-red-500 rounded-full" />
        </div>
      )}

      {/* Info banner */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
        <AlertCircle className="h-3 w-3" />
        <span>
          Click to record • AI will transcribe and fix grammar automatically
        </span>
      </div>
    </div>
  );
}
