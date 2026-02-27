# Timeline Component Implementation Plan

## Phase 1: Project Setup & Foundation

- [ ] Initialize project structure with src/, public/, tests/ directories
- [ ] Configure TypeScript (tsconfig.json) with strict mode enabled
- [ ] Set up build tooling (webpack, Vite, or similar bundler)
- [ ] Configure ESLint and Prettier with AirBnB config
- [ ] Set up Jest and testing libraries (React Testing Library, jsdom)
- [ ] Create necessary directories: components/, hooks/, utils/, types/, styles/, data/
- [ ] Initialize package.json with dependencies (React, TypeScript, testing libraries, date library)
- [ ] Create .gitignore and initial commit

## Phase 2: Type Definitions & Interfaces

- [ ] Create src/types/timeline.ts with all TypeScript interfaces
  - [ ] RelativeMode type
  - [ ] ProductionRule type
  - [ ] RelativeEventData interface
  - [ ] FixedEventData interface
  - [ ] TimelineEvent interface
  - [ ] TimelineProps interface
  - [ ] TimelineState interface
- [ ] Document all interface properties with JSDoc comments
- [ ] Validate interfaces against README.md schema examples

## Phase 3: Core Utilities

### Date Calculations (src/utils/dateCalculations.ts)
- [ ] Implement calculateDateFromDatum(datum: Date, daysOffset: number): Date
- [ ] Implement calculateDateFromPreviousEvent(previousDate: Date, daysOffset: number): Date
- [ ] Implement applyProductionRule(date: Date, rule: string): Date
  - [ ] closestWeekday:{day} logic
  - [ ] skipHolidays:{region} logic
  - [ ] businessDaysOnly logic
  - [ ] endOfMonth logic
  - [ ] startOfQuarter logic
  - [ ] endOfQuarter logic
  - [ ] Rule chaining (comma-separated)
- [ ] Implement validateEventReferences(events: RelativeEventData[]): boolean
  - [ ] Detect circular dependencies
  - [ ] Validate relativeToEventId references exist
- [ ] Implement resolveEventChain(events: RelativeEventData[], datum: Date): TimelineEvent[]
  - [ ] Process events in dependency order
  - [ ] Cache calculated dates
- [ ] Unit tests for all date calculation functions (>80% coverage)

### Position Calculator (src/utils/positionCalculator.ts)
- [ ] Implement calculateScale(dateRange: number, containerSize: number): number
- [ ] Implement calculateEventPosition(date: Date, minDate: Date, scale: number, isVertical: boolean): number
- [ ] Implement calculateDateRange(events: TimelineEvent[]): { min: Date, max: Date }
- [ ] Implement adjustScaleForViewport(events: TimelineEvent[], containerSize: number, isVertical: boolean): number
- [ ] Unit tests for position calculations

### Data Validation (src/utils/dateCalculations.ts or separate file)
- [ ] Implement validateEventData(events: unknown): RelativeEventData[]
- [ ] Implement validateFixedEvents(events: unknown): FixedEventData[]
- [ ] Implement validateDatum(datum: unknown): Date
- [ ] Use schema validation library (Zod or io-ts)
- [ ] Handle validation errors with informative messages
- [ ] Unit tests for validation functions

## Phase 4: React Custom Hooks

### useTimelineData Hook (src/hooks/useTimelineData.ts)
- [ ] Load relative events from JSON URL
- [ ] Load fixed events from JSON URL (optional)
- [ ] Validate and parse event data
- [ ] Resolve event chains with date calculations
- [ ] Merge relative and fixed events
- [ ] Sort events chronologically
- [ ] Cache calculated dates
- [ ] Handle loading and error states
- [ ] Return { events, loading, error, calculatedDates }
- [ ] Unit tests with mocked data loading

### useTimelineScroll Hook (src/hooks/useTimelineScroll.ts)
- [ ] Track scroll position state
- [ ] Implement scroll event listener with debouncing
- [ ] Support both horizontal and vertical scroll tracking
- [ ] Optionally snap to events
- [ ] Cleanup listeners on unmount
- [ ] Return { scrollPosition, handleScroll, scrollToEvent }
- [ ] Unit tests for scroll tracking

### useTimelineLayout Hook (src/hooks/useTimelineLayout.ts)
- [ ] Detect and track orientation (horizontal/vertical)
- [ ] Track container dimensions (ResizeObserver)
- [ ] Calculate responsive scale based on viewport
- [ ] Handle orientation toggle
- [ ] Cleanup observers on unmount
- [ ] Return { orientation, containerSize, scale, setOrientation }
- [ ] Unit tests for layout tracking

## Phase 5: React Components (Presentational)

### TimelineEvent Component (src/components/TimelineEvent.tsx)
- [ ] Accept TimelineEvent data as props
- [ ] Render event marker with label
- [ ] Display optional description on hover
- [ ] Show category styling/color
- [ ] Support click/tap interaction with callback
- [ ] Keyboard navigation support (Tab, Enter, Space)
- [ ] ARIA labels and roles for accessibility
- [ ] Component tests for rendering and interactions
- [ ] Memoize with React.memo for performance

### TimelineConnector Component (src/components/TimelineConnector.tsx)
- [ ] Render visual connector line between events
- [ ] Support horizontal and vertical orientations
- [ ] Style based on event categories
- [ ] Responsive to container size
- [ ] Component tests

