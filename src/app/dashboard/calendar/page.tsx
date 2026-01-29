"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Grid,
  List,
  Filter,
  Search,
  X,
  Edit2,
  Trash2,
  Send,
  MoreVertical,
  RefreshCw,
  Loader2,
  CalendarDays,
  Copy,
  Eye,
} from "lucide-react";
import {
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Music as TikTokIcon,
  Youtube,
  Video,
} from "lucide-react";

import {
  useCalendarEvents,
  useDeletePost,
  usePublishPost,
  useUpdatePostSchedule,
} from "@/hooks/api/use-calendar";
import { useSocialConnections } from "@/hooks/api/use-social-connections";
import { EnhancedPostCreatorModal } from "@/components/modals/enhanced-post-creaor-modal";
import { useRouter } from "next/navigation";
import { dateHelpers } from "@/lib/utils";
import {
  CalendarEvent,
  CalendarDay,
  Platform,
  PostStatus,
  ViewMode,
} from "@/types/calendar";
import toast from "react-hot-toast";

const platformIcons: Record<Platform, React.ComponentType<any>> = {
  TWITTER: Twitter,
  FACEBOOK: Facebook,
  LINKEDIN: Linkedin,
  INSTAGRAM: Instagram,
  TIKTOK: TikTokIcon,
  YOUTUBE: Youtube,
};

const platformColors: Record<Platform, string> = {
  TWITTER: "#1DA1F2",
  FACEBOOK: "#4267B2",
  LINKEDIN: "#0077B5",
  INSTAGRAM: "#E4405F",
  TIKTOK: "#000000",
  YOUTUBE: "#FF0000",
};

// Platform configs for post creator modal
const PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "bg-sky-500",
    limit: 280,
    maxImages: 4,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-600",
    limit: 3000,
    maxImages: 20,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-700",
    limit: 63206,
    maxImages: 10,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
    limit: 2200,
    maxImages: 10,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-600",
    limit: 5000,
    maxImages: 1,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Video,
    color: "bg-black",
    limit: 2200,
    maxImages: 10,
  },
];

// Utility: Check if a date is in the past (for view-only past dates)
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

// Utility: Check if hour on today is in the past
const isPastHour = (date: Date, hour: number): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If not today, return false (handled by isPastDate)
  if (checkDate.getTime() !== today.getTime()) return false;

  // For today, check if the hour has passed
  return hour <= now.getHours();
};

