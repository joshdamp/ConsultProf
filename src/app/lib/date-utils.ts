import { format, parse, addDays, startOfWeek, isBefore, isAfter, isSameDay } from 'date-fns';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TIME_SLOTS = (() => {
  const slots: string[] = [];
  const start = 7 * 60; // 7:00 AM in minutes
  const end = 20 * 60 + 45; // 8:45 PM in minutes
  const interval = 75; // 1 hour 15 minutes
  
  for (let minutes = start; minutes <= end; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
  }
  
  return slots;
})();

// Time slot pairs for start-end selection
export const TIME_SLOT_PAIRS = (() => {
  const pairs: Array<{ start: string; end: string; label: string }> = [];
  const slots = TIME_SLOTS;
  
  for (let i = 0; i < slots.length - 1; i++) {
    const start = slots[i];
    const end = slots[i + 1];
    pairs.push({
      start,
      end,
      label: `${formatTime(start + ':00')} - ${formatTime(end + ':00')}`
    });
  }
  
  return pairs;
})();

export function formatTime(time: string): string {
  try {
    const date = parse(time, 'HH:mm:ss', new Date());
    return format(date, 'h:mm a');
  } catch {
    return time;
  }
}

export function formatDate(date: string): string {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return date;
  }
}

export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
  return Array.from({ length: 5 }, (_, i) => addDays(monday, i));
}

export function isTimeInRange(time: string, start: string, end: string): boolean {
  const timeDate = parse(time, 'HH:mm', new Date());
  const startDate = parse(start, 'HH:mm', new Date());
  const endDate = parse(end, 'HH:mm', new Date());
  
  return (isAfter(timeDate, startDate) || isSameDay(timeDate, startDate)) && 
         (isBefore(timeDate, endDate) || isSameDay(timeDate, endDate));
}

export function parseTimeString(timeStr: string): string {
  // Convert "HH:MM:SS" or "HH:MM" to "HH:MM"
  return timeStr.split(':').slice(0, 2).join(':');
}
