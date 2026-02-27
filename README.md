# Timeline Component

A flexible React component that visualizes events on an interactive timeline, with support for relative and absolute dates, dual orientations, and seamless scrolling.

An identically functioning Javascript AMD module implementation.

## Overview

This component enables visualization of project timelines, milestones, and events across time. Events can be defined relative to a reference datum date, relative to other events, or as fixed absolute dates. The timeline supports intelligent date calculation with production rules (weekday snapping, holiday skipping, etc.) and adapts to both horizontal and vertical layouts with smooth scrolling.

## Architecture

### Component Structure
```
Timeline (Main Component)
├── TimelineContainer (Layout wrapper)
│   ├── TimelineTrack (Scrollable event area)
│   │   ├── TimelineEvent (Individual event node)
│   │   └── TimelineConnector (Visual connections between events)
│   └── TimelineAxis (Ruler/scale display)
└── TimelineControls (Optional: orientation toggle, zoom)
```

### Data Flow
1. **Input**: Configuration object with datum date and event URLs
2. **Load Events**: 
   - Parse relative events JSON (delta from datum or from previous events)
   - Parse fixed events JSON (absolute dates)
   - Validate event references and detect circular dependencies
3. **Calculate Event Dates**:
   - Resolve event-relative references by traversing the event chain
   - Apply base date offset (daysOffset)
   - Apply production rules in sequence (weekday snapping, holiday skipping, etc.)
   - Cache calculated dates to avoid recalculation
4. **Merge and Sort**: Combine relative and fixed events, sort chronologically
5. **Calculate Positions**: Map dates to pixel positions based on scale
6. **Render Timeline**: Apply orientation (horizontal/vertical)
7. **Output**: Interactive scrollable timeline

### File Structure
```
src/
├── components/
│   ├── Timeline.tsx (Main component)
│   ├── TimelineEvent.tsx
│   ├── TimelineTrack.tsx
│   └── TimelineAxis.tsx
├── types/
│   └── timeline.ts (TypeScript interfaces)
├── hooks/
│   ├── useTimelineData.ts (Event loading & calculations)
│   ├── useTimelineScroll.ts (Scroll position management)
│   └── useTimelineLayout.ts (Orientation & sizing)
├── utils/
│   ├── dateCalculations.ts
│   └── positionCalculator.ts
├── styles/
│   └── timeline.css
├── data/
│   ├── events.json (Relative events)
│   └── fixed-events.json (Fixed dates - optional)
└── examples/
    └── TimelineExample.tsx
```

### TypeScript Interfaces
```typescript
type RelativeMode = 'fromDatum' | 'fromPreviousEvent';
type ProductionRule = string; // e.g., "closestWeekday:monday", "skipHolidays:US", "businessDaysOnly"

interface RelativeEventData {
  id: string;
  label: string;
  description?: string;
  daysOffset: number;
  relativeMode?: RelativeMode; // defaults to 'fromDatum'
  relativeToEventId?: string; // required if relativeMode is 'fromPreviousEvent'
  productionRule?: ProductionRule; // optional rule(s) for intelligent date calculation
  category?: string;
  metadata?: Record<string, any>;
}

interface FixedEventData {
  id: string;
  label: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  category?: string;
  metadata?: Record<string, any>;
}

interface TimelineEvent {
  id: string;
  label: string;
  description?: string;
  date: Date; // calculated/parsed date
  category?: string;
  metadata?: Record<string, any>;
}

interface TimelineProps {
  datum: Date;
  relativeEventsUrl: string;
  fixedEventsUrl?: string;
  orientation: 'horizontal' | 'vertical';
  scale?: number; // pixels per day
  onEventClick?: (event: TimelineEvent) => void;
}

interface TimelineState {
  events: TimelineEvent[];
  loading: boolean;
  error?: string;
  scrollPosition: number;
  calculatedDates?: Map<string, Date>; // cache for calculated event dates
}
```

## Functional Specifications

### Core Features

#### 1. Event Data Loading
- **Relative Events**: Load from JSON file containing events defined as:
  - Day offsets from a reference datum date
  - Day offsets from a previous event in the sequence
  - Production rules for intelligent date calculation
- **Fixed Events**: Load optional supplementary JSON files with absolute date entries (e.g., historical dates)
- **Event Merging**: Automatically combine relative and fixed events, sorted chronologically
- **Event Properties**:
  - Unique ID
  - Display label
  - Optional description/metadata
  - Category/type for styling
  - Timestamp calculation method (datum-relative, event-relative, production rule, or absolute date)

#### 2. Timeline Views
- **Horizontal Orientation** (Default)
  - Events flow left to right
  - Time progresses horizontally
  - Horizontal scrollbar for navigation
  - Earlier dates on left, later dates on right
  
- **Vertical Orientation**
  - Events flow top to bottom
  - Time progresses vertically
  - Vertical scrollbar for navigation
  - Earlier dates at top, later dates at bottom

#### 3. User Interactions
- **Scrolling**: Navigate timeline in the primary direction (horizontal or vertical)
  - Native scrollbar support
  - Keyboard arrow key navigation
  - Touch/mouse wheel support
- **Event Selection**: Click/tap events to highlight or trigger callbacks
- **Hover States**: Visual feedback when hovering over events
- **Orientation Toggle**: Switch between horizontal and vertical layouts

#### 4. Visual Elements
- **Timeline Track**: Continuous visual line/container showing event progression
- **Event Markers**: Visual nodes representing individual events
- **Connectors**: Lines connecting events in sequence
- **Timeline Axis**: Optional ruler showing time scale/labels
- **Labels**: Event names positioned relative to markers
- **Category Styling**: Color coding by event category/type

