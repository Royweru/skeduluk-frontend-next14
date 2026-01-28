// components/post-creator/ToneSelector.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = [
  {
    value: "engaging",
    label: "Engaging",
    icon: "✨",
    desc: "Captivating and energetic",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    value: "professional",
    label: "Professional",
    icon: "💼",
    desc: "Formal and authoritative",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    value: "casual",
    label: "Casual",
    icon: "😊",
    desc: "Relaxed and friendly",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    value: "humorous",
    label: "Humorous",
    icon: "😄",
    desc: "Witty and playful",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    value: "inspirational",
    label: "Inspirational",
    icon: "🚀",
    desc: "Motivating and uplifting",
    gradient: "from-red-500 to-pink-500",
  },
];

interface ToneSelectorProps {
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  showToneSelector: boolean;
  setShowToneSelector: (show: boolean) => void;
}

export function ToneSelector({
  selectedTone,
  setSelectedTone,
  showToneSelector,
  setShowToneSelector,
}: ToneSelectorProps) {
  const currentTone = TONES.find((t) => t.value === selectedTone);

  return (
    <div className="rounded-xl overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div
        className="p-4 cursor-pointer select-none bg-white/50 backdrop-blur-sm"
        onClick={() => setShowToneSelector(!showToneSelector)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-md">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-purple-900">
                AI Enhancement Tone
              </p>
              <p className="text-xs text-purple-700">
                {currentTone ? (
                  <>
                    <span className="mr-1">{currentTone.icon}</span>
                    {currentTone.label} - {currentTone.desc}
                  </>
                ) : (
                  "Select a tone for AI enhancement"
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-purple-100">
            {showToneSelector ? (
              <ChevronUp className="h-4 w-4 text-purple-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-purple-600" />
            )}
          </Button>
        </div>
      </div>

      {/* Tone Options */}
      {showToneSelector && (
        <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-3">
            {TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => {
                  setSelectedTone(tone.value);
                  setShowToneSelector(false);
                }}
                className={cn(
                  "group relative p-4 rounded-xl border-2 text-left transition-all",
                  "hover:shadow-lg hover:scale-105 active:scale-95",
                  selectedTone === tone.value
                    ? "border-purple-500 bg-white shadow-lg ring-2 ring-purple-200"
                    : "border-white/50 bg-white/80 hover:border-purple-300",
                )}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br",
                    tone.gradient,
                  )}
                />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{tone.icon}</span>
                    {selectedTone === tone.value && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
                    )}
                  </div>
                  <div className="font-semibold text-sm mb-0.5 text-gray-900">
                    {tone.label}
                  </div>
                  <div className="text-xs text-gray-600 leading-tight">
                    {tone.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Helper text */}
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> AI will adapt your content to match the
              selected tone while optimizing for each platform's best practices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