// Utility: Format date for datetime-local input
const formatScheduleDate = (date?: Date, hour?: number): string => {
  if (!date) return "";
  const scheduleDate = new Date(date);
  if (hour !== undefined) {
    scheduleDate.setHours(hour, 0, 0, 0);
  } else {
    // Default to 9 AM if no hour specified
    scheduleDate.setHours(9, 0, 0, 0);
  }
  // Format for datetime-local input (YYYY-MM-DDTHH:MM)
  const offset = scheduleDate.getTimezoneOffset();
  const localDate = new Date(scheduleDate.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const platformColorsLegacy: Record<Platform, string> = {
  TWITTER: "#1DA1F2",
  FACEBOOK: "#4267B2",
  LINKEDIN: "#0077B5",
  INSTAGRAM: "#E4405F",
  TIKTOK: "#000000",
  YOUTUBE: "#FF0000",
};

const statusConfig: Record<
  PostStatus,
  {
    icon: React.ComponentType<any>;
    color: string;
    label: string;
    bgClass: string;
  }
> = {
  scheduled: {
    icon: Clock,
    color: "#FCD34D",
    label: "Scheduled",
    bgClass: "bg-[#FCD34D]/10",
  },
  posted: {
    icon: CheckCircle,
    color: "#34D399",
    label: "Posted",
    bgClass: "bg-[#34D399]/10",
  },
  failed: {
    icon: XCircle,
    color: "#ef4444",
    label: "Failed",
    bgClass: "bg-red-50",
  },
  processing: {
    icon: AlertCircle,
    color: "#f59e0b",
    label: "Processing",
    bgClass: "bg-amber-50",
  },
  draft: {
    icon: AlertCircle,
    color: "#6b7280",
    label: "Draft",
    bgClass: "bg-gray-50",
  },
};

// Event Detail Modal
interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  onPublish,
}) => {
  if (!event) return null;

  const StatusIcon = statusConfig[event.status].icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusIcon
                  className="w-5 h-5"
                  style={{ color: statusConfig[event.status].color }}
                />
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${statusConfig[event.status].bgClass}`}
                  style={{ color: statusConfig[event.status].color }}
                >
                  {statusConfig[event.status].label}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {event.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Schedule Info */}
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-[#FCD34D]" />
            <div>
              <p className="text-sm text-gray-500">
                {event.is_scheduled ? "Scheduled for" : "Created at"}
              </p>
              <p className="font-medium">
                {dateHelpers.formatDateTime(
                  event.scheduled_for || event.created_at,
                )}
              </p>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Publishing to</p>
            <div className="flex gap-2 flex-wrap">
              {event.platforms.map((platform) => {
                const Icon = platformIcons[platform];
                return (
                  <span
                    key={platform}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: `${platformColors[platform]}15`,
                      color: platformColors[platform],
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {platform}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Full Content */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Post Content</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">
                {event.content}
              </p>
            </div>
          </div>

          {/* Images */}
          {event.image_urls && event.image_urls.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Images</p>
              <div className="grid grid-cols-2 gap-2">
                {event.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Post image ${index + 1}`}
                    className="rounded-lg w-full h-32 object-cover border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {event.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{event.error_message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onEdit(event.id)}
              className="flex-1 bg-[#FCD34D] hover:bg-[#FCD34D]/90 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Post
            </button>

            {event.status === "scheduled" && (
              <button
                onClick={() => onPublish(event.id)}
                className="px-4 py-2 bg-[#34D399]/20 hover:bg-[#34D399]/30 text-[#34D399] rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Send className="w-4 h-4" />
                Publish Now
              </button>
            )}

            <button
              onClick={() => onDelete(event.id)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Calendar Component
export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Modal state for post creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefilledScheduleDate, setPrefilledScheduleDate] =
    useState<string>("");

  // Fetch connected platforms for modal
  const { connections } = useSocialConnections();
  const connectedPlatforms =
    connections?.map((c: any) => c.platform.toLowerCase()) || [];

  // Get date range for current view
  const dateRange = useMemo(() => {
    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }, [currentDate]);

  // Fetch calendar events
  const { data, isLoading, isError, refetch } = useCalendarEvents(
    dateRange.start,
    dateRange.end,
  );

  // Mutations
  const deletePost = useDeletePost();
  const publishPost = usePublishPost();
  const updateSchedule = useUpdatePostSchedule();

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];

    return data.events.filter((event) => {
      // Platform filter
      if (selectedPlatforms.length > 0) {
        const hasSelectedPlatform = event.platforms.some((p) =>
          selectedPlatforms.includes(p),
        );
        if (!hasSelectedPlatform) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.content.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [data?.events, selectedPlatforms, searchQuery]);

  // Generate calendar days
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const days: CalendarDay[] = [];
    const totalSlots = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    const events = filteredEvents || [];

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        const date = new Date(year, month, dayNumber);
        const dateStr = date.toISOString().split("T")[0];
        const dayEvents = events.filter((event) =>
          event.start.startsWith(dateStr),
        );
        days.push({ date, dayNumber, events: dayEvents, isCurrentMonth: true });
      } else {
        days.push({
          date: null,
          dayNumber: null,
          events: [],
          isCurrentMonth: false,
        });
      }
    }
    return days;
  }, [year, month, daysInMonth, startingDayOfWeek, filteredEvents]);

  // Week view days
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  // Get events for specific date/time
  const getEventsForSlot = (date: Date, hour?: number) => {
    if (!filteredEvents) return [];

    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.start);
      const isSameDay = eventDate.toDateString() === date.toDateString();

      if (viewMode === "week" && hour !== undefined) {
        return isSameDay && eventDate.getHours() === hour;
      }
      return isSameDay;
    });
  };

  // Upcoming events for list view
  const upcomingEvents = useMemo(() => {
    if (!filteredEvents) return [];
    const now = new Date();
    return filteredEvents
      .filter((event) => new Date(event.start) >= now)
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [filteredEvents]);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, date: Date, hour?: number) => {
    e.preventDefault();
    if (!draggedEvent) return;

    // Prevent dropping on past dates
    if (isPastDate(date)) {
      toast.error("Cannot reschedule to a past date");
      setDraggedEvent(null);
      setHoveredSlot(null);
      return;
    }

    // Prevent dropping on past hours for today
    if (hour !== undefined && isPastHour(date, hour)) {
      toast.error("Cannot reschedule to a past time");
      setDraggedEvent(null);
      setHoveredSlot(null);
      return;
    }

    const newDate = new Date(date);
    if (hour !== undefined) {
      newDate.setHours(hour, 0, 0, 0);
    }

    try {
      await updateSchedule.mutateAsync({
        postId: draggedEvent.id,
        scheduledFor: newDate.toISOString(),
      });
      toast.success("Post rescheduled successfully");
    } catch (error) {
      toast.error("Failed to reschedule post");
    }

    setDraggedEvent(null);
    setHoveredSlot(null);
  };

  // Event handlers
  const handleEdit = (postId: number) => {
    router.push(`/dashboard/posts/edit/${postId}`);
  };

  const handleDelete = async (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost.mutateAsync(postId);
        toast.success("Post deleted successfully");
        setSelectedEvent(null);
      } catch (error) {
        toast.error("Failed to delete post");
      }
    }
  };

  const handlePublish = async (postId: number) => {
    if (window.confirm("Publish this post now?")) {
      try {
        await publishPost.mutateAsync(postId);
        toast.success("Post is being published");
        setSelectedEvent(null);
      } catch (error) {
        toast.error("Failed to publish post");
      }
    }
  };

  const handleCreatePost = (date?: Date, hour?: number) => {
    // If date provided, validate it's not in the past
    if (date) {
      // Block past dates entirely
      if (isPastDate(date)) {
        return; // Silent block - past dates shouldn't trigger this
      }

      // For today, block past hours
      if (hour !== undefined && isPastHour(date, hour)) {
        return; // Silent block - past hours shouldn't trigger this
      }
    }

    // Format the date for the modal's datetime-local input
    const formattedDate = formatScheduleDate(date, hour);
    setPrefilledScheduleDate(formattedDate);
    setIsCreateModalOpen(true);
  };

  const formatDateRange = () => {
    if (viewMode === "week") {
      const days = getWeekDays();
      const start = days[0];
      const end = days[6];
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return dateHelpers.getMonthName(month) + " " + year;
    }
  };

  // Render week view
  const renderWeekView = () => {
    const days = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200">
        {/* Time grid header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="grid grid-cols-8 gap-0">
            <div className="p-4 text-sm font-semibold text-gray-600 border-r border-gray-200">
              Time
            </div>
            {days.map((day, i) => (
              <div
                key={i}
                className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                  dateHelpers.isToday(day) ? "bg-[#FCD34D]/10" : ""
                }`}
              >
                <div className="text-xs text-gray-500 uppercase mb-1">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-bold ${
                    dateHelpers.isToday(day)
                      ? "text-[#FCD34D]"
                      : "text-gray-900"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time grid body */}
        <div className="relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 gap-0 border-b border-gray-100 last:border-b-0"
            >
              <div className="p-2 text-xs text-gray-500 text-right pr-4 border-r border-gray-200">
                {hour === 0
                  ? "12 AM"
                  : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                      ? "12 PM"
                      : `${hour - 12} PM`}
              </div>
              {days.map((day, dayIndex) => {
                const slotEvents = getEventsForSlot(day, hour);
                const slotKey = `${day.toISOString()}-${hour}`;
                const isSlotPast = isPastDate(day) || isPastHour(day, hour);

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[80px] p-1 border-r border-gray-100 last:border-r-0 transition-colors ${
                      dateHelpers.isToday(day) && !isSlotPast
                        ? "bg-[#FCD34D]/5"
                        : !isSlotPast
                          ? "hover:bg-gray-50"
                          : ""
                    } ${hoveredSlot === slotKey ? "bg-[#FCD34D]/20 ring-1 ring-[#FCD34D]" : ""}
                    ${isSlotPast ? "bg-gray-100/50 opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    onDragOver={!isSlotPast ? handleDragOver : undefined}
                    onDrop={(e) => !isSlotPast && handleDrop(e, day, hour)}
                    onDragEnter={() => !isSlotPast && setHoveredSlot(slotKey)}
                    onDragLeave={() => setHoveredSlot(null)}
                    onClick={() => !isSlotPast && handleCreatePost(day, hour)}
                  >
                    {slotEvents.map((event) => (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        className="mb-1 p-2 rounded-lg text-xs cursor-move hover:scale-105 transition-transform shadow-sm border"
                        style={{
                          backgroundColor: `${event.color}20`,
                          borderColor: event.color,
                        }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock
                            className="w-3 h-3"
                            style={{ color: event.color }}
                          />
                          <span className="font-medium text-gray-700">
                            {new Date(event.start).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium truncate">
                          {event.title}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {event.platforms.map((platform) => {
                            const Icon = platformIcons[platform];
                            return Icon ? (
                              <Icon
                                key={platform}
                                className="w-3 h-3"
                                style={{ color: platformColors[platform] }}
                              />
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const slotKey = day.date
              ? day.date.toISOString()
              : `empty-${index}`;
            const isDatePast = day.date ? isPastDate(day.date) : false;

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 last:border-r-0 ${
                  !day.isCurrentMonth ? "bg-gray-50/50" : ""
                } ${day.date && dateHelpers.isToday(day.date) ? "bg-[#FCD34D]/10 ring-1 ring-[#FCD34D] ring-inset" : !isDatePast ? "hover:bg-gray-50" : ""}
                ${hoveredSlot === slotKey ? "bg-[#FCD34D]/20 ring-2 ring-[#FCD34D]" : ""}
                ${isDatePast ? "bg-gray-100/50 opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                onDragOver={!isDatePast ? handleDragOver : undefined}
                onDrop={(e) =>
                  !isDatePast && day.date && handleDrop(e, day.date)
                }
                onDragEnter={() =>
                  !isDatePast && day.date && setHoveredSlot(slotKey)
                }
                onDragLeave={() => setHoveredSlot(null)}
                onClick={() =>
                  !isDatePast && day.date && handleCreatePost(day.date)
                }
              >
                {day.dayNumber && (
                  <>
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        day.date && dateHelpers.isToday(day.date)
                          ? "text-[#FCD34D]"
                          : "text-gray-700"
                      }`}
                    >
                      {day.dayNumber}
                    </div>
                    <div className="space-y-1">
                      {day.events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="p-1.5 rounded text-xs cursor-move hover:scale-105 transition-transform border"
                          style={{
                            backgroundColor: `${event.color}20`,
                            borderColor: event.color,
                          }}
                        >
                          <p className="text-gray-900 font-medium truncate">
                            {event.title}
                          </p>
                          <div className="flex gap-1 mt-0.5">
                            {event.platforms.slice(0, 3).map((platform) => {
                              const Icon = platformIcons[platform];
                              return Icon ? (
                                <Icon
                                  key={platform}
                                  className="w-2.5 h-2.5"
                                  style={{ color: platformColors[platform] }}
                                />
                              ) : null;
                            })}
                          </div>
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-0.5">
                          +{day.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    const groupedEvents = upcomingEvents.reduce(
      (acc, event) => {
        const date = new Date(event.start).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
      },
      {} as Record<string, CalendarEvent[]>,
    );

    return (
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([date, events]) => (
          <div key={date}>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#FCD34D]" />
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            <div className="space-y-3">
              {events.map((event) => {
                const StatusIcon = statusConfig[event.status].icon;
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[#FCD34D]/50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon
                          className="w-5 h-5 mt-0.5"
                          style={{ color: statusConfig[event.status].color }}
                        />
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(event.start).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h4>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${statusConfig[event.status].bgClass}`}
                        style={{ color: statusConfig[event.status].color }}
                      >
                        {statusConfig[event.status].label}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.content}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {event.platforms.map((platform) => {
                        const Icon = platformIcons[platform];
                        return (
                          <span
                            key={platform}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: `${platformColors[platform]}15`,
                              color: platformColors[platform],
                            }}
                          >
                            {Icon && <Icon className="w-3 h-3" />}
                            {platform}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {upcomingEvents.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No upcoming posts
            </h3>
            <p className="text-gray-500 mb-6">
              Start scheduling your social media content
            </p>
            <button
              onClick={() => handleCreatePost()}
              className="bg-[#FCD34D] hover:bg-[#FCD34D]/90 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Post
            </button>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FCD34D] animate-spin" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load calendar
          </h2>
          <p className="text-gray-600 mb-4">Something went wrong</p>
          <button
            onClick={() => refetch()}
            className="bg-[#FCD34D] hover:bg-[#FCD34D]/90 text-gray-900 px-6 py-2 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Content Calendar
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredEvents.length} posts scheduled for {formatDateRange()}
              </p>
            </div>
            <button
              onClick={() => handleCreatePost()}
              className="bg-[#FCD34D] hover:bg-[#FCD34D]/90 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>

          {/* Controls */}
          <div
            className="flex items-center justify-between gap-4 flex-wrap
           bg-white p-4 rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="px-4 py-2 min-w-[240px] text-center font-semibold text-gray-900">
                  {formatDateRange()}
                </div>
                <button
                  onClick={goToNext}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <button
                onClick={goToToday}
                className="px-4 py-2 bg-[#FCD34D]/20 hover:bg-[#FCD34D]/30 text-gray-900 rounded-lg transition-colors font-medium text-sm"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FCD34D]/50 focus:border-[#FCD34D] transition-all text-sm"
                />
              </div>

              {/* View Mode */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                    viewMode === "week"
                      ? "bg-[#FCD34D] text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Week
                </button>
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                    viewMode === "month"
                      ? "bg-[#FCD34D] text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Month
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                    viewMode === "list"
                      ? "bg-[#FCD34D] text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedPlatforms.length > 0 || searchQuery) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm"
                >
                  {platform}
                  <button
                    onClick={() =>
                      setSelectedPlatforms((prev) =>
                        prev.filter((p) => p !== platform),
                      )
                    }
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {searchQuery && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedPlatforms([]);
                  setSearchQuery("");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Calendar Views */}
        <div className="min-h-[600px]">
          {viewMode === "week" && renderWeekView()}
          {viewMode === "month" && renderMonthView()}
          {viewMode === "list" && renderListView()}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPublish={handlePublish}
          />
        )}

        {/* Post Creator Modal */}
        <EnhancedPostCreatorModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setPrefilledScheduleDate("");
          }}
          platforms={PLATFORMS}
          connectedPlatforms={connectedPlatforms}
          initialScheduledDate={prefilledScheduleDate}
        />
      </div>
    </div>
  );
}