### TimelineAxis Component (src/components/TimelineAxis.tsx)
- [ ] Display ruler/scale with date labels
- [ ] Smart label formatting (days, months, years)
- [ ] Support horizontal and vertical layouts
- [ ] Responsive tick spacing
- [ ] Accessible labels for screen readers
- [ ] Component tests

### TimelineTrack Component (src/components/TimelineTrack.tsx)
- [ ] Container for event markers and connectors
- [ ] Support scrolling in primary direction
- [ ] Render all TimelineEvent children
- [ ] Responsive sizing
- [ ] Component tests

### TimelineContainer Component (src/components/TimelineContainer.tsx)
- [ ] Layout wrapper combining Track and Axis
- [ ] Apply orientation styling (horizontal/vertical)
- [ ] Handle scrollbar styling
- [ ] Responsive container
- [ ] Component tests

### TimelineControls Component (src/components/TimelineControls.tsx) - Optional
- [ ] Orientation toggle button
- [ ] Zoom controls (if applicable)
- [ ] Accessibility labels
- [ ] Component tests

## Phase 6: React Container Component

### Timeline Component (src/components/Timeline.tsx)
- [ ] Main component combining logic and presentation
- [ ] Use useTimelineData hook for event loading
- [ ] Use useTimelineScroll hook for scroll tracking
- [ ] Use useTimelineLayout hook for orientation/sizing
- [ ] Accept TimelineProps
- [ ] Call onEventClick callback when event selected
- [ ] Render TimelineContainer with all sub-components
- [ ] Error boundary for graceful error handling
- [ ] Loading state UI
- [ ] Empty state UI
- [ ] Component tests with mocked hooks
- [ ] Integration tests with actual data

## Phase 7: Styling

### CSS Structure (src/styles/timeline.css)
- [ ] Define CSS variables for theme (--primary-color, --text-color, etc.)
- [ ] Component scoped styles using BEM naming
- [ ] Timeline track styling (horizontal and vertical)
- [ ] Event marker styling
- [ ] Event connector styling
- [ ] Timeline axis styling
- [ ] Hover and focus states
- [ ] Active/selected event styling
- [ ] Category-based color coding
- [ ] Responsive breakpoints for mobile
- [ ] High contrast mode support
- [ ] Scroll bar styling

### Accessibility Styling
- [ ] Focus indicators (4.5:1 contrast minimum)
- [ ] Touch target sizing (min 44x44px)
- [ ] Responsive text sizing
- [ ] Color independent indicators

## Phase 8: Vanilla JavaScript AMD Module Implementation

### Module Structure
- [ ] Create src/modules/ directory
- [ ] Require AMD loader (RequireJS or create custom AMD implementation)

### Timeline AMD Module (src/modules/Timeline.js)
- [ ] Factory function with configuration
- [ ] Init method to create sub-modules
- [ ] Event listener attachment with cleanup
- [ ] Destroy method for cleanup
- [ ] Public API: render(), update(), destroy()
- [ ] State management via closure
- [ ] JSDoc comments for all methods

### TimelineTrack AMD Module (src/modules/TimelineTrack.js)
- [ ] DOM element creation and management
- [ ] Event delegation for child interactions
- [ ] Scroll handling and tracking
- [ ] Cleanup on destroy

### TimelineEvent AMD Module (src/modules/TimelineEvent.js)
- [ ] Render individual event markers
- [ ] Handle click/tap events
- [ ] Update styling based on state
- [ ] Cleanup on destroy

### TimelineAxis AMD Module (src/modules/TimelineAxis.js)
- [ ] Render scale/ruler
- [ ] Dynamic label generation
- [ ] Responsive to dimension changes

### Utility Modules
- [ ] src/modules/utils/dateCalculations.js (same logic as React version)
- [ ] src/modules/utils/positionCalculator.js
- [ ] src/modules/utils/domHelpers.js (DOM manipulation utilities)

### Testing AMD Modules
- [ ] Unit tests with Mocha/Jest for utility functions
- [ ] Component tests using jsdom for DOM modules
- [ ] Mock external dependencies

## Phase 9: Data Files & Examples

### Data Files (src/data/)
- [ ] Create events.json with relative events example
- [ ] Create fixed-events.json with fixed events example
- [ ] Validate JSON against schemas

### React Example (src/examples/TimelineExample.tsx)
- [ ] Component with Timeline instance
- [ ] Pass required props (datum, URLs)
- [ ] Demonstrate event click handling
- [ ] Show orientation toggle
- [ ] CSS variable customization example

### Vanilla JS Example (src/examples/timelineExample.js)
- [ ] AMD module usage example
- [ ] Configuration object setup
- [ ] Initialization and rendering
- [ ] Event listener setup
- [ ] Cleanup/destroy example

### HTML Example (public/index.html or examples/timeline.html)
- [ ] HTML structure for running examples
- [ ] Script loading for React and AMD versions
- [ ] Demo data integration

## Phase 10: Testing & Quality Assurance

### Unit Test Coverage (Target >80%)
- [ ] Date calculation functions
- [ ] Position calculator functions
- [ ] Data validation functions
- [ ] Hook behavior (useTimelineData, useTimelineScroll, useTimelineLayout)
- [ ] Component rendering (all React components)
- [ ] AMD module functionality

### Component Tests
- [ ] Timeline component with mocked data
- [ ] Event rendering and interaction
- [ ] Scroll behavior
- [ ] Orientation switching
- [ ] Error handling and fallback UI

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
- [ ] ESLint compliance check
- [ ] TypeScript strict mode validation
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
- [ ] JSDoc comments on all exported functions
- [ ] Inline comments for complex logic (especially date calculations)
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