#### 5. Time Scale Management
- **Configurable Scale**: Adjustable pixels per day or days per viewport
- **Responsive Scaling**: Automatic adjustment for different screen sizes
- **Date Formatting**: Smart label formatting (days, months, years based on zoom level)
- **Date Range**: Automatic calculation of min/max dates to determine visible span

### Data Formats

#### Relative Events JSON (events.json)
```json
{
  "datum": "2026-02-27",
  "description": "Project reference date",
  "events": [
    {
      "id": "launch",
      "label": "Project Launch",
      "description": "Official project start",
      "daysOffset": 0,
      "category": "milestone"
    },
    {
      "id": "beta",
      "label": "Beta Release",
      "daysOffset": 60,
      "category": "release"
    },
    {
      "id": "qa-start",
      "label": "QA Phase Starts",
      "daysOffset": 14,
      "relativeMode": "fromPreviousEvent",
      "relativeToEventId": "beta",
      "category": "phase"
    },
    {
      "id": "launch-day",
      "label": "Public Launch (Monday)",
      "daysOffset": 30,
      "relativeMode": "fromPreviousEvent",
      "relativeToEventId": "qa-start",
      "productionRule": "closestWeekday:monday",
      "category": "milestone"
    },
    {
      "id": "holiday-skip",
      "label": "First Day After Holiday",
      "daysOffset": 7,
      "relativeMode": "fromPreviousEvent",
      "relativeToEventId": "launch-day",
      "productionRule": "skipHolidays:US",
      "category": "milestone"
    }
  ]
}
```

**Relative Event Modes** (optional, defaults to `fromDatum`):
- `fromDatum`: daysOffset is calculated from the datum date
- `fromPreviousEvent`: daysOffset is calculated from the date of the event specified in `relativeToEventId`

**Production Rules** (optional temporal calculation logic):
- `closestWeekday:monday|tuesday|wednesday|thursday|friday` - Find closest occurrence of specified weekday
- `closestWeekday:saturday|sunday` - Find closest weekend day
- `skipHolidays:US|UK|etc` - Skip past specified holiday calendars
- `businessDaysOnly` - Use business day count instead of calendar days
- `endOfMonth` - Align to end of month
- `startOfQuarter` - Align to quarter boundary
- Multiple rules can be combined with commas (e.g., `"businessDaysOnly,skipHolidays:US,closestWeekday:friday"`)

#### Fixed Events JSON (fixed-events.json)
```json
{
  "metadata": "Optional global description",
  "events": [
    {
      "id": "founder",
      "label": "Company Founded",
      "date": "2015-03-15",
      "category": "milestone"
    }
  ]
}
```

## Non-Functional Specifications

### Performance Requirements
- **Load Time**: Initial component render < 100ms for up to 100 events
- **Scroll Smoothness**: Maintain 60 FPS during scrolling operations
- **Memory Usage**: Efficient handling of large datasets (1000+ events) via virtual scrolling
- **Bundle Size**: Minified component code < 50KB (gzipped)
- **Asset Optimization**: Lazy load data files only when needed

### Reliability & Quality
- **Error Handling**:
  - Graceful degradation if JSON files fail to load
  - Validation of JSON schema with informative error messages
  - Fallback UI for missing or malformed data
  
- **Code Quality**:
  - Full TypeScript type coverage (strict mode)
  - Unit test coverage > 80%
  - No console warnings/errors in production builds
  - ESLint compliance (AirBnB config)

### Accessibility (WCAG 2.1 Level AA)
- **Keyboard Navigation**: 
  - Tab to navigate events
  - Arrow keys to scroll timeline
  - Enter/Space to select events
- **Screen Readers**: ARIA labels for all interactive elements
- **Visual Contrast**: Minimum 4.5:1 contrast ratio
- **Responsive Design**: Readable at all breakpoints

### Compatibility
- **Browsers**: 
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Platforms**: Desktop, tablet, mobile with touch support
- **Network**: Works offline after initial data load (optional caching)

### Usability
- **Responsive**: Adapts to viewport width/height changes
- **Intuitive Navigation**: Obvious scroll direction, visual feedback
- **Mobile-Friendly**: Touch-optimized event targets (> 44px)
- **Customizable**: CSS variables for theming, prop configuration for behavior

### Security
- **Input Validation**: All JSON data validated against schema
- **XSS Prevention**: No unescaped user content in DOM
- **Safe Date Parsing**: Use robust date library (not Date constructor)
- **Content Security**: No arbitrary code execution from JSON

### Maintainability
- **Documentation**: Inline JSDoc, README examples, architecture guide
- **Modularity**: Composable sub-components, reusable utilities
- **Testing**: Unit, integration, and E2E test coverage
- **Code Organization**: Clear folder structure, single responsibility principle

## Usage Example

See [examples/TimelineExample.tsx](examples/TimelineExample.tsx) for a complete working example. Basic usage:

```jsx
import Timeline from './components/Timeline';

function App() {
  return (
    <Timeline
      datum={new Date('2026-02-27')}
      relativeEventsUrl="/data/events.json"
      fixedEventsUrl="/data/fixed-events.json"
      orientation="horizontal"
      onEventClick={(event) => console.log('Clicked:', event)}
    />
  );
}
```

## Getting Started

1. Install dependencies: `npm install`
2. Configure data files in `src/data/`
3. Import Timeline component into your React app
4. Pass required props (datum, data URLs)
5. Customize styling via CSS variables
