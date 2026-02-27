import React from 'react';
import Timeline from '../components/Timeline';

export function TimelineExample() {
  return (
    <Timeline
      datum={new Date('2026-02-27')}
      relativeEventsUrl="/data/events.json"
      fixedEventsUrl="/data/fixed-events.json"
      orientation="horizontal"
      onEventClick={(event) => console.log('Clicked:', event.label, event.date)}
    />
  );
}

export default TimelineExample;
