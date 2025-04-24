# Component Lifecycle

AssembleJS components go through a well-defined lifecycle from server-side rendering to client-side hydration. Understanding this lifecycle is essential for building efficient, interactive components.

## Overview

The component lifecycle in AssembleJS consists of these main phases:

1. **Server-Side Phase**: Components are rendered on the server
2. **Transfer Phase**: HTML is sent to the client
3. **Client Initialization Phase**: Client scripts are loaded and initialized
4. **Hydration Phase**: Components become interactive
5. **Runtime Phase**: Components respond to interactions and update
6. **Cleanup Phase**: Resources are released when components are removed

## Server-Side Phase

### Component Instance Creation

When a request comes in, AssembleJS creates component instances:

```typescript
// Server-side rendering process (simplified)
async function renderComponentTree(rootComponent, context) {
  // Create component instance
  const componentInstance = createServerComponentInstance(rootComponent, context);
  
  // Prepare component data
  await componentInstance.prepare();
  
  // Render component to HTML
  const html = await componentInstance.render();
  
  return html;
}
```

### Data Preparation

Before rendering, components can prepare their data:

```typescript
// Factory for data preparation
export class ProductFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    // Fetch data needed by the component
    const productId = context.params.get('id');
    const product = await this.productService.getProductById(productId);
    
    // Make data available to the component
    context.data.set('product', product);
  }
}
```

### Rendering to HTML

Components are rendered to HTML on the server:

```typescript
// Preact component rendering
export function ProductDetail(context) {
  const { product } = context.data;
  
  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <div className="product-image">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="product-info">
        <p className="price">${product.price.toFixed(2)}</p>
        <p className="description">{product.description}</p>
        <button className="add-to-cart">Add to Cart</button>
      </div>
      
      {/* Include client script for interactivity */}
      <script src="product-detail.client.ts"></script>
    </div>
  );
}
```

### State Serialization

For stateful components, initial state is serialized:

```typescript
export function Counter(context) {
  const initialCount = context.data.initialCount || 0;
  
  return (
    <div className="counter">
      <p>Count: <span className="value">{initialCount}</span></p>
      <button className="decrement">-</button>
      <button className="increment">+</button>
      
      {/* Serialize initial state for client hydration */}
      <script type="application/json" id="counter-state">
        {JSON.stringify({ count: initialCount })}
      </script>
      
      <script src="counter.client.ts"></script>
    </div>
  );
}
```

## Transfer Phase

### Initial HTML Delivery

The server sends the complete HTML to the client:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Product Detail - AssembleJS Store</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <div class="product-detail">
    <h1>Premium Headphones</h1>
    <div class="product-image">
      <img src="/images/headphones.jpg" alt="Premium Headphones">
    </div>
    <div class="product-info">
      <p class="price">$149.99</p>
      <p class="description">High-quality over-ear headphones with noise cancellation.</p>
      <button class="add-to-cart">Add to Cart</button>
    </div>
    
    <script src="product-detail.client.js"></script>
  </div>
</body>
</html>
```

### Asset Loading

Critical assets are loaded immediately, while others may be deferred:

```html
<head>
  <!-- Critical CSS -->
  <link rel="stylesheet" href="/styles/critical.css">
  
  <!-- Preload critical assets -->
  <link rel="preload" href="/scripts/core.js" as="script">
  
  <!-- Defer non-critical CSS -->
  <link rel="preload" href="/styles/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
<body>
  <!-- Content here -->
  
  <!-- Load critical scripts -->
  <script src="/scripts/core.js"></script>
  
  <!-- Defer non-critical scripts -->
  <script defer src="/scripts/non-critical.js"></script>
</body>
```

## Client Initialization Phase

### Client Script Loading

Client scripts are loaded based on what's present in the HTML:

```typescript
// AssembleJS client bootstrap (simplified)
document.addEventListener('DOMContentLoaded', () => {
  // Find all component scripts
  const componentScripts = document.querySelectorAll('script[src$=".client.js"]');
  
  // Load each component script
  Promise.all(Array.from(componentScripts).map(script => {
    const src = script.getAttribute('src');
    return loadScript(src);
  })).then(() => {
    // All component scripts loaded
    document.dispatchEvent(new Event('AssembleJSReady'));
  });
});
```

### Client Registry

Components register with the client registry:

```typescript
// Client-side component registration
import { registerComponent } from 'assemblejs/client';

