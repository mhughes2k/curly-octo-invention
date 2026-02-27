import {
  calculateDateFromDatum,
  calculateDateFromPreviousEvent,
  applyProductionRule,
  validateEventReferences,
  resolveEventChain,
  resolveAllEvents,
} from './dateCalculations';
import { RelativeEventData } from '../types/timeline';

describe('calculateDateFromDatum', () => {
  const datum = new Date('2024-01-10');

  it('adds positive days offset', () => {
    expect(calculateDateFromDatum(datum, 5)).toEqual(new Date('2024-01-15'));
  });

  it('adds zero days offset', () => {
    expect(calculateDateFromDatum(datum, 0)).toEqual(new Date('2024-01-10'));
  });

  it('adds negative days offset', () => {
    expect(calculateDateFromDatum(datum, -3)).toEqual(new Date('2024-01-07'));
  });
});

describe('calculateDateFromPreviousEvent', () => {
  it('adds days to previous event date', () => {
    const prev = new Date('2024-03-01');
    expect(calculateDateFromPreviousEvent(prev, 10)).toEqual(new Date('2024-03-11'));
  });

  it('handles zero offset', () => {
    const prev = new Date('2024-03-01');
    expect(calculateDateFromPreviousEvent(prev, 0)).toEqual(new Date('2024-03-01'));
  });
});

describe('applyProductionRule', () => {
  it('closestWeekday: returns same date if already that day', () => {
    // 2024-01-08 is a Monday
    const monday = new Date('2024-01-08');
    expect(applyProductionRule(monday, 'closestWeekday:monday')).toEqual(monday);
  });

  it('closestWeekday: finds nearest monday from wednesday', () => {
    // 2024-01-10 is Wednesday - prev Monday is Jan 8, next Monday is Jan 15
    const wednesday = new Date('2024-01-10');
    const result = applyProductionRule(wednesday, 'closestWeekday:monday');
    expect(result).toEqual(new Date('2024-01-08')); // 2 days back vs 5 days forward
  });

  it('closestWeekday: finds nearest friday from wednesday', () => {
    // 2024-01-10 is Wednesday - prev Friday is Jan 5, next Friday is Jan 12
    const wednesday = new Date('2024-01-10');
    const result = applyProductionRule(wednesday, 'closestWeekday:friday');
    expect(result).toEqual(new Date('2024-01-12')); // 2 days forward vs 5 days back
  });

  it('skipHolidays: adds a day on Saturday', () => {
    const saturday = new Date('2024-01-06'); // Saturday
    const result = applyProductionRule(saturday, 'skipHolidays:US');
    expect(result).toEqual(new Date('2024-01-07'));
  });

  it('skipHolidays: no change on weekday', () => {
    const monday = new Date('2024-01-08');
    const result = applyProductionRule(monday, 'skipHolidays:US');
    expect(result).toEqual(monday);
  });

  it('businessDaysOnly: returns next Monday from Sunday', () => {
    const sunday = new Date('2024-01-07'); // Sunday
    const result = applyProductionRule(sunday, 'businessDaysOnly');
    expect(result).toEqual(new Date('2024-01-08')); // Monday
  });

  it('businessDaysOnly: no change on weekday', () => {
    const tuesday = new Date('2024-01-09');
    const result = applyProductionRule(tuesday, 'businessDaysOnly');
    expect(result).toEqual(tuesday);
  });

  it('endOfMonth: aligns to last day of month', () => {
    const date = new Date('2024-01-15');
    const result = applyProductionRule(date, 'endOfMonth');
    expect(result.getDate()).toBe(31);
    expect(result.getMonth()).toBe(0);
  });

  it('startOfQuarter: aligns to start of Q2', () => {
    const date = new Date('2024-05-15');
    const result = applyProductionRule(date, 'startOfQuarter');
    expect(result).toEqual(new Date('2024-04-01'));
  });

  it('chains multiple rules', () => {
    // endOfMonth gives Jan 31 (Wednesday), then closestWeekday:friday → Feb 2
    const date = new Date('2024-01-15');
    const result = applyProductionRule(date, 'endOfMonth,closestWeekday:friday');
    // Jan 31 is Wednesday. Prev Friday = Jan 26 (5 days), Next Friday = Feb 2 (2 days)
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(1); // February (0-indexed)
    expect(result.getDate()).toBe(2);
  });
});

