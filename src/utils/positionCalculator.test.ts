import {
  calculateDateRange,
  calculateScale,
  calculateEventPosition,
  adjustScaleForViewport,
} from './positionCalculator';
import { TimelineEvent } from '../types/timeline';

function makeEvent(id: string, dateStr: string): TimelineEvent {
  return { id, label: id, date: new Date(dateStr) };
}

describe('calculateDateRange', () => {
  it('returns min and max dates', () => {
    const events = [
      makeEvent('a', '2024-01-01'),
      makeEvent('b', '2024-06-15'),
      makeEvent('c', '2024-03-10'),
    ];
    const { min, max } = calculateDateRange(events);
    expect(min).toEqual(new Date('2024-01-01'));
    expect(max).toEqual(new Date('2024-06-15'));
  });

  it('returns same date for single event', () => {
    const events = [makeEvent('a', '2024-05-01')];
    const { min, max } = calculateDateRange(events);
    expect(min).toEqual(max);
  });

  it('throws for empty events', () => {
    expect(() => calculateDateRange([])).toThrow();
  });
});

describe('calculateScale', () => {
  it('returns pixels per day', () => {
    expect(calculateScale(30, 300)).toBe(10);
  });

  it('returns 1 when dateRange is 0', () => {
    expect(calculateScale(0, 300)).toBe(1);
  });

  it('handles fractional result', () => {
    expect(calculateScale(7, 100)).toBeCloseTo(100 / 7);
  });
});

describe('calculateEventPosition', () => {
  it('returns 0 for event at minDate', () => {
    const date = new Date('2024-01-01');
    expect(calculateEventPosition(date, date, 10)).toBe(0);
  });

  it('returns correct pixel position', () => {
    const minDate = new Date('2024-01-01');
    const date = new Date('2024-01-11'); // 10 days later
    expect(calculateEventPosition(date, minDate, 10)).toBe(100);
  });

  it('calculates position with scale 1', () => {
    const minDate = new Date('2024-01-01');
    const date = new Date('2024-01-08'); // 7 days later
    expect(calculateEventPosition(date, minDate, 1)).toBe(7);
  });
});

describe('adjustScaleForViewport', () => {
  it('auto-scales events to fit container', () => {
    const events = [
      makeEvent('a', '2024-01-01'),
      makeEvent('b', '2024-01-11'), // 10 days range
    ];
    const scale = adjustScaleForViewport(events, 200);
    expect(scale).toBe(20); // 200 / 10
  });

  it('handles single event (0 range)', () => {
    const events = [makeEvent('a', '2024-01-01')];
    const scale = adjustScaleForViewport(events, 200);
    expect(scale).toBe(1); // fallback for zero range
  });
});
