# React Component Development & Vanilla JavaScript AMD Modules - Technical Standards & Best Practices

## Document Purpose & Scope

This file contains **technology-specific guidance** for component development using both React and vanilla JavaScript (AMD). It defines best practices, conventions, and quality standards for implementing components across both paradigms. This guidance is reusable across projects and frameworks.

### What Belongs In This File
- React component patterns and best practices
- Vanilla JavaScript and AMD module patterns
- TypeScript conventions and type safety guidelines
- Testing strategies and tools
- Code organization and naming conventions
- Performance optimization techniques
- Accessibility standards (WCAG 2.1)
- Security practices
- Development workflow recommendations
- Dependency selection criteria
- Browser support targets

### What Does NOT Belong In This File
- Problem specifications (what the Timeline component does)
- Functional requirements (features, interactions, visual elements)
- Non-functional requirements (performance targets, compatibility specifics)
- Architecture diagrams specific to this project
- Data schemas and example JSON
- Use cases or user stories
- Business logic or domain-specific rules

**All problem-specific content must reside in README.md.** This separation ensures copilot-instructions remains a reusable technology guide across different projects.

---

## Technology Stack

### Recommended Technologies
When applicable to your project, this document provides guidance for:
- **Frameworks**: React (Functional components with hooks) OR Vanilla JavaScript with AMD modules
- **Language**: TypeScript (strict mode) for React; ECMAScript 5/6+ for vanilla JavaScript
- **Styling**: CSS with CSS variables for theming
- **Testing**: Unit, component, integration, and E2E tests
- **Build**: Modern bundler (React) or AMD-compatible bundler (Vanilla JS)


## Code Organization & Structure

### File Organization
Use feature-based structure for clarity:
```
src/
├── components/        # React components
├── hooks/            # Custom React hooks
├── types/            # TypeScript interfaces and types
├── utils/            # Utility functions
├── styles/           # CSS/styling
├── data/             # Configuration and data files
└── tests/            # Test files (co-located or centralized)
```

### Naming Conventions
- **Components**: PascalCase (e.g., `TimelineEvent.tsx`)
- **Functions**: camelCase (e.g., `calculatePosition()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_EVENTS`)
- **Types/Interfaces**: PascalCase (e.g., `TimelineProps`)
- **CSS Classes**: kebab-case (e.g., `.timeline-track`)

## React Best Practices

### Component Architecture
- **Functional Components Only**: No class components
- **Container & Presentational Pattern**: Separate logic (Container) from presentation (Presentational)
  - Containers handle data fetching, state, and logic
  - Presentational components focus on rendering and user interaction
  - Containers pass data via props to presentational components
- **Hooks**: Use React hooks for state management and side effects
- **Custom Hooks**: Extract reusable logic into custom hooks (prefix with `use`)
  - One custom hook per concern (e.g., `useData`, `useScroll`, `useLayout`)
  - Return values in consistent order: state first, then handlers/utilities
  - Document hook behavior, especially side effects and dependencies
- **Composition**: Build complex UIs from simple, composable pieces
- **Props Interface**: Define explicit `Props` interface for each component
- **Memoization**: Use `React.memo()` for expensive components, `useMemo()` and `useCallback()` strategically

### State Management
- **Local State**: Use `useState()` for component-scoped state
- **Refs**: Use `useRef()` only for DOM access or mutable values
- **Caching**: Consider caching computed values in state or refs to avoid recalculation
  - Use `Map` or `Record` for caching complex computations
  - Invalidate cache when dependencies change
- **Data Validation**: Validate external data (JSON, API responses) immediately on load
  - Use schema validation libraries (e.g., Zod, io-ts) for type safety
  - Handle validation errors gracefully with fallbacks
- **Dependency Management**: 
  - Detect and prevent circular dependencies in data relationships
  - Traverse dependency chains carefully and cache results
  - Include validation in data loading phase
- **Context**: Consider for shared state across multiple levels
- **External State**: Document if using Redux, Zustand, or other libraries

### Performance Optimization
- **Code Splitting**: Lazy load components when appropriate
- **Virtual Scrolling**: Implement for lists with 100+ items
- **Debouncing/Throttling**: Use for scroll, resize, and input events
- **Memoization**: Avoid unnecessary re-renders of expensive components
- **Bundle Size**: Monitor and aim for minimal gzipped size

## Vanilla JavaScript & AMD Module Development

