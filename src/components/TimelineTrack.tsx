import React from 'react';
import { TimelineEvent } from '../types/timeline';
import { calculateEventPosition } from '../utils/positionCalculator';
import TimelineEventComponent from './TimelineEvent';
import TimelineConnector from './TimelineConnector';

type TimelineTrackProps = {
  events: TimelineEvent[];
  selectedEventId?: string;
  minDate: Date;
  scale: number;
  orientation: 'horizontal' | 'vertical';
  onEventClick?: (event: TimelineEvent) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
};

export default function TimelineTrack({
  events,
  selectedEventId,
  minDate,
  scale,
  orientation,
  onEventClick,
  scrollRef,
}: TimelineTrackProps): React.ReactElement {
  const positions = events.map((e) => calculateEventPosition(e.date, minDate, scale));

  return (
    <div className={`timeline-track ${orientation}`} ref={scrollRef}>
      {events.map((event, i) => (
        <TimelineEventComponent
          key={event.id}
          event={event}
          isSelected={event.id === selectedEventId}
          position={positions[i]}
          orientation={orientation}
          onClick={onEventClick}
        />
      ))}
      {events.length > 1 &&
        events.slice(0, -1).map((_, i) => (
          <TimelineConnector
            key={`connector-${i}`}
            fromPosition={positions[i]}
            toPosition={positions[i + 1]}
            orientation={orientation}
          />
        ))}
    </div>
  );
}
