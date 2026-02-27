import { renderHook, act } from '@testing-library/react';
import { useTimelineLayout } from './useTimelineLayout';
import { TimelineEvent } from '../types/timeline';

// ResizeObserver is not provided by jsdom
type ResizeCallback = (entries: { contentRect: { width: number; height: number } }[]) => void;
let resizeCallback: ResizeCallback | null = null;

global.ResizeObserver = class MockResizeObserver {
  constructor(cb: ResizeCallback) {
    resizeCallback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {
    resizeCallback = null;
  }
} as unknown as typeof ResizeObserver;

const makeEvents = (dates: string[]): TimelineEvent[] =>
  dates.map((d, i) => ({ id: `e${i}`, label: `Event ${i}`, date: new Date(d) }));

function makeRef(width = 800, height = 400) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
  return { current: el } as React.RefObject<HTMLElement>;
}

describe('useTimelineLayout', () => {
  it('initializes containerSize to 0x0', () => {
    // No element attached
    const ref = { current: null } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, [], undefined),
    );
    expect(result.current.containerSize).toEqual({ width: 0, height: 0 });
  });

  it('initializes scale to defaultScale when provided', () => {
    const ref = { current: null } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, [], 5),
    );
    expect(result.current.scale).toBe(5);
  });

  it('initializes scale to 1 when defaultScale is not provided and no events', () => {
    const ref = { current: null } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, [], undefined),
    );
    expect(result.current.scale).toBe(1);
  });

  it('reads clientWidth/clientHeight from element on mount', () => {
    const ref = makeRef(1000, 500);
    const events = makeEvents(['2024-01-01', '2024-06-01']);
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, events, undefined),
    );
    expect(result.current.containerSize.width).toBe(1000);
    expect(result.current.containerSize.height).toBe(500);
  });

  it('uses defaultScale even when element is present', () => {
    const ref = makeRef(1000, 500);
    const events = makeEvents(['2024-01-01', '2024-06-01']);
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, events, 3),
    );
    expect(result.current.scale).toBe(3);
  });

  it('updates containerSize when ResizeObserver fires', () => {
    const ref = makeRef(800, 400);
    const events = makeEvents(['2024-01-01', '2024-04-01']);
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, events, undefined),
    );

    act(() => {
      resizeCallback?.([{ contentRect: { width: 1200, height: 600 } }]);
    });

    expect(result.current.containerSize.width).toBe(1200);
    expect(result.current.containerSize.height).toBe(600);
  });

  it('exposes setOrientation function', () => {
    const ref = { current: null } as React.RefObject<HTMLElement>;
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, [], undefined),
    );
    expect(typeof result.current.setOrientation).toBe('function');
  });

  it('setOrientation triggers a re-render without throwing', () => {
    const ref = makeRef(800, 400);
    const events = makeEvents(['2024-01-01', '2024-07-01']);
    const { result } = renderHook(() =>
      useTimelineLayout('horizontal', ref, events, undefined),
    );
    expect(() => {
      act(() => {
        result.current.setOrientation('vertical');
      });
    }).not.toThrow();
  });
});