### AMD Module Pattern
- **Module Definition**: Use `define(id?, dependencies, factory)` for module declaration
- **Module Exports**: Return a single object or constructor function from the factory
- **Shared Dependencies**: Keep stable interfaces for modules that depend on others
- **Avoid Singletons**: Use factory functions/closures for instance creation
- **Circular Dependencies**: Structure modules to minimize circular references

### Component Architecture (Vanilla JS)
- **Factory Functions**: Create configurable component instances
  - Accept configuration object with options and callbacks
  - Return object with public API methods (render, update, destroy, etc.)
  - Keep state private within closure scope
- **Event Management**: Explicit event listener attachment and cleanup
  - Attach listeners to specific DOM nodes
  - Store listener references for later removal
  - Implement explicit cleanup function (e.g., `destroy()`)
- **DOM Manipulation**: Direct DOM methods or lightweight utilities
  - Use `getElementById`, `querySelector`, `addEventListener`
  - Template literals or simple string concatenation for HTML
  - Batch DOM updates to avoid layout thrashing
- **State Management**: Plain JavaScript objects or Map/WeakMap
  - Encapsulate state within module closure
  - Consistent getter/setter patterns
  - Cache computed values to avoid recalculation

### Vanilla JavaScript Organization
```
src/
├── modules/              # AMD modules (each in separate file)
│   ├── Timeline.js
│   ├── TimelineTrack.js
│   ├── TimelineEvent.js
│   └── TimelineAxis.js
├── utils/                # Utility functions
│   ├── dateCalculations.js
│   ├── positionCalculator.js
│   └── domHelpers.js
├── styles/               # CSS/styling
│   └── timeline.css
├── data/                 # Configuration and data files
│   ├── events.json
│   └── fixed-events.json
└── examples/
    └── timelineExample.js
```

### AMD Module Example
```javascript
// Timeline.js - AMD module
define(['./TimelineTrack', './TimelineAxis', './utils/dateCalculations'], 
  function(TimelineTrack, TimelineAxis, dateCalcs) {
    
    // Factory function
    function Timeline(containerEl, config) {
      var self = this;
      this.container = containerEl;
      this.config = config;
      this.state = {
        events: [],
        scrollPosition: 0
      };
      
      // Keep references for cleanup
      this.track = null;
      this.axis = null;
      this.listeners = [];
      
      // Initialize
      this.init();
    }
    
    Timeline.prototype.init = function() {
      this.track = TimelineTrack(this.container, this.config);
      this.axis = TimelineAxis(this.container, this.config);
      this.attachListeners();
    };
    
    Timeline.prototype.attachListeners = function() {
      var self = this;
      var scrollHandler = function() { self.handleScroll(); };
      this.container.addEventListener('scroll', scrollHandler);
      this.listeners.push({ el: this.container, event: 'scroll', handler: scrollHandler });
    };
    
    Timeline.prototype.handleScroll = function() {
      // Scroll logic
    };
    
    Timeline.prototype.destroy = function() {
      // Remove all listeners
      this.listeners.forEach(function(listener) {
        listener.el.removeEventListener(listener.event, listener.handler);
      });
      this.listeners = [];
      
      // Cleanup sub-modules
      if (this.track && this.track.destroy) this.track.destroy();
      if (this.axis && this.axis.destroy) this.axis.destroy();
      
      this.container = null;
      this.state = null;
    };
    
    // Return constructor as module export
    return Timeline;
  }
);
```

### State Management (Vanilla JS)
- **Closures**: Use function closures to encapsulate private state
- **Caching**: Store computed values in module scope or instance properties
  - Use Map or plain object for cache
  - Invalidate cache when dependencies change
- **Data Validation**: Validate external data (JSON, API responses) immediately on load
  - Check required fields and types
  - Handle validation errors with fallbacks
- **Dependency Management**: 
  - Keep track of module dependencies
  - Avoid circular dependencies at module level
  - Cache dependency references to avoid recalculation

### DOM Manipulation Patterns
- **Event Delegation**: Use parent listeners for dynamic content when possible
- **Template Management**: Use template literals or simple string building
  ```javascript
  var html = '<div class="event">' +
    '<span class="label">' + event.label + '</span>' +
  '</div>';
  ```
- **Performance**: Batch DOM updates
  - Create fragments, update them, then insert once
  - Use `requestAnimationFrame` for animations
- **Cleanup**: Always remove event listeners and clear references
  - Implement `destroy()` method on all components
  - Prevent memory leaks from retained DOM nodes

