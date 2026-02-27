import { useState, useEffect, RefObject } from 'react';
import { TimelineEvent } from '../types/timeline';
import { adjustScaleForViewport } from '../utils/positionCalculator';

type ContainerSize = { width: number; height: number };

type UseTimelineLayoutResult = {
  containerSize: ContainerSize;
  scale: number;
  setOrientation: (o: 'horizontal' | 'vertical') => void;
};

export function useTimelineLayout(
  initialOrientation: 'horizontal' | 'vertical',
  containerRef: RefObject<HTMLElement>,
  events: TimelineEvent[],
  defaultScale?: number,
): UseTimelineLayoutResult {
  const [orientation, setOrientation] = useState(initialOrientation);
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const [scale, setScale] = useState(defaultScale ?? 1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = (width: number, height: number) => {
      setContainerSize({ width, height });
      if (!defaultScale && events.length > 1) {
        const dimension = orientation === 'horizontal' ? width : height;
        const computed = adjustScaleForViewport(events, dimension);
        setScale(computed);
      } else if (defaultScale) {
        setScale(defaultScale);
      }
    };

    // Initial measurement
    updateSize(el.clientWidth, el.clientHeight);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateSize(width, height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, orientation, events, defaultScale]);

  return { containerSize, scale, setOrientation };
}
