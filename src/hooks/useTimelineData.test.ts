import { renderHook, waitFor } from '@testing-library/react';
import { useTimelineData } from './useTimelineData';

const mockRelativeEventsJson = {
  datum: '2024-01-01',
  events: [
    { id: 'e1', label: 'Event 1', daysOffset: 0 },
    { id: 'e2', label: 'Event 2', daysOffset: 10 },
  ],
};

const mockFixedEventsJson = {
  events: [
    { id: 'f1', label: 'Fixed Event', date: '2024-02-01' },
  ],
};

const datum = new Date('2024-01-01');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('useTimelineData', () => {
  it('starts in loading state', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as jest.Mock;
    const { result } = renderHook(() =>
      useTimelineData(datum, '/events.json'),
    );
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toHaveLength(0);
    expect(result.current.error).toBeUndefined();
  });

  it('loads and resolves relative events', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRelativeEventsJson,
    }) as jest.Mock;

    const { result } = renderHook(() =>
      useTimelineData(datum, '/events.json'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeUndefined();
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0].label).toBe('Event 1');
    expect(result.current.calculatedDates.size).toBe(2);
  });

  it('merges relative and fixed events sorted chronologically', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRelativeEventsJson,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFixedEventsJson,
      }) as jest.Mock;

    const { result } = renderHook(() =>
      useTimelineData(datum, '/events.json', '/fixed.json'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toHaveLength(3);
    // Should be sorted chronologically
    const dates = result.current.events.map((e) => e.date.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it('sets error state on fetch failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as jest.Mock;

    const { result } = renderHook(() =>
      useTimelineData(datum, '/missing.json'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain('404');
    expect(result.current.events).toHaveLength(0);
  });

  it('sets error state on invalid data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    }) as jest.Mock;

    const { result } = renderHook(() =>
      useTimelineData(datum, '/events.json'),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
  });
});
