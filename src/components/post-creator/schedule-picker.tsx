import { Calendar, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { usePostCreator} from '@/hooks/api/use-post-creator';
export function SchedulePicker() {
  const { scheduledDate, setScheduledDate } = usePostCreator();

  // Get current datetime in local timezone for min attribute
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Schedule Your Post
        </h4>
        <p className="text-xs text-gray-600">
          Choose when you want this post to be published. Leave empty to publish immediately.
        </p>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Date & Time (Optional)
        </Label>
        <input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          min={minDateTime}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all text-base"
        />
      </div>

      {scheduledDate && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-green-900">
            ✓ Post Scheduled
          </p>
          <p className="text-xs text-green-700">
            This post will be published on:{' '}
            <strong>{new Date(scheduledDate).toLocaleString()}</strong>
          </p>
        </div>
      )}

      {!scheduledDate && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            📤 Post will be published <strong>immediately</strong> when you click "Publish Now"
          </p>
        </div>
      )}
    </div>
  );
}