### Testing (Vanilla JavaScript)
- **Unit Tests**: Test utility functions in isolation
- **Component Tests**: Test module factory functions and methods
- **DOM Tests**: Use DOM testing library or jsdom for DOM manipulation tests
- **Mocking**: Mock external dependencies, date functions, XMLHttpRequest
- **Tools**: Jest, Mocha, Sinon, or similar

## TypeScript Standards (React Implementation)

### Type Coverage
- **Strict Mode**: Enable `strict: true` in tsconfig.json
- **No `any`**: Avoid `any` types; use explicit types or generics
- **Props Interface**: Always define explicit interfaces for component props
- **Return Types**: Specify return types for functions (not just parameters)
- **Union Types**: Use for mutually exclusive states
- **Discriminated Unions**: For type-safe state handling

### Type Definitions
```typescript
// DO: Explicit interfaces
interface ComponentProps {
  label: string;
  onClick: (id: string) => void;
}

// DON'T: Implicit or overly permissive types
function Component(props: any) { }
```

## JavaScript Type Documentation (Vanilla JS Implementation)

### JSDoc Comments
- **Type Annotations**: Use JSDoc for type hints in vanilla JavaScript
- **Function Documentation**: Document parameters, return types, and side effects
- **Module Interface**: Document public API methods and properties

```javascript
/**
 * Creates a Timeline component instance.
 * @param {HTMLElement} container - The DOM element to render into
 * @param {Object} config - Configuration options
 * @param {string} config.datum - ISO date string for reference date
 * @param {string} config.orientation - 'horizontal' or 'vertical'
 * @returns {Object} Timeline instance with methods: render, update, destroy
 */
function Timeline(container, config) {
  // implementation
}

/**
 * Renders the timeline to the DOM.
 * @param {Array} events - Array of event objects
 * @returns {void}
 */
Timeline.prototype.render = function(events) {
  // implementation
};
```


## Styling Approach

### CSS Strategy
- **CSS Modules or Scoped CSS**: Avoid global style pollution
- **CSS Variables**: Use for theming and customization (e.g., `--primary-color`)
- **Flexbox/Grid**: Prefer for layout over floats or absolute positioning
- **Responsive Design**: Mobile-first approach with `@media` queries
- **Semantic HTML**: Use appropriate HTML elements for accessibility

### Naming
- Use kebab-case for CSS class names
- Component-scoped classes avoid conflicts
- BEM or similar methodology optional but recommended

## Testing Standards

### Test Types
1. **Unit Tests**: Test individual functions and utilities in isolation
2. **Component Tests**: Test React component rendering and interactions; Test vanilla JS factory functions and methods
3. **Integration Tests**: Test multiple components or modules working together
4. **E2E Tests**: Test complete user workflows

### Testing Requirements
- **Coverage**: Aim for >80% code coverage
- **Test Organization**: Use descriptive test names with clear arrange-act-assert pattern
- **Mocking**: Mock external dependencies (APIs, date libraries, etc.)
- **Accessibility Testing**: Include tests for keyboard navigation and ARIA attributes
- **DOM Testing** (Vanilla JS): Use jsdom or DOM testing library for vanilla component tests

### Tools
- **React Unit/Component**: Jest, React Testing Library, Vitest
- **Vanilla JS Unit/Component**: Jest, Mocha, Sinon, jsdom/DOM testing library
- **E2E**: Cypress, Playwright, or similar
- **Coverage**: Aim for >80% line and branch coverage

## Code Quality

### Linting & Formatting
- **ESLint**: Enforce code quality rules
  - Config: AirBnB or similar community standard
  - Disable rules only with documentation
- **Prettier**: Automatic code formatting
- **Pre-commit Hooks**: Run linting/formatting before commits

### Code Standards
- **Line Length**: Maximum 80 characters (except URLs)
- **Comments**: Document WHY, not WHAT; use JSDoc for exported functions
- **Error Handling**: Explicit try-catch or error boundaries where appropriate
- **Magic Numbers**: Extract to named constants
- **DRY Principle**: Avoid code duplication; extract to utilities/components

## Documentation Standards

### JSDoc Comments (TypeScript)
```typescript
/**
 * Calculates the position of an event on the timeline.
 * @param date - The event date
 * @param scale - Pixels per day
 * @returns The pixel position relative to start
 */
function calculatePosition(date: Date, scale: number): number {
  // implementation
}
```

**Note**: For vanilla JavaScript without TypeScript, use JSDoc type annotations (see JavaScript Type Documentation section).