// Register the product detail component
registerComponent('product-detail', {
  // Component configuration
  selector: '.product-detail',
  
  // Lifecycle hooks
  init() {
    // Called when the component is initialized
  },
  
  mount() {
    // Called when the component is mounted
  }
});
```

## Hydration Phase

### Component Discovery

The framework discovers component instances in the DOM:

```typescript
// Client component manager (simplified)
class ClientComponentManager {
  discoverComponents() {
    // Find all component containers in the DOM
    const componentContainers = document.querySelectorAll('[data-component]');
    
    // Create client component instances
    componentContainers.forEach(container => {
      const componentType = container.getAttribute('data-component');
      const componentConfig = this.registry.get(componentType);
      
      if (componentConfig) {
        // Create and initialize the component
        const component = new ClientComponent(container, componentConfig);
        component.init();
      }
    });
  }
}
```

### State Restoration

Components restore their state from serialized data:

```typescript
// Counter component client code
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('counter');

client.onReady(() => {
  // Get the component element
  const counter = document.querySelector('.counter');
  if (!counter) return;
  
  // Restore state from serialized data
  const stateElement = counter.querySelector('#counter-state');
  const initialState = JSON.parse(stateElement.textContent);
  let count = initialState.count;
  
  // Get UI elements
  const valueElement = counter.querySelector('.value');
  const decrementButton = counter.querySelector('.decrement');
  const incrementButton = counter.querySelector('.increment');
  
  // Add event listeners
  decrementButton.addEventListener('click', () => {
    count--;
    updateUI();
  });
  
  incrementButton.addEventListener('click', () => {
    count++;
    updateUI();
  });
  
  function updateUI() {
    valueElement.textContent = count.toString();
  }
});
```

### Event Binding

Components bind event listeners to enable interactivity:

```typescript
// Product detail client code
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('product-detail');

client.onReady(() => {
  // Get elements
  const productDetail = document.querySelector('.product-detail');
  if (!productDetail) return;
  
  const addToCartButton = productDetail.querySelector('.add-to-cart');
  
  // Get product data
  const productName = productDetail.querySelector('h1').textContent;
  const productPrice = parseFloat(
    productDetail.querySelector('.price').textContent.replace('$', '')
  );
  
  // Add event listeners
  addToCartButton.addEventListener('click', () => {
    // Add to cart functionality
    client.events.publish('cart:add-item', {
      name: productName,
      price: productPrice,
      quantity: 1
    });
    
    // Update UI
    addToCartButton.textContent = 'Added to Cart';
    addToCartButton.disabled = true;
    
    // Reset after delay
    setTimeout(() => {
      addToCartButton.textContent = 'Add to Cart';
      addToCartButton.disabled = false;
    }, 2000);
  });
});
```

## Runtime Phase

### Event Handling

Components respond to events:

```typescript
// Shopping cart client code
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('shopping-cart');

