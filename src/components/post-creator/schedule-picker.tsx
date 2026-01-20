// components/post-creator/SchedulePicker.tsx
import { Label } from '@/components/ui/label';
import { Calendar, Clock, TrendingUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchedulePickerProps {
  scheduledDate: string;
  setScheduledDate: (date: string) => void;
  selectedPlatforms: string[];
  platforms: Array<{ id: string; name: string }>;
}

const OPTIMAL_TIMES: Record<string, string> = {
  twitter: "Wed-Thu, 9 AM - 12 PM",
  linkedin: "Tue-Thu, 8 AM - 10 AM",
  facebook: "Wed-Fri, 1 PM - 3 PM",
  instagram: "Wed, 11 AM - 1 PM",
  tiktok: "Tue-Thu, 6 PM - 9 PM",
  youtube: "Thu-Fri, 2 PM - 4 PM"
};

export function SchedulePicker({
  scheduledDate,
  setScheduledDate,
  selectedPlatforms,
  platforms
}: SchedulePickerProps) {
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          Schedule Post (Optional)
        </Label>
        <input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          min={minDateTime}
          className={cn(
            "w-full px-4 py-3 border-2 rounded-xl transition-all text-base",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            scheduledDate ? "border-blue-400 bg-blue-50" : "border-gray-200"
          )}
        />
        {scheduledDate && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Scheduled for: {new Date(scheduledDate).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Optimal Times */}
      {selectedPlatforms.length > 0 && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 bg-white rounded-xl shadow-sm">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-green-900 mb-1">
                Optimal Posting Times
              </p>
              <p className="text-xs text-green-700">
                Best times based on platform analytics
              </p>
            </div>
          </div>
          
          <div className="space-y-2.5">
            {selectedPlatforms.map(platformId => {
              const platform = platforms.find(p => p.id === platformId);
              if (!platform) return null;
              
              return (
                <div 
                  key={platformId} 
                  className="flex items-center justify-between p-3 rounded-lg bg-white/70 border border-green-200"
                >
                  <span className="text-sm font-medium text-green-900">
                    {platform.name}
                  </span>
                  <span className="text-xs text-green-700 font-mono">
                    {OPTIMAL_TIMES[platformId] || "Varies"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-5 rounded-xl bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-blue-900 mb-2">
              Scheduling Tips
            </p>
            <ul className="text-xs text-blue-700 space-y-1.5 leading-relaxed">
              <li>• Post when your audience is most active for better engagement</li>
              <li>• Consider time zones of your target audience</li>
              <li>• Test different times to find what works best</li>
              <li>• Leave empty to publish immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}