### README Documentation
- Clear problem overview
- Functional specifications
- Non-functional requirements
- Data formats and schemas
- Usage examples
- Getting started instructions

### Inline Comments
- Explain complex logic or non-obvious decisions
- Provide context for unusual patterns
- Link to issues or documentation when relevant

## Accessibility (WCAG 2.1 Level AA)

### Keyboard Navigation
- All interactive elements must be reachable via keyboard
- Tab order should be logical and intuitive
- Escape key should close modals/menus
- Arrow keys for navigation within custom controls

### Semantic HTML
- Use appropriate elements: `<button>` for buttons, `<a>` for links
- Avoid `<div>` for interactive elements
- Use heading hierarchy (`<h1>` through `<h6>`)
- Use `<label>` with form inputs

### ARIA Attributes
- Add `aria-label` or `aria-labelledby` for visual-only labels
- Use `role` attribute only when no semantic element exists
- Describe dynamic regions with `aria-live` when appropriate
- Add `aria-hidden` for decorative elements

### Visual Design
- **Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Clear visual focus states
- **Color**: Don't rely on color alone to convey information
- **Touch Targets**: Minimum 44x44 pixels on mobile

## Security Practices

### Input Validation
- Validate all external input (JSON, API responses, user input)
- Use schema validation libraries (e.g., Zod, io-ts)
- Sanitize HTML content before rendering

### XSS Prevention
- React escapes JSX by default; leverage this
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Sanitize user content if innerHTML is unavoidable

### Data Handling
- Use robust date libraries (not `new Date()` parsing)
- Validate JSON structures against schemas
- Never execute code from JSON or untrusted sources

## Performance Optimization

### Rendering Performance
- Measure with React DevTools Profiler
- Identify and fix unnecessary re-renders
- Use memoization for expensive components
- Lazy load components/routes where appropriate

### Bundle Optimization
- Use dynamic imports for code splitting
- Monitor bundle size with tools like `bundlesize`
- Minimize dependencies; evaluate each carefully
- Use tree-shaking friendly patterns

### Runtime Performance
- Aim for First Paint < 1s, Interactive < 3s
- Debounce/throttle frequent events (scroll, resize, input)
- Use virtual scrolling for large lists
- Avoid layout thrashing (batch DOM reads/writes)

## Browser Support
- **Target**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ECMAScript**: ES6+ (use transpilation if supporting older browsers)
- **CSS**: Grid and Flexbox required
- **Touch Events**: Support on mobile devices

## Development Workflow

### Git Practices
- Atomic commits with clear messages
- Feature branches for new work
- Meaningful pull request descriptions
- Code review before merging

### Development Environment
- Node.js: Specify version in `.nvmrc` or similar
- Package Manager: Document which to use (npm, yarn, pnpm)
- IDE: ESLint and Prettier integration recommended
- Pre-commit Hooks: Run linting/formatting automatically

## Dependencies

### Selection Criteria
- **Size**: Prefer smaller, focused libraries
- **Maintenance**: Active projects with regular updates
- **Security**: Check for known vulnerabilities
- **Bundle Impact**: Consider both size and performance
- **Documentation**: Good documentation and examples

### Avoid
- Unmaintained packages
- Overly large frameworks for simple tasks
- Dependencies for one-off use cases

## Maintaining Separation of Concerns

### Content Guidelines
To keep this file as a reusable technology guide:

1. **Review Before Adding Content**: Ask "Is this guidance applicable to React/JavaScript component development in general, or is it specific to the Timeline project?"
   - **General guidance** → belongs here
   - **Timeline-specific details** → goes in README.md

2. **Red Flags for Problem-Specific Content**:
   - References to project names (Timeline, Timeline events)
   - Specific feature requirements or use cases
   - Project-specific data structures or JSON examples
   - Domain logic or business rules
   - Specific performance targets for this component

3. **Cross-Reference Pattern**:
   - copilot-instructions.md: "How should we approach testing in React?" or "How should we structure AMD modules?"
   - README.md: "Here's what the Timeline component needs to be tested for"

### Keeping README.md as Single Source of Truth
The README.md file should contain:
- Complete problem description and functional requirements
- Non-functional requirements and performance targets
- All example data formats and JSON schemas
- Component-specific architecture and data flow
- Usage examples and integration patterns
- Project setup and development instructions

Feel free to reference README.md from this file when needed (e.g., "See README.md for project specifications"), but do not duplicate problem-specific content.
