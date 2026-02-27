import {
  addDays,
  endOfMonth,
  startOfQuarter,
  isWeekend,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
  previousMonday,
  previousTuesday,
  previousWednesday,
  previousThursday,
  previousFriday,
  previousSaturday,
  previousSunday,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
  differenceInDays,
} from 'date-fns';
import { RelativeEventData, TimelineEvent } from '../types/timeline';

export function calculateDateFromDatum(datum: Date, daysOffset: number): Date {
  return addDays(datum, daysOffset);
}

export function calculateDateFromPreviousEvent(previousDate: Date, daysOffset: number): Date {
  return addDays(previousDate, daysOffset);
}

type WeekdayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const IS_DAY: Record<WeekdayName, (date: Date) => boolean> = {
  monday: isMonday,
  tuesday: isTuesday,
  wednesday: isWednesday,
  thursday: isThursday,
  friday: isFriday,
  saturday: isSaturday,
  sunday: isSunday,
};

const NEXT_DAY: Record<WeekdayName, (date: Date) => Date> = {
  monday: nextMonday,
  tuesday: nextTuesday,
  wednesday: nextWednesday,
  thursday: nextThursday,
  friday: nextFriday,
  saturday: nextSaturday,
  sunday: nextSunday,
};

const PREV_DAY: Record<WeekdayName, (date: Date) => Date> = {
  monday: previousMonday,
  tuesday: previousTuesday,
  wednesday: previousWednesday,
  thursday: previousThursday,
  friday: previousFriday,
  saturday: previousSaturday,
  sunday: previousSunday,
};

function applyClosestWeekday(date: Date, dayName: string): Date {
  const day = dayName.toLowerCase() as WeekdayName;
  if (IS_DAY[day] && IS_DAY[day](date)) return date;
  if (!NEXT_DAY[day]) return date;
  const next = NEXT_DAY[day](date);
  const prev = PREV_DAY[day](date);
  const diffNext = Math.abs(differenceInDays(next, date));
  const diffPrev = Math.abs(differenceInDays(prev, date));
  return diffNext <= diffPrev ? next : prev;
}

function applySingleRule(date: Date, rule: string): Date {
  if (rule.startsWith('closestWeekday:')) {
    const dayName = rule.slice('closestWeekday:'.length);
    return applyClosestWeekday(date, dayName);
  }
  if (rule.startsWith('skipHolidays:')) {
    // Simplified: add 1 day if weekend
    return isWeekend(date) ? addDays(date, 1) : date;
  }
  if (rule === 'businessDaysOnly') {
    // Find next Monday if on weekend
    if (!isWeekend(date)) return date;
    return nextMonday(date);
  }
  if (rule === 'endOfMonth') {
    return endOfMonth(date);
  }
  if (rule === 'startOfQuarter') {
    return startOfQuarter(date);
  }
  return date;
}

export function applyProductionRule(date: Date, rule: string): Date {
  const rules = rule.split(',').map((r) => r.trim()).filter(Boolean);
  return rules.reduce((d, r) => applySingleRule(d, r), date);
}

export function validateEventReferences(events: RelativeEventData[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set(events.map((e) => e.id));

  // Check all relativeToEventId references exist
  for (const event of events) {
    if (event.relativeMode === 'fromPreviousEvent' && event.relativeToEventId) {
      if (!ids.has(event.relativeToEventId)) {
        errors.push(`Event "${event.id}" references unknown event "${event.relativeToEventId}"`);
      }
    }
  }

  // Detect circular dependencies using DFS
  const adj = new Map<string, string[]>();
  for (const event of events) {
    adj.set(event.id, []);
    if (event.relativeMode === 'fromPreviousEvent' && event.relativeToEventId && ids.has(event.relativeToEventId)) {
      adj.get(event.id)!.push(event.relativeToEventId);
    }
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>(events.map((e) => [e.id, WHITE]));

  function dfs(node: string): boolean {
    color.set(node, GRAY);
    for (const neighbor of adj.get(node) ?? []) {
      if (color.get(neighbor) === GRAY) return true; // cycle
      if (color.get(neighbor) === WHITE && dfs(neighbor)) return true;
    }
    color.set(node, BLACK);
    return false;
  }

  for (const event of events) {
    if (color.get(event.id) === WHITE) {
      if (dfs(event.id)) {
        errors.push(`Circular dependency detected involving event "${event.id}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function resolveEventChain(events: RelativeEventData[], datum: Date): Map<string, Date> {
  const cache = new Map<string, Date>();
  const byId = new Map(events.map((e) => [e.id, e]));

  function resolve(id: string, visited: Set<string>): Date {
    if (cache.has(id)) return cache.get(id)!;
    if (visited.has(id)) throw new Error(`Circular dependency at event "${id}"`);

    const event = byId.get(id);
    if (!event) throw new Error(`Unknown event "${id}"`);

    visited.add(id);
    let date: Date;
    if (event.relativeMode === 'fromPreviousEvent' && event.relativeToEventId) {
      const prevDate = resolve(event.relativeToEventId, visited);
      date = calculateDateFromPreviousEvent(prevDate, event.daysOffset);
    } else {
      date = calculateDateFromDatum(datum, event.daysOffset);
    }

    if (event.productionRule) {
      date = applyProductionRule(date, event.productionRule);
    }

    visited.delete(id);
    cache.set(id, date);
    return date;
  }

  for (const event of events) {
    resolve(event.id, new Set());
  }

  return cache;
}

export function resolveAllEvents(events: RelativeEventData[], datum: Date): TimelineEvent[] {
  const dateMap = resolveEventChain(events, datum);
  return events.map((event) => ({
    id: event.id,
    label: event.label,
    description: event.description,
    date: dateMap.get(event.id)!,
    category: event.category,
    metadata: event.metadata,
  }));
}
