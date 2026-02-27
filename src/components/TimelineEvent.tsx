import React from 'react';
import { TimelineEvent } from '../types/timeline';

type TimelineEventProps = {
  event: TimelineEvent;
  isSelected?: boolean;
  position: number;
  orientation: 'horizontal' | 'vertical';
  onClick?: (event: TimelineEvent) => void;
};

function TimelineEventComponent({
  event,
  isSelected = false,
  position,
  orientation,
  onClick,
}: TimelineEventProps): React.ReactElement {
  const style: React.CSSProperties =
    orientation === 'horizontal'
      ? { position: 'absolute', left: position }
      : { position: 'absolute', top: position };

  const handleClick = () => onClick?.(event);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(event);
    }
  };

  const categoryClass = event.category ? ` ${event.category}` : '';
  const selectedClass = isSelected ? ' selected' : '';

  return (
    <div
      className={`timeline-event${categoryClass}${selectedClass}`}
      style={style}
      role="button"
      aria-label={event.label}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="event-marker" />
      <span className="event-label">{event.label}</span>
      {event.description && (
        <span className="event-tooltip">{event.description}</span>
      )}
    </div>
  );
}

export default React.memo(TimelineEventComponent);
