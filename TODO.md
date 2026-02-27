# Timeline Component Implementation Plan

## Phase 1: Project Setup & Foundation

- [x] Initialize project structure with src/, public/, tests/ directories
- [x] Configure TypeScript (tsconfig.json) with strict mode enabled
- [x] Set up build tooling (webpack, Vite, or similar bundler)
- [x] Configure ESLint and Prettier with AirBnB config
- [x] Set up Jest and testing libraries (React Testing Library, jsdom)
- [x] Create necessary directories: components/, hooks/, utils/, types/, styles/, data/
- [x] Initialize package.json with dependencies (React, TypeScript, testing libraries, date library)
- [x] Create .gitignore and initial commit

## Phase 2: Type Definitions & Interfaces

- [x] Create src/types/timeline.ts with all TypeScript interfaces
  - [x] RelativeMode type
  - [x] ProductionRule type
  - [x] RelativeEventData interface
  - [x] FixedEventData interface
  - [x] TimelineEvent interface
  - [x] TimelineProps interface
  - [x] TimelineState interface
- [x] Document all interface properties with JSDoc comments
- [x] Validate interfaces against README.md schema examples

## Phase 3: Core Utilities

### Date Calculations (src/utils/dateCalculations.ts)
- [x] Implement calculateDateFromDatum(datum: Date, daysOffset: number): Date
- [x] Implement calculateDateFromPreviousEvent(previousDate: Date, daysOffset: number): Date
- [x] Implement applyProductionRule(date: Date, rule: string): Date
  - [x] closestWeekday:{day} logic
  - [x] skipHolidays:{region} logic
  - [x] businessDaysOnly logic
  - [x] endOfMonth logic
  - [x] startOfQuarter logic
  - [ ] endOfQuarter logic
  - [x] Rule chaining (comma-separated)
- [x] Implement validateEventReferences(events: RelativeEventData[]): boolean
  - [x] Detect circular dependencies
  - [x] Validate relativeToEventId references exist
- [x] Implement resolveEventChain(events: RelativeEventData[], datum: Date): TimelineEvent[]
  - [x] Process events in dependency order
  - [x] Cache calculated dates
- [x] Unit tests for all date calculation functions (>80% coverage)

### Position Calculator (src/utils/positionCalculator.ts)
- [x] Implement calculateScale(dateRange: number, containerSize: number): number
- [x] Implement calculateEventPosition(date: Date, minDate: Date, scale: number, isVertical: boolean): number
- [x] Implement calculateDateRange(events: TimelineEvent[]): { min: Date, max: Date }
- [x] Implement adjustScaleForViewport(events: TimelineEvent[], containerSize: number, isVertical: boolean): number
- [x] Unit tests for position calculations

### Data Validation (src/utils/validation.ts)
- [x] Implement validateEventData(events: unknown): RelativeEventData[]
- [x] Implement validateFixedEvents(events: unknown): FixedEventData[]
- [ ] Implement validateDatum(datum: unknown): Date
- [x] Use schema validation library (Zod or io-ts)
- [x] Handle validation errors with informative messages
- [x] Unit tests for validation functions

## Phase 4: React Custom Hooks

### useTimelineData Hook (src/hooks/useTimelineData.ts)
- [x] Load relative events from JSON URL
- [x] Load fixed events from JSON URL (optional)
- [x] Validate and parse event data
- [x] Resolve event chains with date calculations
- [x] Merge relative and fixed events
- [x] Sort events chronologically
- [x] Cache calculated dates
- [x] Handle loading and error states
- [x] Return { events, loading, error, calculatedDates }
- [x] Unit tests with mocked data loading

### useTimelineScroll Hook (src/hooks/useTimelineScroll.ts)
- [x] Track scroll position state
- [x] Implement scroll event listener with debouncing
- [x] Support both horizontal and vertical scroll tracking
- [ ] Optionally snap to events
- [x] Cleanup listeners on unmount
- [x] Return { scrollPosition, handleScroll, scrollToEvent }
- [ ] Unit tests for scroll tracking

### useTimelineLayout Hook (src/hooks/useTimelineLayout.ts)
- [x] Detect and track orientation (horizontal/vertical)
- [x] Track container dimensions (ResizeObserver)
- [x] Calculate responsive scale based on viewport
- [x] Handle orientation toggle
- [x] Cleanup observers on unmount
- [x] Return { orientation, containerSize, scale, setOrientation }
- [ ] Unit tests for layout tracking

