import { z } from 'zod';
import { RelativeEventsJson, FixedEventsJson } from '../types/timeline';

const RelativeEventDataSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  daysOffset: z.number(),
  relativeMode: z.enum(['fromDatum', 'fromPreviousEvent']).optional(),
  relativeToEventId: z.string().optional(),
  productionRule: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const FixedEventDataSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  category: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const RelativeEventsJsonSchema = z.object({
  datum: z.string(),
  description: z.string().optional(),
  events: z.array(RelativeEventDataSchema),
});

const FixedEventsJsonSchema = z.object({
  metadata: z.string().optional(),
  events: z.array(FixedEventDataSchema),
});

export function validateRelativeEventsJson(data: unknown): RelativeEventsJson {
  return RelativeEventsJsonSchema.parse(data) as RelativeEventsJson;
}

export function validateFixedEventsJson(data: unknown): FixedEventsJson {
  return FixedEventsJsonSchema.parse(data) as FixedEventsJson;
}
