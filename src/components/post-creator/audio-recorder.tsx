"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

import { useTranscribeAudio } from "@/hooks/api/use-media";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { mutateAsync: transcribe } = useTranscribeAudio();
  const [transcribing, setTranscribing] = useState(false);
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
        await handleTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Update duration every second
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
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
    setTranscribing(true);
    try {
      const result = await transcribe({
        audio: audioBlob,
        auto_proofread: true,
      });

      if (result.success && result.transcription) {
        onTranscriptionComplete(result.transcription);
        toast.success("Transcription complete!");
      } else {
        throw new Error("Transcription failed");
      }
    } catch (error) {
      toast.error("Failed to transcribe audio");
    } finally {
      setTranscribing(false);
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
        disabled={transcribing}
        variant="outline"
        className={cn(
          "w-full h-24 flex flex-col gap-2 transition-all",
          isRecording && "border-red-500 bg-red-50 animate-pulse",
          transcribing && "opacity-60",
        )}
      >
        {transcribing ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm">Transcribing...</span>
          </>
        ) : isRecording ? (
          <>
            <Square className="h-8 w-8 text-red-600" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold">Stop Recording</span>
              <span className="text-xs text-red-600">
                {formatDuration(duration)}
              </span>
            </div>
          </>
        ) : (
          <>
            <Mic className="h-8 w-8 text-gray-600" />
            <span className="text-sm">Record Idea</span>
            <span className="text-xs text-gray-500">Voice to text</span>
          </>
        )}
      </Button>

      {isRecording && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
        <AlertCircle className="h-3 w-3" />
        Click to record, AI will auto-correct grammar
      </div>
    </div>
  );
}