## Phase 5: React Components (Presentational)

### TimelineEvent Component (src/components/TimelineEvent.tsx)
- [x] Accept TimelineEvent data as props
- [x] Render event marker with label
- [x] Display optional description on hover
- [x] Show category styling/color
- [x] Support click/tap interaction with callback
- [x] Keyboard navigation support (Tab, Enter, Space)
- [x] ARIA labels and roles for accessibility
- [x] Component tests for rendering and interactions
- [x] Memoize with React.memo for performance

### TimelineConnector Component (src/components/TimelineConnector.tsx)
- [x] Render visual connector line between events
- [x] Support horizontal and vertical orientations
- [ ] Style based on event categories
- [x] Responsive to container size
- [x] Component tests

### TimelineAxis Component (src/components/TimelineAxis.tsx)
- [x] Display ruler/scale with date labels
- [x] Smart label formatting (days, months, years)
- [x] Support horizontal and vertical layouts
- [x] Responsive tick spacing
- [x] Accessible labels for screen readers
- [ ] Component tests

### TimelineTrack Component (src/components/TimelineTrack.tsx)
- [x] Container for event markers and connectors
- [x] Support scrolling in primary direction
- [x] Render all TimelineEvent children
- [x] Responsive sizing
- [x] Component tests

### TimelineContainer Component (src/components/TimelineContainer.tsx)
- [x] Layout wrapper combining Track and Axis
- [x] Apply orientation styling (horizontal/vertical)
- [x] Handle scrollbar styling
- [x] Responsive container
- [x] Component tests

### TimelineControls Component (src/components/TimelineControls.tsx) - Optional
- [ ] Orientation toggle button
- [ ] Zoom controls (if applicable)
- [ ] Accessibility labels
- [ ] Component tests

## Phase 6: React Container Component

### Timeline Component (src/components/Timeline.tsx)
- [x] Main component combining logic and presentation
- [x] Use useTimelineData hook for event loading
- [x] Use useTimelineScroll hook for scroll tracking
- [x] Use useTimelineLayout hook for orientation/sizing
- [x] Accept TimelineProps
- [x] Call onEventClick callback when event selected
- [x] Render TimelineContainer with all sub-components
- [ ] Error boundary for graceful error handling
- [x] Loading state UI
- [x] Empty state UI
- [x] Component tests with mocked hooks
- [ ] Integration tests with actual data

## Phase 7: Styling

### CSS Structure (src/styles/timeline.css)
- [x] Define CSS variables for theme (--primary-color, --text-color, etc.)
- [x] Component scoped styles using BEM naming
- [x] Timeline track styling (horizontal and vertical)
- [x] Event marker styling
- [x] Event connector styling
- [x] Timeline axis styling
- [x] Hover and focus states
- [x] Active/selected event styling
- [x] Category-based color coding
- [x] Responsive breakpoints for mobile
- [x] High contrast mode support
- [x] Scroll bar styling

### Accessibility Styling
- [x] Focus indicators (4.5:1 contrast minimum)
- [x] Touch target sizing (min 44x44px)
- [x] Responsive text sizing
- [x] Color independent indicators

## Phase 8: Vanilla JavaScript AMD Module Implementation

### Module Structure
- [x] Create src/modules/ directory
- [ ] Require AMD loader (RequireJS or create custom AMD implementation)

### Timeline AMD Module (src/modules/Timeline.js)
- [x] Factory function with configuration
- [x] Init method to create sub-modules
- [x] Event listener attachment with cleanup
- [x] Destroy method for cleanup
- [x] Public API: render(), update(), destroy()
- [x] State management via closure
- [x] JSDoc comments for all methods

### TimelineTrack AMD Module (src/modules/TimelineTrack.js)
- [x] DOM element creation and management
- [x] Event delegation for child interactions
- [x] Scroll handling and tracking
- [x] Cleanup on destroy

### TimelineEvent AMD Module (src/modules/TimelineEvent.js)
- [x] Render individual event markers
- [x] Handle click/tap events
- [x] Update styling based on state
- [x] Cleanup on destroy

### TimelineAxis AMD Module (src/modules/TimelineAxis.js)
- [x] Render scale/ruler
- [x] Dynamic label generation
- [x] Responsive to dimension changes

