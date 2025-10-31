import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dateHelpers = {
  // Get start and end of month
  getMonthRange: (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  },

  // Format date for API
  formatForApi: (date: Date) => {
    return date.toISOString();
  },

  // Parse ISO date
  parseISODate: (isoString: string) => {
    return new Date(isoString);
  },

  // Check if date is today
  isToday: (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Format time (e.g., "10:30 AM")
  formatTime: (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  },

  // Format date (e.g., "Oct 31, 2024")
  formatDate: (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  },

  // Format date and time
  formatDateTime: (dateStr: string) => {
    return `${dateHelpers.formatDate(dateStr)} at ${dateHelpers.formatTime(dateStr)}`;
  },

  // Get month name
  getMonthName: (monthIndex: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  },

  // Get month-year string for API (e.g., "2024-10")
  getMonthYearString: (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },
};