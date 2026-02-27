import { differenceInDays } from 'date-fns';
import { TimelineEvent } from '../types/timeline';

export function calculateDateRange(events: TimelineEvent[]): { min: Date; max: Date } {
  if (events.length === 0) throw new Error('No events provided');
  const dates = events.map((e) => e.date.getTime());
  return {
    min: new Date(Math.min(...dates)),
    max: new Date(Math.max(...dates)),
  };
}

export function calculateScale(dateRange: number, containerSize: number): number {
  if (dateRange === 0) return 1;
  return containerSize / dateRange;
}

export function calculateEventPosition(date: Date, minDate: Date, scale: number): number {
  const days = differenceInDays(date, minDate);
  return days * scale;
}

export function adjustScaleForViewport(events: TimelineEvent[], containerSize: number): number {
  const { min, max } = calculateDateRange(events);
  const rangeDays = differenceInDays(max, min);
  return calculateScale(rangeDays, containerSize);
}