describe('validateEventReferences', () => {
  it('returns valid for events with no relative references', () => {
    const events: RelativeEventData[] = [
      { id: 'a', label: 'A', daysOffset: 0 },
      { id: 'b', label: 'B', daysOffset: 5 },
    ];
    const result = validateEventReferences(events);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for correctly referenced events', () => {
    const events: RelativeEventData[] = [
      { id: 'a', label: 'A', daysOffset: 0 },
      { id: 'b', label: 'B', daysOffset: 5, relativeMode: 'fromPreviousEvent', relativeToEventId: 'a' },
    ];
    const result = validateEventReferences(events);
    expect(result.valid).toBe(true);
  });

  it('reports missing reference', () => {
    const events: RelativeEventData[] = [
      { id: 'b', label: 'B', daysOffset: 5, relativeMode: 'fromPreviousEvent', relativeToEventId: 'nonexistent' },
    ];
    const result = validateEventReferences(events);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/unknown event/i);
  });

  it('detects circular dependency', () => {
    const events: RelativeEventData[] = [
      { id: 'a', label: 'A', daysOffset: 0, relativeMode: 'fromPreviousEvent', relativeToEventId: 'b' },
      { id: 'b', label: 'B', daysOffset: 5, relativeMode: 'fromPreviousEvent', relativeToEventId: 'a' },
    ];
    const result = validateEventReferences(events);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /circular/i.test(e))).toBe(true);
  });
});

describe('resolveEventChain', () => {
  const datum = new Date('2024-01-01');

  it('resolves fromDatum events', () => {
    const events: RelativeEventData[] = [
      { id: 'a', label: 'A', daysOffset: 10 },
      { id: 'b', label: 'B', daysOffset: 20 },
    ];
    const result = resolveEventChain(events, datum);
    expect(result.get('a')).toEqual(new Date('2024-01-11'));
    expect(result.get('b')).toEqual(new Date('2024-01-21'));
  });

  it('resolves chain: b depends on a', () => {
    const events: RelativeEventData[] = [
      { id: 'a', label: 'A', daysOffset: 10 },
      { id: 'b', label: 'B', daysOffset: 5, relativeMode: 'fromPreviousEvent', relativeToEventId: 'a' },
    ];
    const result = resolveEventChain(events, datum);
    // a = Jan 1 + 10 = Jan 11; b = Jan 11 + 5 = Jan 16
    expect(result.get('a')).toEqual(new Date('2024-01-11'));
    expect(result.get('b')).toEqual(new Date('2024-01-16'));
  });

  it('resolves three-level chain', () => {
    const events: RelativeEventData[] = [
      { id: 'a', label: 'A', daysOffset: 0 },
      { id: 'b', label: 'B', daysOffset: 7, relativeMode: 'fromPreviousEvent', relativeToEventId: 'a' },
      { id: 'c', label: 'C', daysOffset: 7, relativeMode: 'fromPreviousEvent', relativeToEventId: 'b' },
    ];
    const result = resolveEventChain(events, datum);
    expect(result.get('a')).toEqual(new Date('2024-01-01'));
    expect(result.get('b')).toEqual(new Date('2024-01-08'));
    expect(result.get('c')).toEqual(new Date('2024-01-15'));
  });
});

describe('resolveAllEvents', () => {
  const datum = new Date('2024-01-01');

  it('returns TimelineEvent array with resolved dates', () => {
    const events: RelativeEventData[] = [
      { id: 'a', label: 'Event A', daysOffset: 5 },
    ];
    const result = resolveAllEvents(events, datum);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
    expect(result[0].label).toBe('Event A');
    expect(result[0].date).toEqual(new Date('2024-01-06'));
  });
});
