import { useState, useEffect, useRef, useCallback, RefObject } from 'react';

type UseTimelineScrollResult = {
  scrollPosition: number;
  scrollRef: RefObject<HTMLDivElement>;
  scrollToPosition: (position: number) => void;
};

export function useTimelineScroll(orientation: 'horizontal' | 'vertical'): UseTimelineScrollResult {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToPosition = useCallback((position: number) => {
    if (!scrollRef.current) return;
    if (orientation === 'horizontal') {
      scrollRef.current.scrollLeft = position;
    } else {
      scrollRef.current.scrollTop = position;
    }
  }, [orientation]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const pos = orientation === 'horizontal' ? el.scrollLeft : el.scrollTop;
        setScrollPosition(pos);
      }, 100);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', handleScroll);
    };
  }, [orientation]);

  return { scrollPosition, scrollRef, scrollToPosition };
}
