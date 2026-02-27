export type RelativeMode = 'fromDatum' | 'fromPreviousEvent';

export type ProductionRule = string;

export type RelativeEventData = {
  id: string;
  label: string;
  description?: string;
  daysOffset: number;
  relativeMode?: RelativeMode; // defaults to 'fromDatum'
  relativeToEventId?: string; // required if relativeMode is 'fromPreviousEvent'
  productionRule?: ProductionRule;
  category?: string;
  metadata?: Record<string, unknown>;
};

export type FixedEventData = {
  id: string;
  label: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  category?: string;
  metadata?: Record<string, unknown>;
};

export type TimelineEvent = {
  id: string;
  label: string;
  description?: string;
  date: Date;
  category?: string;
  metadata?: Record<string, unknown>;
};

export type TimelineProps = {
  datum: Date;
  relativeEventsUrl: string;
  fixedEventsUrl?: string;
  orientation: 'horizontal' | 'vertical';
  scale?: number; // pixels per day
  onEventClick?: (event: TimelineEvent) => void;
};

export type TimelineState = {
  events: TimelineEvent[];
  loading: boolean;
  error?: string;
  scrollPosition: number;
  calculatedDates?: Map<string, Date>;
};

export type RelativeEventsJson = {
  datum: string;
  description?: string;
  events: RelativeEventData[];
};

export type FixedEventsJson = {
  metadata?: string;
  events: FixedEventData[];
};