client.onReady(() => {
  // Get elements
  const cartElement = document.querySelector('.shopping-cart');
  if (!cartElement) return;
  
  const itemsContainer = cartElement.querySelector('.cart-items');
  const totalElement = cartElement.querySelector('.cart-total');
  
  // Cart state
  let cartItems = [];
  let cartTotal = 0;
  
  // Listen for cart events
  client.events.subscribe('cart:add-item', (item) => {
    // Check if item already exists
    const existingItem = cartItems.find(i => i.name === item.name);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cartItems.push({ ...item });
    }
    
    // Update cart total
    cartTotal = cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    // Update UI
    updateCartUI();
  });
  
  function updateCartUI() {
    // Update items display
    itemsContainer.innerHTML = cartItems.map(item => `
      <div class="cart-item">
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">${item.quantity}</span>
        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
    
    // Update total
    totalElement.textContent = `$${cartTotal.toFixed(2)}`;
    
    // Show/hide empty state
    cartElement.classList.toggle('empty', cartItems.length === 0);
  }
});
```

### State Management

Components manage their own state:

```typescript
// Toggle component client code
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('toggle');

client.onReady(() => {
  // Get elements
  const toggles = document.querySelectorAll('.toggle');
  
  toggles.forEach(toggle => {
    // Initialize state
    let isActive = toggle.classList.contains('active');
    
    // Get elements
    const button = toggle.querySelector('.toggle-button');
    const content = toggle.querySelector('.toggle-content');
    
    // Initial state
    updateUI();
    
    // Add event listener
    button.addEventListener('click', () => {
      isActive = !isActive;
      updateUI();
      
      // Emit event
      client.events.publish('toggle:change', { 
        id: toggle.id, 
        isActive 
      });
    });
    
    function updateUI() {
      toggle.classList.toggle('active', isActive);
      button.setAttribute('aria-expanded', isActive.toString());
      content.style.display = isActive ? 'block' : 'none';
    }
  });
});
```

### DOM Updates

Components update the DOM in response to state changes:

```typescript
// Filter component client code
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('product-filter');

client.onReady(() => {
  // Get elements
  const filterForm = document.querySelector('.product-filter');
  if (!filterForm) return;
  
  const filterInputs = filterForm.querySelectorAll('input, select');
  const productGrid = document.querySelector('.product-grid');
  const products = Array.from(productGrid.querySelectorAll('.product-card'));
  
  // Add event listeners
  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      // Get filter values
      const filters = Array.from(filterInputs).reduce((acc, input) => {
        if (input.type === 'checkbox') {
          if (!acc[input.name]) acc[input.name] = [];
          if (input.checked) acc[input.name].push(input.value);
        } else {
          acc[input.name] = input.value;
        }
        return acc;
      }, {});
      
      // Apply filters
      products.forEach(product => {
        const shouldShow = applyFilters(product, filters);
        product.style.display = shouldShow ? 'block' : 'none';
      });
      
      // Publish filter change event
      client.events.publish('products:filtered', { filters });
    });
  });
  
  function applyFilters(product, filters) {
    // Implementation of filter logic
    // ...
    return true; // or false based on filter match
  }
});
```

## Cleanup Phase

### Removing Event Listeners

Components should clean up event listeners when removed:

```typescript
// Component with cleanup
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('chart');

client.onReady(() => {
  // Get elements
  const chartContainer = document.querySelector('.chart-container');
  if (!chartContainer) return;
  
  // Initialize chart
  const chart = initializeChart(chartContainer);
  
  // Event handler for window resize
  const handleResize = () => {
    resizeChart(chart, chartContainer);
  };
  
  // Register event listeners
  window.addEventListener('resize', handleResize);
  
  // Listen for component removal
  client.onDestroy(() => {
    // Clean up event listeners
    window.removeEventListener('resize', handleResize);
    
    // Dispose of chart resources
    disposeChart(chart);
  });
});
```

### Resource Cleanup

Components should release resources when removed:

```typescript
// Video player component with resource cleanup
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('video-player');

client.onReady(() => {
  // Get elements
  const playerContainer = document.querySelector('.video-player');
  if (!playerContainer) return;
  
  // Initialize video
  const videoElement = playerContainer.querySelector('video');
  const player = initializeVideoPlayer(videoElement);
  
  // Track intervals and timeouts
  const timers = [];
  
  // Add progress tracking
  const progressInterval = setInterval(() => {
    updateProgress(player);
  }, 1000);
  timers.push(progressInterval);
  
  // Clean up when component is destroyed
  client.onDestroy(() => {
    // Stop all timers
    timers.forEach(timer => clearInterval(timer));
    
    // Pause video
    videoElement.pause();
    
    // Release player resources
    player.dispose();
  });
});
```

## Advanced Lifecycle Features

### Lazy Hydration

Delay hydration for non-critical components:

```typescript
// Lazy hydration based on viewport visibility
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('lazy-comments');

// Delay initialization until element is visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible, initialize the component
      const commentsSection = entry.target;
      
      // Load comments data
      fetch('/api/comments')
        .then(response => response.json())
        .then(comments => {
          // Render comments
          renderComments(commentsSection, comments);
          
          // Set up interaction handlers
          initializeCommentHandlers(commentsSection);
        });
      
      // Stop observing
      observer.unobserve(commentsSection);
    }
  });
});

client.onReady(() => {
  // Find the comments section
  const commentsSection = document.querySelector('.comments-section');
  if (!commentsSection) return;
  
  // Start observing for visibility
  observer.observe(commentsSection);
});
```

### Lifecycle Hooks

Components can use various lifecycle hooks:

```typescript
// Component with all lifecycle hooks
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('advanced-component');

// Called before DOM is ready
client.onInitialize(() => {
  // Set up global state or services
  console.log('Component initializing...');
});

// Called when DOM is ready
client.onReady(() => {
  console.log('Component DOM ready');
  // Initialize DOM interactions
});

// Called when component becomes visible
client.onVisible(() => {
  console.log('Component is now visible');
  // Start animations or load resources
});

// Called after initial render and hydration
client.onHydrated(() => {
  console.log('Component is fully hydrated');
  // Start more complex interactions
});

// Called periodically during component lifetime
client.onUpdate(() => {
  console.log('Component updating');
  // Update based on state changes
});

// Called when component is about to be removed
client.onBeforeDestroy(() => {
  console.log('Component will be destroyed soon');
  // Prepare for cleanup
});

// Called when component is removed
client.onDestroy(() => {
  console.log('Component destroyed');
  // Final cleanup
});
```

### State Persistence

Persist component state across page loads:

```typescript
// Component with state persistence
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('persistent-settings');

// Storage key
const STORAGE_KEY = 'user-settings';

client.onReady(() => {
  // Get elements
  const settingsForm = document.querySelector('.settings-form');
  if (!settingsForm) return;
  
  // Get form inputs
  const inputs = settingsForm.querySelectorAll('input, select');
  
  // Load saved settings
  let settings = loadSettings();
  
  // Apply saved settings to form
  applySettings(settings);
  
  // Listen for changes
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      // Update settings object
      updateSettings();
      
      // Save settings
      saveSettings(settings);
      
      // Notify other components
      client.events.publish('settings:updated', settings);
    });
  });
  
  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to load settings:', e);
      return {};
    }
  }
  
  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }
  
  function updateSettings() {
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        settings[input.name] = input.checked;
      } else if (input.type === 'radio') {
        if (input.checked) settings[input.name] = input.value;
      } else {
        settings[input.name] = input.value;
      }
    });
  }
  
  function applySettings(settings) {
    inputs.forEach(input => {
      if (input.name in settings) {
        if (input.type === 'checkbox') {
          input.checked = settings[input.name];
        } else if (input.type === 'radio') {
          input.checked = (input.value === settings[input.name]);
        } else {
          input.value = settings[input.name];
        }
      }
    });
  }
});
```

## Best Practices

### Performance Optimization

Optimize component lifecycle for performance:

1. **Minimize DOM operations**: Batch DOM updates to reduce reflows
2. **Use requestAnimationFrame**: For smooth animations and DOM updates
3. **Lazy load components**: Only hydrate components when needed
4. **Throttle event handlers**: For scroll, resize, and other frequent events
5. **Debounce user input**: For search fields and other input handling

```typescript
// Optimized component example
import { createComponentClient } from 'assemblejs';
import { throttle, debounce } from 'assemblejs/utils';

const client = createComponentClient('optimized-component');

client.onReady(() => {
  // DOM elements
  const container = document.querySelector('.scrollable-content');
  if (!container) return;
  
  // Throttled scroll handler (max once per 100ms)
  const handleScroll = throttle(() => {
    // Scroll handling logic
    updateScrollPosition(container.scrollTop);
  }, 100);
  
  // Debounced search input (wait until typing pauses for 300ms)
  const searchInput = container.querySelector('.search-input');
  const handleSearchInput = debounce((e) => {
    performSearch(e.target.value);
  }, 300);
  
  // Event listeners
  container.addEventListener('scroll', handleScroll);
  searchInput.addEventListener('input', handleSearchInput);
  
  // Batch DOM updates with requestAnimationFrame
  function updateUI(newData) {
    requestAnimationFrame(() => {
      // Perform all DOM updates here
    });
  }
  
  // Clean up when component is destroyed
  client.onDestroy(() => {
    container.removeEventListener('scroll', handleScroll);
    searchInput.removeEventListener('input', handleSearchInput);
  });
});
```

### Testing Components

Test components across their lifecycle:

```typescript
// Component test example
describe('Counter Component', () => {
  // Test server-side rendering
  test('should render with initial count', () => {
    const html = renderComponent('counter', { initialCount: 5 });
    expect(html).toContain('<span class="value">5</span>');
  });
  
  // Test client-side hydration
  test('should hydrate correctly', async () => {
    // Set up DOM with server-rendered HTML
    document.body.innerHTML = `
      <div class="counter">
        <p>Count: <span class="value">5</span></p>
        <button class="decrement">-</button>
        <button class="increment">+</button>
        <script type="application/json" id="counter-state">
          {"count":5}
        </script>
      </div>
    `;
    
    // Initialize client
    const client = createComponentClient('counter');
    client.init();
    
    // Ensure hydration is complete
    await waitForHydration();
    
    // Test interactions
    const incrementButton = document.querySelector('.increment');
    incrementButton.click();
    
    // Check state update
    expect(document.querySelector('.value').textContent).toBe('6');
  });
  
  // Test cleanup
  test('should clean up resources when destroyed', () => {
    // Initialize component
    const client = createComponentClient('counter');
    client.init();
    
    // Mock event listener removal
    const removeEventListenerSpy = jest.spyOn(Element.prototype, 'removeEventListener');
    
    // Destroy component
    client.destroy();
    
    // Verify cleanup
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
```

## Common Pitfalls and Solutions

### Memory Leaks

Prevent memory leaks by cleaning up resources:

```typescript
// Component with potential memory leak
client.onReady(() => {
  // Create an observer
  const observer = new MutationObserver(() => {
    // Handle DOM changes
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });
  
  // WRONG: No cleanup when component is destroyed!
});

// Fixed version with proper cleanup
client.onReady(() => {
  // Create an observer
  const observer = new MutationObserver(() => {
    // Handle DOM changes
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });
  
  // CORRECT: Clean up when component is destroyed
  client.onDestroy(() => {
    observer.disconnect();
  });
});
```

### Hydration Mismatch

Ensure server and client output matches:

```typescript
// WRONG: Different output on server and client
// Server-side component
export function Greeting(context) {
  // Uses server time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : 'Good afternoon';
  
  return <h1>{greeting}, {context.data.userName}!</h1>;
}

// FIXED: Consistent output
// Server-side component
export function Greeting(context) {
  return (
    <div className="greeting" data-component-id="greeting">
      {/* Server renders placeholder */}
      <h1>Hello, {context.data.userName}!</h1>
      
      {/* Client will update with time-based greeting */}
      <script src="greeting.client.ts"></script>
    </div>
  );
}

// Client-side script
client.onReady(() => {
  const greeting = document.querySelector('.greeting');
  const heading = greeting.querySelector('h1');
  const userName = heading.textContent.split(', ')[1].replace('!', '');
  
  // Use client time
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good morning' : 'Good afternoon';
  
  // Update text
  heading.textContent = `${timeGreeting}, ${userName}!`;
});
```

## Next Steps

Now that you understand the AssembleJS component lifecycle, explore these related topics:

- [Islands Architecture](advanced-islands-architecture.md) for more on the component model
- [Server-Side Rendering](advanced-server-side-rendering.md) for details on the server rendering process
- [Cross-Framework State](advanced-cross-framework-state.md) to learn about state management
- [Performance Optimization](performance-optimization.md) for advanced performance techniques