### Utility Modules
- [x] src/modules/utils/dateCalculations.js (same logic as React version)
- [x] src/modules/utils/positionCalculator.js
- [x] src/modules/utils/domHelpers.js (DOM manipulation utilities)

### Testing AMD Modules
- [ ] Unit tests with Mocha/Jest for utility functions
- [ ] Component tests using jsdom for DOM modules
- [ ] Mock external dependencies

## Phase 9: Data Files & Examples

### Data Files (src/data/)
- [x] Create events.json with relative events example
- [x] Create fixed-events.json with fixed events example
- [x] Validate JSON against schemas

### React Example (src/examples/TimelineExample.tsx)
- [x] Component with Timeline instance
- [x] Pass required props (datum, URLs)
- [x] Demonstrate event click handling
- [ ] Show orientation toggle
- [ ] CSS variable customization example

### Vanilla JS Example (src/examples/timelineExample.js)
- [x] AMD module usage example
- [x] Configuration object setup
- [x] Initialization and rendering
- [x] Event listener setup
- [x] Cleanup/destroy example

### HTML Example (public/index.html or examples/timeline.html)
- [x] HTML structure for running examples
- [x] Script loading for React and AMD versions
- [x] Demo data integration

## Phase 10: Testing & Quality Assurance

### Unit Test Coverage (Target >80%)
- [x] Date calculation functions
- [x] Position calculator functions
- [x] Data validation functions
- [x] Hook behavior (useTimelineData, useTimelineScroll, useTimelineLayout)
- [x] Component rendering (all React components)
- [ ] AMD module functionality

### Component Tests
- [x] Timeline component with mocked data
- [x] Event rendering and interaction
- [ ] Scroll behavior
- [ ] Orientation switching
- [x] Error handling and fallback UI

### Integration Tests
- [ ] Full timeline workflow with real data
- [ ] React and AMD versions side-by-side
- [ ] Data loading and merging
- [ ] Event chain resolution

### E2E Tests (Optional)
- [ ] User workflows (scroll, click events, toggle orientation)
- [ ] Performance under load (100+ events)
- [ ] Accessibility keyboard navigation

### Code Quality
- [x] ESLint compliance check
- [x] TypeScript strict mode validation
- [ ] Type coverage analysis
- [ ] Prettier formatting check
- [ ] No console warnings/errors in production build

### Performance Testing
- [ ] Initial render < 100ms for 100 events
- [ ] 60 FPS scroll performance
- [ ] Bundle size < 50KB gzipped
- [ ] Memory usage with 1000+ events

### Accessibility Testing
- [ ] WCAG 2.1 Level AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Touch target sizing

## Phase 11: Documentation

### Code Documentation
- [x] JSDoc comments on all exported functions
- [x] Inline comments for complex logic (especially date calculations)
- [ ] README setup and usage instructions
- [ ] API documentation for hooks and components
- [ ] Configuration guide (CSS variables, props)

### Architecture Documentation
- [ ] Component hierarchy diagram
- [ ] Data flow diagram
- [ ] Hook interaction guide
- [ ] Module dependency graph (AMD)

### Accessibility Documentation
- [ ] Keyboard navigation guide
- [ ] Screen reader compatibility notes
- [ ] Known limitations and workarounds

## Phase 12: Build & Deployment Preparation

- [ ] Minify and optimize bundle
- [ ] Source maps for debugging
- [ ] Tree-shaking friendly exports
- [ ] Create distribution files
- [ ] Package.json ready for npm publish
- [ ] License file
- [ ] Contributing guidelines
- [ ] Create demonstrators for both vanilla and React implementations
- [ ] Changelog

## Phase 13: Optimization & Polish

- [ ] Code splitting if needed
- [ ] Lazy loading for data files
- [ ] Caching strategies for calculated dates
- [ ] Virtual scrolling for 1000+ events
- [ ] Browser compatibility verification
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile/touch testing
- [ ] Performance profiling and optimization

## Phase 14: Final Review & Release

- [ ] Complete all checklist items
- [ ] Security review (XSS, input validation, etc.)
- [ ] Final documentation review
- [ ] Example walkthroughs
- [ ] README verification against actual implementation
- [ ] Version numbering (semantic versioning)
- [ ] Git tagging for release
- [ ] Publish to npm (if applicable)
