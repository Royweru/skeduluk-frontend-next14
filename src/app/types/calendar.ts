// types/calendar.ts

export type PostStatus = 'scheduled' | 'posted' | 'failed' | 'processing' | 'draft';

export type Platform = 'TWITTER' | 'FACEBOOK' | 'LINKEDIN' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE';

export interface CalendarEvent {
  id: number;
  title: string;
  content: string;
  start: string;
  end: string;
  platforms: Platform[];
  status: PostStatus;
  tags?: string[];
  image_urls?: string[];
  color: string;
  scheduled_for?: string;
  created_at: string;
  error_message?: string;
}

export interface CalendarDay {
  date: Date | null;
  dayNumber: number | null;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  start_date: string;
  end_date: string;
  total: number;
}

export interface CalendarFilters {
  platforms: Platform[];
  tags: string[];
  status: PostStatus[];
  searchQuery: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export type ViewMode = 'week' | 'month' | 'list';

export interface DraggedEvent {
  event: CalendarEvent;
  sourceDate: Date;
  sourceHour?: number;
}

export interface TimeSlot {
  date: Date;
  hour: number;
  events: CalendarEvent[];
}

export interface CalendarSettings {
  defaultView: ViewMode;
  startOfWeek: number; // 0 = Sunday, 1 = Monday
  timezone: string;
  showWeekends: boolean;
  compactView: boolean;
}