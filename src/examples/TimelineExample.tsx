import React, { useState } from 'react';
import Timeline from '../components/Timeline';

export function TimelineExample() {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <button
          style={{ padding: '0.3rem 0.75rem', borderRadius: 4, border: '1px solid #d1d5db', background: orientation === 'horizontal' ? '#3b82f6' : '#fff', color: orientation === 'horizontal' ? '#fff' : '#374151', cursor: 'pointer' }}
          onClick={() => setOrientation('horizontal')}
        >
          Horizontal
        </button>
        <button
          style={{ padding: '0.3rem 0.75rem', borderRadius: 4, border: '1px solid #d1d5db', background: orientation === 'vertical' ? '#3b82f6' : '#fff', color: orientation === 'vertical' ? '#fff' : '#374151', cursor: 'pointer' }}
          onClick={() => setOrientation('vertical')}
        >
          Vertical
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <Timeline
          datum={new Date('2026-02-27')}
          relativeEventsUrl="/data/events.json"
          fixedEventsUrl="/data/fixed-events.json"
          orientation={orientation}
          onEventClick={(event) => console.log('Clicked:', event.label, event.date)}
        />
      </div>
    </div>
  );
}

export default TimelineExample;
