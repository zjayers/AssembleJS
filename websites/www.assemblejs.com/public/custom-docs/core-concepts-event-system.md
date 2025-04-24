# Event System in AssembleJS

The Event System is a core feature of AssembleJS that enables communication between components without creating tight coupling. It follows a publish/subscribe pattern to allow components to interact while maintaining independence.

## Why Use an Event System?

In a component-based architecture, different parts of the application need to communicate with each other. Traditional approaches often lead to:

1. **Prop Drilling**: Passing data through multiple layers of components
2. **Direct Dependencies**: Components that know too much about each other
3. **Global State Complexity**: Overuse of global state for simple interactions

The AssembleJS Event System solves these issues by:

1. **Decoupling Components**: Components can communicate without direct references
2. **Simplifying Interfaces**: Components only need to know about events, not other components
3. **Enabling Cross-Framework Communication**: Events work across different UI frameworks
4. **Supporting Server/Client Bridge**: Events can be synchronized between server and client

## Basic Event System Concepts

### Event Addresses

Events in AssembleJS are identified by addresses, which consist of a channel and topic:

```typescript
// Event address format
interface EventAddress {
  channel: string; // The event channel
  topic: string;   // The event topic
}

// Example addresses
{ channel: 'cart', topic: 'item.added' }
{ channel: 'user', topic: 'profile.updated' }
{ channel: 'navigation', topic: 'route.changed' }
```

This addressing system allows for precise targeting and filtering of events.

### Event Bus

The central event bus manages the publication and subscription of events. Within a Blueprint component, you can use built-in methods to interact with the event system:

```typescript
// From within a Blueprint component
// Publishing an event to all components
this.toComponents({ 
  productId: '123', 
  quantity: 2 
}, 'add');

// Subscribing to an event
this.subscribe({ channel: 'cart', topic: 'add' }, (event) => {
  console.log('Item added to cart:', event.payload);
});
```

### Event Objects

Each event contains metadata and payload information:

```typescript
interface BlueprintEvent<T = unknown> {
  channel: string;       // The event channel
  topic: string;         // The event topic
  payload: T;            // The event payload
}
```

## Using the Event System

### Publishing Events

Components can publish events to notify others about changes or actions:

```typescript
// In a component client file
import { Blueprint } from "asmbl";

export class CartButtonClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Find the add-to-cart button within this component's root element
    const addButton = this.root.querySelector('.add-to-cart-btn');
    
    if (addButton) {
      addButton.addEventListener('click', this.handleAddToCart.bind(this));
    }
  }
  
  private handleAddToCart(e: Event): void {
    e.preventDefault();
    
    // Get product information
    const productId = this.root.getAttribute('data-product-id');
    const quantity = parseInt(
      this.root.querySelector('.quantity-input')?.value || '1'
    );
    
    // Publish the event to components
    this.toComponents({ 
      productId, 
      quantity,
      timestamp: Date.now()
    }, 'add');
    
    // Show success message
    const messageEl = this.root.querySelector('.success-message');
    if (messageEl) {
      messageEl.textContent = 'Added to cart!';
      messageEl.classList.add('visible');
      
      setTimeout(() => {
        messageEl.classList.remove('visible');
      }, 3000);
    }
  }
}

export default CartButtonClient;
```

### Subscribing to Events

Components can subscribe to events to react to changes:

```typescript
// In a component client file
import { Blueprint } from "asmbl";
import type { BlueprintEvent } from "asmbl";

export class CartIndicatorClient extends Blueprint {
  private cartCount = 0;
  private countElement: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Find the cart count element
    this.countElement = this.root.querySelector('.cart-count');
    
    // Initialize from localStorage if available
    this.initializeCartCount();
    
    // Listen for cart events with proper EventAddress objects
    this.subscribe({ channel: 'cart', topic: 'add' }, this.handleCartAdd.bind(this));
    this.subscribe({ channel: 'cart', topic: 'remove' }, this.handleCartRemove.bind(this));
    this.subscribe({ channel: 'cart', topic: 'clear' }, this.handleCartClear.bind(this));
  }
  
  private initializeCartCount(): void {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      this.cartCount = cartItems.reduce((total: number, item: any) => {
        return total + (item.quantity || 0);
      }, 0);
      this.updateCountDisplay();
    } catch (error) {
      console.error('Error initializing cart count:', error);
      this.cartCount = 0;
    }
  }
  
  private handleCartAdd(event: BlueprintEvent<{ quantity: number }>): void {
    const { quantity = 1 } = event.payload;
    this.cartCount += quantity;
    this.updateCountDisplay();
    this.saveCartCount();
  }
  
  private handleCartRemove(event: BlueprintEvent<{ quantity: number }>): void {
    const { quantity = 1 } = event.payload;
    this.cartCount = Math.max(0, this.cartCount - quantity);
    this.updateCountDisplay();
    this.saveCartCount();
  }
  
  private handleCartClear(): void {
    this.cartCount = 0;
    this.updateCountDisplay();
    this.saveCartCount();
  }
  
  private updateCountDisplay(): void {
    if (this.countElement) {
      this.countElement.textContent = this.cartCount.toString();
      this.countElement.classList.toggle('visible', this.cartCount > 0);
    }
  }
  
  private saveCartCount(): void {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart count:', error);
    }
  }
  
  protected override onDestroy(): void {
    // Clean up is handled automatically by the Blueprint's dispose method
    // AssembleJS will automatically unsubscribe from events when the component is destroyed
  }
}

export default CartIndicatorClient;
```

