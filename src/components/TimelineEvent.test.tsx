import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineEventComponent from './TimelineEvent';
import { TimelineEvent } from '../types/timeline';

const mockEvent: TimelineEvent = {
  id: 'e1',
  label: 'Test Event',
  description: 'A test description',
  date: new Date('2024-01-15'),
  category: 'milestone',
};

describe('TimelineEvent', () => {
  it('renders event label', () => {
    render(
      <TimelineEventComponent
        event={mockEvent}
        position={100}
        orientation="horizontal"
      />,
    );
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders description as tooltip', () => {
    render(
      <TimelineEventComponent
        event={mockEvent}
        position={100}
        orientation="horizontal"
      />,
    );
    expect(screen.getByText('A test description')).toBeInTheDocument();
  });

  it('applies category as CSS class', () => {
    const { container } = render(
      <TimelineEventComponent
        event={mockEvent}
        position={100}
        orientation="horizontal"
      />,
    );
    expect(container.firstChild).toHaveClass('milestone');
  });

  it('applies selected class when isSelected is true', () => {
    const { container } = render(
      <TimelineEventComponent
        event={mockEvent}
        isSelected
        position={100}
        orientation="horizontal"
      />,
    );
    expect(container.firstChild).toHaveClass('selected');
  });

  it('positions element horizontally using left style', () => {
    const { container } = render(
      <TimelineEventComponent
        event={mockEvent}
        position={150}
        orientation="horizontal"
      />,
    );
    expect((container.firstChild as HTMLElement).style.left).toBe('150px');
  });

  it('positions element vertically using top style', () => {
    const { container } = render(
      <TimelineEventComponent
        event={mockEvent}
        position={200}
        orientation="vertical"
      />,
    );
    expect((container.firstChild as HTMLElement).style.top).toBe('200px');
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(
      <TimelineEventComponent
        event={mockEvent}
        position={100}
        orientation="horizontal"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(mockEvent);
  });

  it('calls onClick on Enter key', () => {
    const onClick = jest.fn();
    render(
      <TimelineEventComponent
        event={mockEvent}
        position={100}
        orientation="horizontal"
        onClick={onClick}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(mockEvent);
  });

  it('calls onClick on Space key', () => {
    const onClick = jest.fn();
    render(
      <TimelineEventComponent
        event={mockEvent}
        position={100}
        orientation="horizontal"
        onClick={onClick}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onClick).toHaveBeenCalledWith(mockEvent);
  });

  it('has correct ARIA attributes', () => {
    render(
      <TimelineEventComponent
        event={mockEvent}
        position={100}
        orientation="horizontal"
      />,
    );
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('aria-label', 'Test Event');
    expect(el).toHaveAttribute('tabindex', '0');
  });

  it('does not render tooltip when no description', () => {
    const eventNoDesc: TimelineEvent = { ...mockEvent, description: undefined };
    render(
      <TimelineEventComponent
        event={eventNoDesc}
        position={100}
        orientation="horizontal"
      />,
    );
    expect(screen.queryByText('A test description')).not.toBeInTheDocument();
  });
});
