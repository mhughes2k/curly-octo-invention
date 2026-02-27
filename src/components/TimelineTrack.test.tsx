import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineTrack from './TimelineTrack';
import { TimelineEvent } from '../types/timeline';

const events: TimelineEvent[] = [
  { id: 'e1', label: 'Event One', date: new Date('2024-01-01') },
  { id: 'e2', label: 'Event Two', date: new Date('2024-01-15') },
  { id: 'e3', label: 'Event Three', date: new Date('2024-02-01') },
];

const minDate = new Date('2024-01-01');

describe('TimelineTrack', () => {
  it('renders all events', () => {
    render(
      <TimelineTrack
        events={events}
        minDate={minDate}
        scale={10}
        orientation="horizontal"
      />,
    );
    expect(screen.getByText('Event One')).toBeInTheDocument();
    expect(screen.getByText('Event Two')).toBeInTheDocument();
    expect(screen.getByText('Event Three')).toBeInTheDocument();
  });

  it('renders no events when list is empty', () => {
    const { container } = render(
      <TimelineTrack
        events={[]}
        minDate={minDate}
        scale={10}
        orientation="horizontal"
      />,
    );
    expect(container.querySelectorAll('[role="button"]')).toHaveLength(0);
  });

  it('applies horizontal class to the track', () => {
    const { container } = render(
      <TimelineTrack
        events={events}
        minDate={minDate}
        scale={10}
        orientation="horizontal"
      />,
    );
    expect(container.querySelector('.timeline-track')).toHaveClass('horizontal');
  });

  it('applies vertical class to the track', () => {
    const { container } = render(
      <TimelineTrack
        events={events}
        minDate={minDate}
        scale={10}
        orientation="vertical"
      />,
    );
    expect(container.querySelector('.timeline-track')).toHaveClass('vertical');
  });

  it('renders n-1 connectors for n events', () => {
    const { container } = render(
      <TimelineTrack
        events={events}
        minDate={minDate}
        scale={10}
        orientation="horizontal"
      />,
    );
    expect(container.querySelectorAll('.timeline-connector')).toHaveLength(2);
  });

  it('renders no connectors when only one event', () => {
    const { container } = render(
      <TimelineTrack
        events={[events[0]]}
        minDate={minDate}
        scale={10}
        orientation="horizontal"
      />,
    );
    expect(container.querySelectorAll('.timeline-connector')).toHaveLength(0);
  });

  it('marks the selectedEventId event as selected', () => {
    const { container } = render(
      <TimelineTrack
        events={events}
        selectedEventId="e2"
        minDate={minDate}
        scale={10}
        orientation="horizontal"
      />,
    );
    // TimelineEvent applies 'selected' class when isSelected is true
    expect(
      container.querySelector('[aria-label="Event Two"]'),
    ).toHaveClass('selected');
  });

  it('calls onEventClick when an event is clicked', () => {
    const onEventClick = jest.fn();
    render(
      <TimelineTrack
        events={events}
        minDate={minDate}
        scale={10}
        orientation="horizontal"
        onEventClick={onEventClick}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Event One' }));
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it('attaches scrollRef to the track element', () => {
    const scrollRef = React.createRef<HTMLDivElement>();
    render(
      <TimelineTrack
        events={events}
        minDate={minDate}
        scale={10}
        orientation="horizontal"
        scrollRef={scrollRef}
      />,
    );
    expect(scrollRef.current).not.toBeNull();
    expect(scrollRef.current?.classList).toContain('timeline-track');
  });
});