### Using the Standalone Events API

For code outside of Blueprint components, AssembleJS provides a standalone events API:

```typescript
import { events } from "asmbl";

// Subscribe to events
events.subscribe({ channel: 'cart', topic: 'add' }, (event) => {
  console.log('Item added to cart:', event.payload);
});

// Publish events
events.publish({ channel: 'cart', topic: 'add' }, { 
  productId: '123', 
  quantity: 2 
});

// Convenience methods for global events
events.toComponents({ message: 'Hello from standalone code' });
events.toBlueprint({ message: 'Hello from standalone code' });
events.toAll({ message: 'Hello to everyone' });
```

### Event Targeting Patterns

The AssembleJS event system provides specialized methods for targeting specific types of components:

```typescript
// From within a Blueprint:

// Send to all components (not blueprints)
this.toComponents(payload, 'topic');

// Send to all blueprints (not components)
this.toBlueprint(payload, 'topic');

// Send to all components and blueprints
this.toAll(payload, 'topic');

// With the standalone events API:
events.toComponents(payload, 'topic');
events.toBlueprint(payload, 'topic');
events.toAll(payload, 'topic');
```

### Auto-Cleanup on Component Destruction

AssembleJS automatically handles event subscription cleanup when components are destroyed:

```typescript
// No need for manual cleanup in most cases
protected override onDestroy(): void {
  // Event subscriptions are automatically removed
  // Any other cleanup can be done here
}
```

## Best Practices

### Event Naming Conventions

Follow consistent naming conventions:

1. **Noun-First Organization**: Start with the domain/entity (`cart`, `user`, `product`)
2. **Action Last**: End with the action or state change (`added`, `updated`, `removed`)
3. **Use Past Tense for Changes**: Indicate the change has already occurred

Good examples:
- `cart.item.added`
- `user.profile.updated`
- `order.status.changed`
- `product.review.submitted`

### Event Payload Structure

Keep event payloads:
- Minimal: Include only what subscribers need
- Self-contained: Don't require subscribers to look up additional data
- Descriptive: Include metadata to help with debugging

```typescript
// Good payload example
events.publish(
  { channel: 'order', topic: 'status.changed' },
  {
    orderId: '12345',
    previousStatus: 'processing',
    newStatus: 'shipped',
    updatedAt: new Date().toISOString(),
    reason: 'fulfillment_complete',
    affectedItems: ['item_1', 'item_2']
  }
);
```

### Centralized Event Documentation

Document your events in a central location:

```typescript
// events.constants.ts

export const CART_EVENTS = {
  /**
   * Emitted when an item is added to the cart
   * @payload {string} productId - The ID of the product added
   * @payload {number} quantity - The quantity added (default: 1)
   * @payload {number} price - The unit price of the product
   */
  ITEM_ADDED: 'cart.item.added',
  
  /**
   * Emitted when an item is removed from the cart
   * @payload {string} productId - The ID of the product removed
   * @payload {number} quantity - The quantity removed (default: all)
   */
  ITEM_REMOVED: 'cart.item.removed',
  
  /**
   * Emitted when the cart is cleared
   * @payload {string[]} [productIds] - Optional array of product IDs that were in the cart
   */
  CLEARED: 'cart.cleared'
};
```

### Clean Up Subscriptions

Always clean up event subscriptions to prevent memory leaks:

```typescript
// In a Blueprint component
protected override onMount(): void {
  // Subscribe to events
  this.subscribe({ channel: 'cart', topic: 'add' }, this.handleCartAdd.bind(this));
}

// No need for manual cleanup in onDestroy
// Blueprint.dispose() automatically unsubscribes all events when the component is destroyed
```

## Cross-Framework Communication

A key advantage of the AssembleJS Event System is communication between components built with different frameworks:

```typescript
// React component using Blueprint client file for events
// search-form.client.ts
import { Blueprint } from 'asmbl';

class SearchFormClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    const form = this.root.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = (e.target as HTMLFormElement).elements.namedItem('query') as HTMLInputElement;
      
      // Publish to all components
      this.toAll({ query: query.value }, 'search:submitted');
    });
  }
}

// The React component itself
// search-form.view.jsx
function SearchForm({ data }) {
  return (
    <form>
      <input name="query" type="text" />
      <button type="submit">Search</button>
    </form>
  );
}

// Vue component client file
// search-results.client.ts
import { Blueprint } from 'asmbl';

class SearchResultsClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for search events
    this.subscribe({ channel: 'global', topic: 'search:submitted' }, (event) => {
      const query = event.payload.query;
      
      // In the real implementation, you would update the Vue component's state
      console.log(`Searching for: ${query}`);
      
      // You might dispatch a custom event to the Vue component
      const customEvent = new CustomEvent('perform-search', { 
        detail: { query } 
      });
      this.root.dispatchEvent(customEvent);
    });
  }
}
```

## Next Steps

Now that you understand the Event System, learn about [Factories](core-concepts-factories.md) to see how to prepare data for your components on the server.