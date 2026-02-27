import React from 'react';
import { addDays, differenceInDays, format } from 'date-fns';

type TimelineAxisProps = {
  minDate: Date;
  maxDate: Date;
  scale: number;
  orientation: 'horizontal' | 'vertical';
};

export function getTickInterval(rangeDays: number): { interval: number; fmt: string } {
  if (rangeDays <= 30) return { interval: 1, fmt: 'MMM d' };
  if (rangeDays <= 90) return { interval: 30, fmt: 'MMM yyyy' };
  if (rangeDays <= 180) return { interval: 60, fmt: 'MMM yyyy' };
  if (rangeDays <= 365) return { interval: 90, fmt: 'MMM yyyy' };
  return { interval: 365, fmt: 'yyyy' };
}

export default function TimelineAxis({
  minDate,
  maxDate,
  scale,
  orientation,
}: TimelineAxisProps): React.ReactElement {
  const rangeDays = differenceInDays(maxDate, minDate);
  const { interval, fmt } = getTickInterval(rangeDays);

  const ticks: { position: number; label: string }[] = [];
  for (let day = 0; day <= rangeDays; day += interval) {
    const tickDate = addDays(minDate, day);
    ticks.push({
      position: day * scale,
      label: format(tickDate, fmt),
    });
  }

  return (
    <div className={`timeline-axis ${orientation}`}>
      {ticks.map((tick) => {
        const style: React.CSSProperties =
          orientation === 'horizontal'
            ? { left: tick.position }
            : { top: tick.position };
        return (
          <span key={`${tick.position}-${tick.label}`} className="timeline-axis-tick" style={style}>
            {tick.label}
          </span>
        );
      })}
    </div>
  );
}
