'use client'
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  CalendarDays, 
  Grid, 
  List, 
  Eye, 
  Edit, 
  Trash2,
  Loader2,
  RefreshCw
} from 'lucide-react';

import { useCalendarEvents} from '@/hooks/api/use-calendar';
import { useDeletePost,usePublishPost } from '@/hooks/api/use-posts';
import { useRouter } from 'next/navigation';
import { dateHelpers } from '@/lib/utils';
import { CalendarEvent,CalendarDay } from '@/types';

const platformColors = {
  TWITTER: '#1DA1F2',
  FACEBOOK: '#4267B2',
  LINKEDIN: '#0077B5',
  INSTAGRAM: '#E4405F',
  TIKTOK: '#000000',
  YOUTUBE: '#FF0000'
};

type PostStatus = 'scheduled' | 'posted' | 'failed' | 'processing' | 'draft';

const statusConfig: Record<PostStatus, { 
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
  color: string; 
  label: string;
}> = {
  scheduled: { icon: Clock, color: '#3b82f6', label: 'Scheduled' },
  posted: { icon: CheckCircle, color: '#10b981', label: 'Posted' },
  failed: { icon: XCircle, color: '#ef4444', label: 'Failed' },
  processing: { icon: AlertCircle, color: '#f59e0b', label: 'Processing' },
  draft: { icon: AlertCircle, color: '#6b7280', label: 'Draft' }
};

