import { useState, useRef } from "react";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTranscribeAudio } from "@/hooks/api/use-media";

interface VoiceTranscriptionProps {
  onTranscriptionComplete: (text: string) => void;
  autoProofread?: boolean;
}

export function VoiceTranscription({
  onTranscriptionComplete,
  autoProofread = true,
}: VoiceTranscriptionProps) {
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

      // Update duration
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
        auto_proofread: autoProofread,
      });

      if (result.success && result.transcription) {
        onTranscriptionComplete(result.transcription);
        toast.success(
          autoProofread
            ? "✨ Transcribed & auto-corrected!"
            : "✓ Transcription complete",
        );
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
          "w-full h-20 flex flex-col gap-2 transition-all",
          isRecording && "border-red-500 bg-red-50 animate-pulse",
          isTranscribing && "opacity-60",
        )}
      >
        {isTranscribing ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-sm">Transcribing...</span>
          </>
        ) : isRecording ? (
          <>
            <Square className="h-6 w-6 text-red-600" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold">Stop Recording</span>
              <span className="text-xs text-red-600">
                {formatDuration(duration)}
              </span>
            </div>
          </>
        ) : (
          <>
            <Mic className="h-6 w-6 text-gray-600" />
            <span className="text-sm">Voice to Text</span>
            {autoProofread && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Auto-corrects grammar
              </span>
            )}
          </>
        )}
      </Button>

      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
}
