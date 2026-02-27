import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Timeline from './Timeline';
import * as useTimelineDataModule from '../hooks/useTimelineData';
import { TimelineEvent } from '../types/timeline';

jest.mock('../hooks/useTimelineData');

// ResizeObserver is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockEvents: TimelineEvent[] = [
  { id: 'e1', label: 'Event One', date: new Date('2024-01-01') },
  { id: 'e2', label: 'Event Two', date: new Date('2024-01-15') },
];

const defaultProps = {
  datum: new Date('2024-01-01'),
  relativeEventsUrl: '/events.json',
  orientation: 'horizontal' as const,
};

function mockHook(overrides: Partial<ReturnType<typeof useTimelineDataModule.useTimelineData>>) {
  (useTimelineDataModule.useTimelineData as jest.Mock).mockReturnValue({
    events: [],
    loading: false,
    error: undefined,
    calculatedDates: new Map(),
    ...overrides,
  });
}

describe('Timeline', () => {
  it('renders loading state', () => {
    mockHook({ loading: true });
    render(<Timeline {...defaultProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading...').className).toContain('timeline-loading');
  });

  it('renders error state', () => {
    mockHook({ error: 'Network error' });
    render(<Timeline {...defaultProps} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Network error').className).toContain('timeline-error');
  });

  it('renders empty state when no events', () => {
    mockHook({ events: [] });
    render(<Timeline {...defaultProps} />);
    expect(screen.getByText('No events to display')).toBeInTheDocument();
    expect(screen.getByText('No events to display').className).toContain('timeline-empty');
  });

  it('renders events when loaded', () => {
    mockHook({ events: mockEvents });
    render(<Timeline {...defaultProps} />);
    expect(screen.getByText('Event One')).toBeInTheDocument();
    expect(screen.getByText('Event Two')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', () => {
    const onEventClick = jest.fn();
    mockHook({ events: mockEvents });
    render(<Timeline {...defaultProps} onEventClick={onEventClick} />);
    fireEvent.click(screen.getByText('Event One').closest('[role="button"]')!);
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('renders with vertical orientation', () => {
    mockHook({ events: mockEvents });
    const { container } = render(<Timeline {...defaultProps} orientation="vertical" />);
    expect(container.querySelector('.timeline-container')).toHaveClass('vertical');
  });
});
