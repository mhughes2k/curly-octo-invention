import { useState, useEffect, useCallback } from 'react';
import { TimelineEvent } from '../types/timeline';
import { validateRelativeEventsJson, validateFixedEventsJson } from '../utils/validation';
import { resolveAllEvents } from '../utils/dateCalculations';

type UseTimelineDataResult = {
  events: TimelineEvent[];
  loading: boolean;
  error: string | undefined;
  calculatedDates: Map<string, Date>;
};

export function useTimelineData(
  datum: Date,
  relativeEventsUrl: string,
  fixedEventsUrl?: string,
): UseTimelineDataResult {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [calculatedDates, setCalculatedDates] = useState<Map<string, Date>>(new Map());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const relativeRes = await fetch(relativeEventsUrl);
      if (!relativeRes.ok) throw new Error(`Failed to fetch relative events: ${relativeRes.status}`);
      const relativeJson = await relativeRes.json();
      const relativeData = validateRelativeEventsJson(relativeJson);
      const resolvedEvents = resolveAllEvents(relativeData.events, datum);

      // Cache calculated dates
      const dateMap = new Map<string, Date>();
      for (const e of resolvedEvents) {
        dateMap.set(e.id, e.date);
      }

      let fixedEvents: TimelineEvent[] = [];
      if (fixedEventsUrl) {
        const fixedRes = await fetch(fixedEventsUrl);
        if (!fixedRes.ok) throw new Error(`Failed to fetch fixed events: ${fixedRes.status}`);
        const fixedJson = await fixedRes.json();
        const fixedData = validateFixedEventsJson(fixedJson);
        fixedEvents = fixedData.events.map((e) => ({
          id: e.id,
          label: e.label,
          description: e.description,
          date: new Date(e.date),
          category: e.category,
          metadata: e.metadata,
        }));
        for (const e of fixedEvents) {
          dateMap.set(e.id, e.date);
        }
      }

      const merged = [...resolvedEvents, ...fixedEvents].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );

      setCalculatedDates(dateMap);
      setEvents(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [datum, relativeEventsUrl, fixedEventsUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { events, loading, error, calculatedDates };
}
