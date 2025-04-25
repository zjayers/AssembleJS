# Islands Architecture in AssembleJS

AssembleJS implements the "Islands Architecture" approach to provide optimal performance and user experience by rendering most content on the server while selectively hydrating interactive components on the client.

## What is Islands Architecture?

Islands Architecture is a rendering approach that enables:

- **Server-side rendering** of the majority of your content
- **Selective hydration** of interactive areas (the "islands")
- **Minimal client-side JavaScript** for faster page loads
- **Progressive enhancement** for better user experience

The term "islands" refers to interactive components surrounded by a sea of static HTML. This approach combines the best aspects of static site generation and client-side rendering.

## How AssembleJS Implements Islands

AssembleJS implements Islands Architecture through its unique component model:

1. **Server-Side Rendering**: The entire page is initially rendered on the server
2. **Component Isolation**: Each component is rendered in isolation
3. **Selective Hydration**: Only interactive components are hydrated on the client
4. **Loading Directives**: Components can specify when and how they should be hydrated

## Benefits of Islands Architecture

Islands Architecture provides several key benefits:

### 1. Performance Improvements

- **Faster Initial Load**: Most content is server-rendered HTML, which loads quickly
- **Reduced JavaScript**: Only interactive components need JavaScript
- **Smaller Bundle Sizes**: Scripts are split by component
- **Progressive Loading**: Critical components can be prioritized

### 2. Better User Experience

- **No Layout Shifts**: Server-rendered content doesn't shift during hydration
- **Instant Content Visibility**: Users see content immediately
- **Progressive Enhancement**: Basic functionality works even before JavaScript loads
- **Resilience**: A JavaScript error in one island doesn't break the entire page

### 3. Development Benefits

- **Component Isolation**: Components can be developed and tested independently
- **Framework Flexibility**: Different islands can use different frameworks
- **Simplified State Management**: State is contained within island boundaries
- **Clear Performance Boundaries**: Easier to identify and optimize performance bottlenecks

## Client Directives

AssembleJS provides several client directives to control when and how components are hydrated:

| Directive | Description |
|-----------|-------------|
| `client:load` | Hydrate immediately when the page loads |
| `client:idle` | Hydrate during browser idle time |
| `client:visible` | Hydrate when the component enters the viewport |
| `client:media` | Hydrate based on media queries |
| `client:only` | Client-only component (not server rendered) |

### How to Use Client Directives

Client directives can be specified in your component files or during component registration:

```typescript
// In your Blueprint configuration
{
  components: [
    {
      name: 'interactive-chart',
      view: 'path/to/chart.view.tsx',
      client: 'path/to/chart.client.ts',
      directive: 'client:visible' // Only hydrate when visible
    }
  ]
}
```

Or in your component client file:

```typescript
// chart.client.ts
import { Blueprint } from 'asmbl';

class ChartComponent extends Blueprint {
  static override clientDirective = 'client:visible';
  
  protected override onMount(): void {
    super.onMount();
    // Component initialization
  }
}

export default ChartComponent;
```

## Partial Hydration Strategies

AssembleJS provides different strategies for partial hydration:

### 1. Component-Level Hydration

The most common approach, where entire components are hydrated as islands:

```
+-----------------------------------------------------+
|                      Static HTML                     |
|                                                     |
|   +-------------+          +-----------------+      |
|   |             |          |                 |      |
|   | Interactive |          |   Interactive   |      |
|   |  Component  |          |    Component    |      |
|   |             |          |                 |      |
|   +-------------+          +-----------------+      |
|                                                     |
|                      Static HTML                     |
+-----------------------------------------------------+
```

### 2. Progressive Hydration

Components hydrate in stages, with critical functionality first:

```typescript
// product-card.client.ts
import { Blueprint } from 'asmbl';

class ProductCardComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Phase 1: Essential interactivity (immediate)
    this.setupQuickView();
    
    // Phase 2: Enhanced features (idle)
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.setupColorSelector();
        this.setupSizeSelector();
      });
    } else {
      setTimeout(() => {
        this.setupColorSelector();
        this.setupSizeSelector();
      }, 200);
    }
    
    // Phase 3: Non-critical features (visible + delay)
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          this.setupRecommendations();
          this.setupReviews();
        }, 500);
        observer.disconnect();
      }
    });
    observer.observe(this.element);
  }
  
  // Implementation of setup methods...
}

export default ProductCardComponent;
```

### 3. Feature-Based Hydration

Only specific parts of a component are hydrated:

```typescript
// complex-dashboard.client.ts
import { Blueprint } from 'asmbl';

class DashboardComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Only hydrate interactive parts
    const chartElement = this.element.querySelector('.dashboard-chart');
    if (chartElement) {
      this.hydrateChart(chartElement);
    }
    
    const filtersElement = this.element.querySelector('.dashboard-filters');
    if (filtersElement) {
      this.hydrateFilters(filtersElement);
    }
    
    // Static parts remain as HTML
  }
  
  // Implementation of hydration methods...
}

export default DashboardComponent;
```

## Streaming SSR with Islands

AssembleJS supports streaming server-side rendering with islands:

1. **Critical Path Rendering**: Critical components render first
2. **Progressive HTML Streaming**: HTML is streamed to the browser in chunks
3. **Island Hydration**: Interactive islands hydrate as they become available

This approach provides the fastest possible time to first contentful paint while maintaining interactivity.

## Islands with Different Frameworks

One powerful feature of AssembleJS is the ability to use different frameworks for different islands:

```
+-----------------------------------------------------+
|                      Static HTML                     |
|                                                     |
|   +-------------+          +-----------------+      |
|   |             |          |                 |      |
|   |    React    |          |      Svelte     |      |
|   |  Component  |          |    Component    |      |
|   |             |          |                 |      |
|   +-------------+          +-----------------+      |
|                                                     |
|   +--------------------------+                      |
|   |                          |                      |
|   |        Vue Component     |      Static HTML     |
|   |                          |                      |
|   +--------------------------+                      |
+-----------------------------------------------------+
```

Each framework-specific island is isolated, allowing different teams to use their preferred technologies.

## Island Boundaries and Communication

Islands are isolated by design, but they can communicate through the AssembleJS event system:

```typescript
// component-a.client.ts
import { Blueprint } from 'asmbl';

class ComponentA extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    const button = this.element.querySelector('button');
    button?.addEventListener('click', () => {
      // Notify other islands
      this.eventBus.publish('feature:activated', { featureId: 'x' });
    });
  }
}

export default ComponentA;
```

```typescript
// component-b.client.ts
import { Blueprint } from 'asmbl';

class ComponentB extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for events from other islands
    this.eventBus.subscribe('feature:activated', (data) => {
      if (data.featureId === 'x') {
        this.activateFeature();
      }
    });
  }
  
  private activateFeature(): void {
    // Implementation...
  }
}

export default ComponentB;
```

## Islands and SEO

Islands Architecture provides excellent SEO benefits:

1. **Complete Server Rendering**: Search engines see the complete content
2. **Fast Load Times**: Performance is a ranking factor
3. **Accessibility**: Core functionality works without JavaScript
4. **Progressive Enhancement**: Critical content is available immediately

## Performance Metrics

Islands Architecture helps improve key performance metrics:

- **First Contentful Paint (FCP)**: Faster because most content is server-rendered
- **Largest Contentful Paint (LCP)**: Main content loads quickly as HTML
- **Time to Interactive (TTI)**: Interactive elements become usable sooner
- **Total Blocking Time (TBT)**: Reduced because JavaScript is split and deferred
- **Cumulative Layout Shift (CLS)**: Minimized because content is pre-rendered

## Debugging Islands

AssembleJS provides tools to help debug islands in development:

1. **Island Boundaries**: Visual indicators show island boundaries
2. **Hydration Status**: Color-coding shows which islands are hydrated
3. **Performance Metrics**: See timing information for each island
4. **Event Monitoring**: Track events between islands

## Best Practices

1. **Keep Islands Small**: Focus on specific interactive functionality
2. **Minimize Dependencies**: Each island should have minimal dependencies
3. **Use Appropriate Directives**: Choose the right hydration timing for each component
4. **Consider the Critical Path**: Prioritize islands that are above the fold or essential for core functionality
5. **Test Progressive Enhancement**: Ensure basic functionality works without JavaScript
6. **Monitor Performance**: Track the impact of islands on key performance metrics
7. **Balance Islands and Static Content**: Not everything needs to be interactive

## Example: E-commerce Product Listing

```
+-----------------------------------------------------+
|     Header with Navigation (client:load)             |
+-----------------------------------------------------+
|                                                     |
|   Filters (client:idle)      Sort (client:visible)  |
|                                                     |
+-----------------------------------------------------+
|                                                     |
|   +-------------+          +-----------------+      |
|   |             |          |                 |      |
|   |   Product   |          |     Product     |      |
|   |    Card     |          |      Card       |      |
|   | (visible)   |          |   (visible)     |      |
|   |             |          |                 |      |
|   +-------------+          +-----------------+      |
|                                                     |
|   +-------------+          +-----------------+      |
|   |             |          |                 |      |
|   |   Product   |          |     Product     |      |
|   |    Card     |          |      Card       |      |
|   | (visible)   |          |   (visible)     |      |
|   |             |          |                 |      |
|   +-------------+          +-----------------+      |
|                                                     |
+-----------------------------------------------------+
|   Pagination Controls (client:visible)              |
+-----------------------------------------------------+
|                                                     |
|   Footer (Static HTML)                              |
|                                                     |
+-----------------------------------------------------+
```

In this example:
- Critical navigation hydrates immediately
- Product cards hydrate only when visible
- Filters and sorting hydrate during idle time or when visible
- Footer remains static HTML with no hydration

## Conclusion

Islands Architecture is a powerful approach that provides the best of both server-rendering and client-side interactivity. AssembleJS's implementation allows you to create high-performance applications with excellent user experience, while maintaining developer productivity and flexibility.

## Related Topics

- [Advanced Server-Side Rendering](./advanced-server-side-rendering.md)
- [Component Lifecycle](./advanced-component-lifecycle.md)
- [Cross-Framework State](./advanced-cross-framework-state.md)
- [Security Best Practices](./advanced-security.md)