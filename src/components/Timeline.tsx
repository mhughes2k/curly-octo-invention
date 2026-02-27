import React, { useState, useRef } from 'react';
import { TimelineProps, TimelineEvent } from '../types/timeline';
import { calculateDateRange } from '../utils/positionCalculator';
import { useTimelineData } from '../hooks/useTimelineData';
import { useTimelineScroll } from '../hooks/useTimelineScroll';
import { useTimelineLayout } from '../hooks/useTimelineLayout';
import TimelineContainer from './TimelineContainer';
import TimelineTrack from './TimelineTrack';
import TimelineAxis from './TimelineAxis';
import '../styles/timeline.css';

export default function Timeline({
  datum,
  relativeEventsUrl,
  fixedEventsUrl,
  orientation,
  scale: defaultScale,
  onEventClick,
}: TimelineProps): React.ReactElement {
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const { events, loading, error } = useTimelineData(datum, relativeEventsUrl, fixedEventsUrl);
  const { scrollRef } = useTimelineScroll(orientation);
  const { scale } = useTimelineLayout(orientation, containerRef, events, defaultScale);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEventId(event.id);
    onEventClick?.(event);
  };

  if (loading) {
    return <div className="timeline-loading">Loading...</div>;
  }

  if (error) {
    return <div className="timeline-error">{error}</div>;
  }

  if (events.length === 0) {
    return <div className="timeline-empty">No events to display</div>;
  }

  const { min: minDate, max: maxDate } = calculateDateRange(events);

  return (
    <div ref={containerRef} className="timeline-wrapper">
      <TimelineContainer orientation={orientation}>
        <TimelineTrack
          events={events}
          selectedEventId={selectedEventId}
          minDate={minDate}
          scale={scale}
          orientation={orientation}
          onEventClick={handleEventClick}
          scrollRef={scrollRef}
        />
        <TimelineAxis
          minDate={minDate}
          maxDate={maxDate}
          scale={scale}
          orientation={orientation}
        />
      </TimelineContainer>
    </div>
  );
}
