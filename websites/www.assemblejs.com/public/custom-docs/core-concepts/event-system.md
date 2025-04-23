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

Events in AssembleJS are identified by addresses, which have a format similar to topic paths:

```typescript
// Topic format: [channel].[topic].[subtopic]
'cart.item.added'
'user.profile.updated'
'navigation.route.changed'
```

This hierarchical addressing allows for precise targeting and filtering of events.

### Event Bus

The central event bus manages the publication and subscription of events:

```typescript
import { events } from 'asmbl';

// Publishing an event
events.emit('cart.item.added', { 
  productId: '123', 
  quantity: 2 
});

// Subscribing to an event
events.on('cart.item.added', (event) => {
  console.log('Item added to cart:', event.data);
});
```

### Event Objects

Each event contains metadata and payload information:

```typescript
interface BlueprintEvent<T = unknown> {
  address: EventAddress; // The event address
  data: T;               // The event payload
  sender: string;        // Component ID that sent the event
  timestamp?: number;    // When the event was created
}
```

## Using the Event System

### Publishing Events

Components can publish events to notify others about changes or actions:

```typescript
// In a component client file
import { Blueprint, BlueprintClient, events } from "asmbl";

export class CartButtonClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Find the add-to-cart button
    const addButton = document.querySelector('.add-to-cart-btn');
    
    if (addButton) {
      addButton.addEventListener('click', this.handleAddToCart.bind(this));
    }
  }
  
  private handleAddToCart(e: Event): void {
    e.preventDefault();
    
    // Get product information
    const productId = this.context.element.getAttribute('data-product-id');
    const quantity = parseInt(
      document.querySelector('.quantity-input')?.value || '1'
    );
    
    // Emit the cart.add event
    events.emit('cart.add', { 
      productId, 
      quantity,
      timestamp: Date.now()
    });
    
    // Show success message
    const messageEl = document.querySelector('.success-message');
    if (messageEl) {
      messageEl.textContent = 'Added to cart!';
      messageEl.classList.add('visible');
      
      setTimeout(() => {
        messageEl.classList.remove('visible');
      }, 3000);
    }
  }
}

BlueprintClient.registerComponentCodeBehind(CartButtonClient);
```

### Subscribing to Events

Components can subscribe to events to react to changes:

```typescript
// In a component client file
import { Blueprint, BlueprintClient, events } from "asmbl";

export class CartIndicatorClient extends Blueprint {
  private cartCount = 0;
  private countElement: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Find the cart count element
    this.countElement = document.querySelector('.cart-count');
    
    // Initialize from localStorage if available
    this.initializeCartCount();
    
    // Listen for cart.add events
    events.on('cart.add', this.handleCartAdd.bind(this));
    
    // Listen for cart.remove events
    events.on('cart.remove', this.handleCartRemove.bind(this));
    
    // Listen for cart.clear events
    events.on('cart.clear', this.handleCartClear.bind(this));
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
  
  private handleCartAdd(event: any): void {
    const { quantity = 1 } = event.data;
    this.cartCount += quantity;
    this.updateCountDisplay();
    this.saveCartCount();
  }
  
  private handleCartRemove(event: any): void {
    const { quantity = 1 } = event.data;
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
    // Clean up event subscriptions
    events.off('cart.add', this.handleCartAdd.bind(this));
    events.off('cart.remove', this.handleCartRemove.bind(this));
    events.off('cart.clear', this.handleCartClear.bind(this));
  }
}

BlueprintClient.registerComponentCodeBehind(CartIndicatorClient);
```

### Advanced Event Patterns

#### Pattern Matching Subscriptions

Subscribe to multiple related events with wildcard pattern matching:

```typescript
// Subscribe to all cart events
events.on('cart.*', (event) => {
  console.log(`Cart event: ${event.address}`, event.data);
});

// Subscribe to all user profile events
events.on('user.profile.*', (event) => {
  console.log(`Profile event: ${event.address}`, event.data);
});
```

#### Once-Only Subscriptions

Listen for an event only once:

```typescript
// Listen for initialization event once
events.once('app.initialized', (event) => {
  console.log('App initialized, one-time setup complete');
});
```

#### Event Queues

For critical events that must be processed, even if subscribers register late:

```typescript
// Create a queued event
const queuedEvents = events.createQueue('critical.notifications.*');

// Publish events to the queue
queuedEvents.emit('critical.notifications.systemUpdate', {
  message: 'System update required',
  severity: 'high'
});

// Late subscribers still receive previously queued events
setTimeout(() => {
  queuedEvents.on('critical.notifications.*', (event) => {
    console.log('Received queued notification:', event);
  });
}, 5000);
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
events.emit('order.status.changed', {
  orderId: '12345',
  previousStatus: 'processing',
  newStatus: 'shipped',
  updatedAt: new Date().toISOString(),
  reason: 'fulfillment_complete',
  affectedItems: ['item_1', 'item_2']
});
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
// In a component
protected override onMount(): void {
  // Bind handlers to preserve reference for later removal
  this.boundHandler = this.handleCartAdd.bind(this);
  events.on('cart.add', this.boundHandler);
}

protected override onDestroy(): void {
  // Remove event listener using the same function reference
  events.off('cart.add', this.boundHandler);
}
```

## Cross-Framework Communication

A key advantage of the AssembleJS Event System is communication between components built with different frameworks:

```typescript
// React component broadcasting an event
import { events } from 'asmbl';

function SearchForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const query = e.target.elements.query.value;
    events.emit('search.query.submitted', { query });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="query" type="text" />
      <button type="submit">Search</button>
    </form>
  );
}

// Vue component listening for the event
export default {
  mounted() {
    events.on('search.query.submitted', this.handleSearch);
  },
  methods: {
    handleSearch(event) {
      this.searchResults = this.performSearch(event.data.query);
    }
  },
  beforeDestroy() {
    events.off('search.query.submitted', this.handleSearch);
  }
};
```

## Next Steps

Now that you understand the Event System, learn about [Factories](factories.md) to see how to prepare data for your components on the server.