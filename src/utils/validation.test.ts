import { validateRelativeEventsJson, validateFixedEventsJson } from './validation';

describe('validateRelativeEventsJson', () => {
  const validPayload = {
    datum: '2024-01-01',
    events: [
      { id: 'e1', label: 'Event 1', daysOffset: 0 },
      { id: 'e2', label: 'Event 2', daysOffset: 10, relativeMode: 'fromDatum' },
      {
        id: 'e3',
        label: 'Event 3',
        daysOffset: 5,
        relativeMode: 'fromPreviousEvent',
        relativeToEventId: 'e2',
        productionRule: 'closestWeekday:monday',
        category: 'milestone',
        description: 'A desc',
        metadata: { key: 'value' },
      },
    ],
  };

  it('accepts a valid payload', () => {
    const result = validateRelativeEventsJson(validPayload);
    expect(result.datum).toBe('2024-01-01');
    expect(result.events).toHaveLength(3);
  });

  it('accepts optional description field', () => {
    const withDesc = { ...validPayload, description: 'Timeline description' };
    const result = validateRelativeEventsJson(withDesc);
    expect(result.description).toBe('Timeline description');
  });

  it('throws when datum is missing', () => {
    const { datum: _d, ...noDatum } = validPayload;
    expect(() => validateRelativeEventsJson(noDatum)).toThrow();
  });

  it('throws when events array is missing', () => {
    expect(() => validateRelativeEventsJson({ datum: '2024-01-01' })).toThrow();
  });

  it('throws when an event is missing id', () => {
    const bad = {
      datum: '2024-01-01',
      events: [{ label: 'No ID', daysOffset: 0 }],
    };
    expect(() => validateRelativeEventsJson(bad)).toThrow();
  });

  it('throws when an event is missing label', () => {
    const bad = {
      datum: '2024-01-01',
      events: [{ id: 'x', daysOffset: 0 }],
    };
    expect(() => validateRelativeEventsJson(bad)).toThrow();
  });

  it('throws when daysOffset is not a number', () => {
    const bad = {
      datum: '2024-01-01',
      events: [{ id: 'x', label: 'X', daysOffset: 'ten' }],
    };
    expect(() => validateRelativeEventsJson(bad)).toThrow();
  });

  it('throws when relativeMode is an invalid value', () => {
    const bad = {
      datum: '2024-01-01',
      events: [{ id: 'x', label: 'X', daysOffset: 0, relativeMode: 'invalid' }],
    };
    expect(() => validateRelativeEventsJson(bad)).toThrow();
  });

  it('throws when the entire payload is not an object', () => {
    expect(() => validateRelativeEventsJson(null)).toThrow();
    expect(() => validateRelativeEventsJson('string')).toThrow();
  });
});

describe('validateFixedEventsJson', () => {
  const validPayload = {
    events: [
      { id: 'f1', label: 'Fixed Event', date: '2024-02-15' },
      { id: 'f2', label: 'Another', date: '2024-03-01', category: 'release', description: 'Desc' },
    ],
  };

  it('accepts a valid payload', () => {
    const result = validateFixedEventsJson(validPayload);
    expect(result.events).toHaveLength(2);
    expect(result.events[0].date).toBe('2024-02-15');
  });

  it('accepts optional metadata field', () => {
    const withMeta = { ...validPayload, metadata: 'some metadata string' };
    const result = validateFixedEventsJson(withMeta);
    expect(result.metadata).toBe('some metadata string');
  });

  it('throws when date format is invalid', () => {
    const bad = {
      events: [{ id: 'f1', label: 'Bad Date', date: '15-02-2024' }],
    };
    expect(() => validateFixedEventsJson(bad)).toThrow();
  });

  it('throws when date is missing', () => {
    const bad = {
      events: [{ id: 'f1', label: 'No Date' }],
    };
    expect(() => validateFixedEventsJson(bad)).toThrow();
  });

  it('throws when id is missing', () => {
    const bad = {
      events: [{ label: 'No ID', date: '2024-01-01' }],
    };
    expect(() => validateFixedEventsJson(bad)).toThrow();
  });

  it('throws when the events array is missing', () => {
    expect(() => validateFixedEventsJson({ metadata: 'x' })).toThrow();
  });

  it('throws when the entire payload is not an object', () => {
    expect(() => validateFixedEventsJson(null)).toThrow();
  });
});