// Event Detail Modal Component
const EventModal = ({ 
  event, 
  onClose, 
  onEdit, 
  onDelete, 
  onPublish 
}: { 
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
}) => {
  if (!event) return null;

  const StatusIcon = statusConfig[event.status].icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusIcon 
                  className="w-5 h-5" 
                  style={{ color: statusConfig[event.status].color }}
                />
                <span 
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${statusConfig[event.status].color}20`,
                    color: statusConfig[event.status].color
                  }}
                >
                  {statusConfig[event.status].label}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white">{event.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Schedule Info */}
          <div className="flex items-center gap-3 text-gray-300">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">
                {event.is_scheduled ? 'Scheduled for' : 'Created at'}
              </p>
              <p className="font-medium">
                {dateHelpers.formatDateTime(event.scheduled_for || event.created_at)}
              </p>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Publishing to</p>
            <div className="flex gap-2 flex-wrap">
              {event.platforms.map(platform => (
                <span
                  key={platform}
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: `${platformColors[platform as keyof typeof platformColors]}20`,
                    color: platformColors[platform as keyof typeof platformColors]
                  }}
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Full Content */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Post Content</p>
            <div className="bg-[#0f1419] p-4 rounded-lg border border-gray-700">
              <p className="text-gray-200 whitespace-pre-wrap">{event.content}</p>
            </div>
          </div>

          {/* Images */}
          {event.image_urls && event.image_urls.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Images</p>
              <div className="grid grid-cols-2 gap-2">
                {event.image_urls.map((url, index) => (
                  <img 
                    key={index} 
                    src={url} 
                    alt={`Post image ${index + 1}`}
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {event.error_message && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{event.error_message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button 
              onClick={() => onEdit(event.id)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Post
            </button>
            
            {event.status === 'scheduled' && (
              <button 
                onClick={() => onPublish(event.id)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Publish Now
              </button>
            )}
            
            <button 
              onClick={() => onDelete(event.id)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
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
const CalendarPage = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Get date range for current month
  const dateRange = useMemo(() => {
    return dateHelpers.getMonthRange(currentDate);
  }, [currentDate]);

  // Fetch calendar events
  const { data, isLoading, isError, refetch } = useCalendarEvents(
    dateRange.start,
    dateRange.end
  );

  // Mutations
  const deletePost = useDeletePost();
  const publishPost = usePublishPost();

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const days: CalendarDay[] = [];
    const totalSlots = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    const events = data?.events || [];
    
    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      if (dayNumber > 0 && dayNumber <= daysInMonth) {
        const date = new Date(year, month, dayNumber);
        const dateStr = date.toISOString().split('T')[0];
        const dayEvents = events.filter(event => 
          event.start.startsWith(dateStr)
        );
        days.push({ date, dayNumber, events: dayEvents, isCurrentMonth: true });
      } else {
        days.push({ date: null, dayNumber: null, events: [], isCurrentMonth: false });
      }
    }
    return days;
  }, [year, month, daysInMonth, startingDayOfWeek, data]);

  // Filter events for list view
  const upcomingEvents = useMemo(() => {
    if (!data?.events) return [];
    const now = new Date();
    return data.events
      .filter((event:any) => new Date(event.start) >= now)
      .sort((a:any, b:any) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [data]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleEdit = (postId: number) => {
    router.push(`/posts/edit/${postId}`);
  };

  const handleDelete = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost.mutateAsync(postId);
      setSelectedEvent(null);
    }
  };

  const handlePublish = async (postId: number) => {
    if (window.confirm('Publish this post now?')) {
      await publishPost.mutateAsync(postId);
      setSelectedEvent(null);
    }
  };

  const handleCreatePost = () => {
     router.push('/posts/create');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to load calendar</h2>
          <p className="text-gray-400 mb-4">Something went wrong</p>
          <button 
            onClick={() => refetch()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Content Calendar</h1>
            <p className="text-gray-400">
              {data?.total || 0} posts scheduled for {dateHelpers.getMonthName(month)} {year}
            </p>
          </div>
          <button 
            onClick={handleCreatePost}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-[#1a1f2e] p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {dateHelpers.getMonthName(month)} {year}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
            >
              Today
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-[#0f1419] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'month' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === 'month' ? (
        <div className="bg-[#1a1f2e] rounded-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-[#0f1419] border-b border-gray-700">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-3 border-r border-b border-gray-700 ${
                  !day.isCurrentMonth ? 'bg-[#0f1419] opacity-50' : ''
                } ${dateHelpers.isToday(day.date!) ? 'bg-blue-500/10' : ''} hover:bg-gray-700/30 transition-colors cursor-pointer`}
                onClick={() => day.date && setSelectedDate(day.date)}
              >
                {day.dayNumber && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      dateHelpers.isToday(day.date!) ? 'text-blue-400' : 'text-gray-300'
                    }`}>
                      {day.dayNumber}
                    </div>
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="text-xs p-2 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: `${event.color}20`,
                            borderLeft: `3px solid ${event.color}`
                          }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" style={{ color: event.color }} />
                            <span style={{ color: event.color }}>
                              {dateHelpers.formatTime(event.start)}
                            </span>
                          </div>
                          <div className="text-gray-300 truncate">{event.title}</div>
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-gray-400 text-center py-1">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="bg-[#1a1f2e] rounded-lg p-12 text-center">
              <CalendarDays className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No upcoming posts</h3>
              <p className="text-gray-500 mb-6">Start scheduling your social media content</p>
              <button 
                onClick={handleCreatePost}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Post
              </button>
            </div>
          ) : (
            upcomingEvents.map(event => {
              const StatusIcon = statusConfig[event.status].icon;
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-[#1a1f2e] rounded-lg p-6 hover:bg-[#1f2937] transition-colors cursor-pointer border border-gray-700 hover:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <StatusIcon 
                        className="w-5 h-5" 
                        style={{ color: statusConfig[event.status].color }}
                      />
                      <div>
                        <p className="text-sm text-gray-400">
                          {dateHelpers.formatDate(event.start)}
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {dateHelpers.formatTime(event.start)}
                        </p>
                      </div>
                    </div>
                    <span 
                      className="text-sm font-medium px-3 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `${statusConfig[event.status].color}20`,
                        color: statusConfig[event.status].color
                      }}
                    >
                      {statusConfig[event.status].label}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-white mb-3">{event.title}</h3>
                  
                  <div className="flex gap-2 flex-wrap">
                    {event.platforms.map(platform => (
                      <span
                        key={platform}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${platformColors[platform as keyof typeof platformColors]}20`,
                          color: platformColors[platform as keyof typeof platformColors]
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

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
    </div>
  );
};

export default CalendarPage;