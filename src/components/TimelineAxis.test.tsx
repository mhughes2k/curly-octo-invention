import React from 'react';
import { render, screen } from '@testing-library/react';
import TimelineAxis, { getTickInterval } from './TimelineAxis';

describe('getTickInterval', () => {
  it('returns interval 1 and MMM d format for ≤30 days', () => {
    expect(getTickInterval(0)).toEqual({ interval: 1, fmt: 'MMM d' });
    expect(getTickInterval(15)).toEqual({ interval: 1, fmt: 'MMM d' });
    expect(getTickInterval(30)).toEqual({ interval: 1, fmt: 'MMM d' });
  });

  it('returns interval 30 and MMM yyyy for 31–90 days', () => {
    expect(getTickInterval(31)).toEqual({ interval: 30, fmt: 'MMM yyyy' });
    expect(getTickInterval(90)).toEqual({ interval: 30, fmt: 'MMM yyyy' });
  });

  it('returns interval 60 for 91–180 days', () => {
    expect(getTickInterval(91)).toEqual({ interval: 60, fmt: 'MMM yyyy' });
    expect(getTickInterval(180)).toEqual({ interval: 60, fmt: 'MMM yyyy' });
  });

  it('returns interval 90 for 181–365 days', () => {
    expect(getTickInterval(181)).toEqual({ interval: 90, fmt: 'MMM yyyy' });
    expect(getTickInterval(365)).toEqual({ interval: 90, fmt: 'MMM yyyy' });
  });

  it('returns interval 365 and yyyy for >365 days', () => {
    expect(getTickInterval(366)).toEqual({ interval: 365, fmt: 'yyyy' });
    expect(getTickInterval(730)).toEqual({ interval: 365, fmt: 'yyyy' });
  });
});

describe('TimelineAxis component', () => {
  const minDate = new Date('2024-01-01');

  it('renders the axis container with horizontal class', () => {
    const maxDate = new Date('2024-01-10'); // 9-day range
    const { container } = render(
      <TimelineAxis minDate={minDate} maxDate={maxDate} scale={10} orientation="horizontal" />,
    );
    expect(container.querySelector('.timeline-axis')).toHaveClass('horizontal');
    expect(container.querySelector('.timeline-axis')).not.toHaveClass('vertical');
  });

  it('renders the axis container with vertical class', () => {
    const maxDate = new Date('2024-01-10');
    const { container } = render(
      <TimelineAxis minDate={minDate} maxDate={maxDate} scale={10} orientation="vertical" />,
    );
    expect(container.querySelector('.timeline-axis')).toHaveClass('vertical');
  });

  it('renders a tick for the start date', () => {
    const maxDate = new Date('2024-01-15'); // 14-day range → daily ticks
    render(
      <TimelineAxis minDate={minDate} maxDate={maxDate} scale={10} orientation="horizontal" />,
    );
    // Jan 1 should appear as "Jan 1"
    expect(screen.getByText('Jan 1')).toBeInTheDocument();
  });

  it('renders monthly ticks for a 60-day range', () => {
    const maxDate = new Date('2024-03-01'); // ~60 days → 30-day interval
    const { container } = render(
      <TimelineAxis minDate={minDate} maxDate={maxDate} scale={2} orientation="horizontal" />,
    );
    const ticks = container.querySelectorAll('.timeline-axis-tick');
    // 60-day range with interval 30 → ticks at day 0, 30, 60 → 3 ticks
    expect(ticks.length).toBeGreaterThanOrEqual(2);
  });

  it('positions ticks horizontally using left style', () => {
    const maxDate = new Date('2024-01-11'); // 10-day range → daily ticks
    const scale = 20;
    const { container } = render(
      <TimelineAxis minDate={minDate} maxDate={maxDate} scale={scale} orientation="horizontal" />,
    );
    const firstTick = container.querySelector('.timeline-axis-tick') as HTMLElement;
    // Day 0 → left: 0px
    expect(firstTick.style.left).toBe('0px');
  });

  it('positions ticks vertically using top style', () => {
    const maxDate = new Date('2024-01-11');
    const scale = 15;
    const { container } = render(
      <TimelineAxis minDate={minDate} maxDate={maxDate} scale={scale} orientation="vertical" />,
    );
    const firstTick = container.querySelector('.timeline-axis-tick') as HTMLElement;
    expect(firstTick.style.top).toBe('0px');
  });

  it('uses addDays correctly across month boundaries', () => {
    // Jan 29 + 3 days = Feb 1 — setDate arithmetic would overflow, addDays handles it correctly
    const boundaryMin = new Date('2024-01-29');
    const boundaryMax = new Date('2024-02-05'); // 7 days
    render(
      <TimelineAxis minDate={boundaryMin} maxDate={boundaryMax} scale={10} orientation="horizontal" />,
    );
    // Feb 1 (day 3 from Jan 29) should be labelled "Feb 1"
    expect(screen.getByText('Feb 1')).toBeInTheDocument();
  });
});
