import React from 'react';
import { render } from '@testing-library/react';
import TimelineConnector, { getTimelineConnectorStyle } from './TimelineConnector';

describe('getTimelineConnectorStyle', () => {
  it('returns left and width for horizontal orientation', () => {
    const style = getTimelineConnectorStyle(100, 300, 'horizontal');
    expect(style.position).toBe('absolute');
    expect(style.left).toBe(100);
    expect(style.width).toBe(200);
    expect(style.top).toBeUndefined();
    expect(style.height).toBeUndefined();
  });

  it('returns top and height for vertical orientation', () => {
    const style = getTimelineConnectorStyle(50, 200, 'vertical');
    expect(style.position).toBe('absolute');
    expect(style.top).toBe(50);
    expect(style.height).toBe(150);
    expect(style.left).toBeUndefined();
    expect(style.width).toBeUndefined();
  });

  it('handles zero-length connector (fromPosition === toPosition)', () => {
    const h = getTimelineConnectorStyle(120, 120, 'horizontal');
    expect(h.width).toBe(0);

    const v = getTimelineConnectorStyle(80, 80, 'vertical');
    expect(v.height).toBe(0);
  });

  it('handles negative width/height (reversed positions)', () => {
    const style = getTimelineConnectorStyle(300, 100, 'horizontal');
    expect(style.width).toBe(-200);
  });
});

describe('TimelineConnector component', () => {
  it('renders a div with the correct horizontal class', () => {
    const { container } = render(
      <TimelineConnector fromPosition={0} toPosition={200} orientation="horizontal" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('timeline-connector');
    expect(el.className).toContain('horizontal');
  });

  it('renders a div with the correct vertical class', () => {
    const { container } = render(
      <TimelineConnector fromPosition={0} toPosition={150} orientation="vertical" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('vertical');
  });

  it('applies left style for horizontal orientation', () => {
    const { container } = render(
      <TimelineConnector fromPosition={40} toPosition={160} orientation="horizontal" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.left).toBe('40px');
    expect(el.style.width).toBe('120px');
  });

  it('applies top style for vertical orientation', () => {
    const { container } = render(
      <TimelineConnector fromPosition={60} toPosition={220} orientation="vertical" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.top).toBe('60px');
    expect(el.style.height).toBe('160px');
  });
});
