# Svelte Integration

AssembleJS provides first-class support for Svelte, allowing you to use Svelte components within your AssembleJS application. This integration combines Svelte's reactive, compile-time approach with AssembleJS's server-side rendering, component isolation, and event system.

## Getting Started with Svelte in AssembleJS

### Prerequisites

Before using Svelte with AssembleJS, ensure you have the following dependencies installed:

```bash
npm install svelte
```

AssembleJS has built-in support for Svelte through its renderer system.

### Creating a Svelte Component

When you generate a component using `asmgen`, you can select Svelte as the framework:

```bash
npx asmgen
# Select "Component" from the list
# Enter your component name
# Select "Svelte" as the UI framework
```

### Folder Structure

For a Svelte component named "product-card" in the "catalog" directory:

```
components/
└── catalog/
    └── product-card/
        ├── product-card.client.ts  # Client-side initialization
        ├── product-card.styles.scss # Component styles (optional, can also be in .svelte file)
        └── product-card.view.svelte # Svelte component
```

## Writing Svelte Components in AssembleJS

### Basic Component Structure

```svelte
<!-- product-card.view.svelte -->
<script>
  // Component props from AssembleJS
  export let data;
  export let context;
  export let params;
  
  // Local reactive state
  let quantity = 1;
  
  // Reactive declarations
  $: totalPrice = data.product.price * quantity;
  
  // Event handlers
  function increment() {
    quantity += 1;
  }
  
  function decrement() {
    if (quantity > 1) {
      quantity -= 1;
    }
  }
</script>

<div class="product-card">
  <img src={data.product.imageUrl} alt={data.product.name} />
  <h3>{data.product.name}</h3>
  <p class="price">${data.product.price.toFixed(2)}</p>
  
  <div class="quantity-control">
    <button on:click={decrement}>-</button>
    <span>{quantity}</span>
    <button on:click={increment}>+</button>
  </div>
  
  <p class="total">Total: ${totalPrice.toFixed(2)}</p>
  
  <button class="add-to-cart-button">
    Add to Cart
  </button>
</div>

<style>
  .product-card {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .price {
    font-weight: bold;
    color: #e63946;
  }
  
  .quantity-control {
    display: flex;
    align-items: center;
    margin: 1rem 0;
  }
  
  .quantity-control button {
    background: #f1f1f1;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .quantity-control span {
    margin: 0 1rem;
  }
  
  .add-to-cart-button {
    background: #457b9d;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-to-cart-button:hover {
    background: #1d3557;
  }
</style>
```

### Accessing Component Data

Svelte components in AssembleJS receive data from their factory through the `data` prop:

```typescript
// product-card.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ProductCardFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Fetch a product from an API or database
    const product = await fetchProduct(context.params.productId);
    
    // Add the product to the component's context data
    context.data.set('product', product);
  }
}
```

### Client-Side Behavior

To add client-side interactivity to your Svelte component, you can use the client file:

```typescript
// product-card.client.ts
import { Blueprint } from 'asmbl';

class ProductCardComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Get a reference to the Add to Cart button
    const addToCartButton = this.root.querySelector('.add-to-cart-button');
    
    // Add event listener
    addToCartButton?.addEventListener('click', () => {
      const productId = this.context.data.product.id;
      const quantity = this.root.querySelector('.quantity-control span')?.textContent;
      
      // Publish an event to notify other components
      this.toComponents({ 
        productId,
        quantity: parseInt(quantity || '1', 10)
      }, 'add');
    });
  }
}

// Register the component
export default ProductCardComponent;
```

## Svelte Reactivity System

One of Svelte's most powerful features is its reactive system, which works seamlessly in AssembleJS:

```svelte
<!-- shopping-cart.view.svelte -->
<script>
  export let data;
  
  // Local state
  let items = data.cartItems || [];
  
  // Reactive declarations
  $: itemCount = items.reduce((total, item) => total + item.quantity, 0);
  $: subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  $: tax = subtotal * 0.07;
  $: total = subtotal + tax;
  
  // Methods
  function updateQuantity(id, newQuantity) {
    if (newQuantity < 1) return;
    
    items = items.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity } 
        : item
    );
  }
  
  function removeItem(id) {
    items = items.filter(item => item.id !== id);
  }
</script>

<div class="shopping-cart">
  <h2>Your Cart ({itemCount} items)</h2>
  
  {#if items.length === 0}
    <p>Your cart is empty</p>
  {:else}
    <ul class="cart-items">
      {#each items as item (item.id)}
        <li class="cart-item">
          <img src={item.imageUrl} alt={item.name} />
          <div class="item-details">
            <h3>{item.name}</h3>
            <p class="price">${item.price.toFixed(2)} each</p>
          </div>
          <div class="quantity-control">
            <button on:click={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button on:click={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
          </div>
          <p class="item-total">${(item.price * item.quantity).toFixed(2)}</p>
          <button class="remove-item" on:click={() => removeItem(item.id)}>×</button>
        </li>
      {/each}
    </ul>
    
    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (7%):</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
      
      <button class="checkout-button">Proceed to Checkout</button>
    </div>
  {/if}
</div>

<style>
  /* Styles for the shopping cart component */
</style>
```

## Svelte Component Props

AssembleJS passes several props to your Svelte components:

| Prop | Description |
|------|-------------|
| `data` | The data object populated by the component's factory |
| `context` | The component context with additional utilities |
| `params` | URL and route parameters |

```svelte
<!-- container.view.svelte -->
<script>
  export let data;    // Data from the factory
  export let context; // Component context with utilities
  export let params;  // URL and route parameters
</script>

<div class={`container ${data.size}`}>
  <h2>{data.title}</h2>
  <div class="container-content">
    <slot></slot>
  </div>
  <div class="debug-info">
    <p>Route: {params.route}</p>
    <p>Component ID: {context.id}</p>
  </div>
</div>

<style>
  .container {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
  }
  
  .debug-info {
    margin-top: 1rem;
    font-size: 0.8rem;
    color: #999;
  }
</style>
```

## TypeScript Support

AssembleJS fully supports TypeScript with Svelte:

```svelte
<!-- product-card.view.svelte -->
<script lang="ts">
  import type { ProductData, ComponentContext } from '../types';
  
  // Define the props types
  export let data: { product: ProductData };
  export let context: ComponentContext;
  export let params: Record<string, string>;
  
  // Local state with type
  let quantity: number = 1;
  
  // Reactive declarations
  $: totalPrice = data.product.price * quantity;
  
  // Type-safe methods
  function increment(): void {
    quantity += 1;
  }
  
  function decrement(): void {
    if (quantity > 1) {
      quantity -= 1;
    }
  }
</script>

<!-- Template -->
<div class="product-card">
  <!-- Component content -->
</div>
```

## Interacting with the AssembleJS Event System

Svelte components can interact with the AssembleJS event system through a combination of the client file and custom events:

```typescript
// notification.client.ts
import { Blueprint } from 'asmbl';

class NotificationComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for cart events
    this.subscribe('cart', 'add', (event) => {
      // Use custom event to communicate with Svelte component
      const customEvent = new CustomEvent('show-notification', {
        detail: `Added ${event.payload.quantity} item(s) to cart`
      });
      
      // Use the global notification root that was created in the Svelte component
      if (window.__notificationRoot) {
        window.__notificationRoot.dispatchEvent(customEvent);
      }
    });
  }
}

export default NotificationComponent;
```

In your Svelte component, listen for these custom events:

```svelte
<!-- notification.view.svelte -->
<script>
  import { onMount } from 'svelte';
  
  // Notification state
  let notifications = [];
  
  function showNotification(message) {
    const id = Date.now();
    notifications = [...notifications, { id, message }];
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, 3000);
  }
  
  // Listen for custom events from the client file
  onMount(() => {
    // Create a root element for notifications
    const notificationRoot = document.createElement('div');
    notificationRoot.classList.add('notification-container-root');
    document.body.appendChild(notificationRoot);
    
    // Listen for custom events
    notificationRoot.addEventListener('show-notification', (event) => {
      showNotification(event.detail);
    });
    
    // Store a reference in a global variable for the client file to access
    // This is a pattern for Svelte since it manages its own DOM
    window.__notificationRoot = notificationRoot;
    
    return () => {
      notificationRoot.removeEventListener('show-notification', showNotification);
      document.body.removeChild(notificationRoot);
      delete window.__notificationRoot;
    };
  });
</script>

<div class="notification-container">
  {#each notifications as note (note.id)}
    <div class="notification" transition:fly={{ y: -30, duration: 300 }}>
      {note.message}
    </div>
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }
  
  .notification {
    background: #457b9d;
    color: white;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
</style>
```

## Svelte Actions for DOM Integration

Svelte actions are perfect for integrating with third-party libraries or handling complex DOM interactions:

```svelte
<!-- chart.view.svelte -->
<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js';
  
  export let data;
  
  // Define an action for Chart.js integration
  function chartjs(element, options) {
    let chart;
    
    // Initialize chart
    chart = new Chart(element, options);
    
    return {
      update(newOptions) {
        // Update chart with new options
        chart.data = newOptions.data;
        chart.options = newOptions.options;
        chart.update();
      },
      destroy() {
        // Clean up on unmount
        chart.destroy();
      }
    };
  }
  
  // Prepare chart options
  const chartOptions = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: data.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Additional chart options...
    }
  };
</script>

<div class="chart-container">
  <h3>{data.title}</h3>
  <canvas use:chartjs={chartOptions}></canvas>
</div>

<style>
  .chart-container {
    height: 300px;
    margin: 20px 0;
  }
</style>
```

## Server-Side Rendering and Hydration

AssembleJS handles server-side rendering and hydration of Svelte components automatically:

1. On the server, AssembleJS renders your Svelte component to HTML
2. The HTML is sent to the client along with the necessary data
3. On the client, Svelte hydrates the component, making it interactive
4. The component retains its state and event handlers

This process is transparent to the developer - you don't need to write special code to handle SSR and hydration.

## Svelte Stores for State Management

Svelte stores provide a powerful way to manage and share state between components:

```svelte
<!-- stores.js -->
<script context="module">
  import { writable } from 'svelte/store';
  
  // Create a writable store
  export const cartStore = writable({
    items: [],
    itemCount: 0,
    subtotal: 0
  });
  
  // Helper functions to update the store
  export function addToCart(product, quantity = 1) {
    cartStore.update(cart => {
      const existingItem = cart.items.find(item => item.id === product.id);
      
      let updatedItems;
      if (existingItem) {
        updatedItems = cart.items.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        updatedItems = [...cart.items, { ...product, quantity }];
      }
      
      const itemCount = updatedItems.reduce((total, item) => total + item.quantity, 0);
      const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return { items: updatedItems, itemCount, subtotal };
    });
  }
  
  export function removeFromCart(productId) {
    cartStore.update(cart => {
      const updatedItems = cart.items.filter(item => item.id !== productId);
      
      const itemCount = updatedItems.reduce((total, item) => total + item.quantity, 0);
      const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return { items: updatedItems, itemCount, subtotal };
    });
  }
  
  export function updateCartItemQuantity(productId, quantity) {
    if (quantity < 1) return;
    
    cartStore.update(cart => {
      const updatedItems = cart.items.map(item => 
        item.id === productId 
          ? { ...item, quantity } 
          : item
      );
      
      const itemCount = updatedItems.reduce((total, item) => total + item.quantity, 0);
      const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return { items: updatedItems, itemCount, subtotal };
    });
  }
</script>
```

Using the store in a component:

```svelte
<!-- product-card.view.svelte -->
<script>
  import { addToCart } from '../stores/cart';
  
  export let data;
  
  let quantity = 1;
  
  function handleAddToCart() {
    addToCart(data.product, quantity);
  }
</script>

<div class="product-card">
  <!-- Product details -->
  
  <div class="quantity-control">
    <button on:click={() => quantity = Math.max(1, quantity - 1)}>-</button>
    <span>{quantity}</span>
    <button on:click={() => quantity += 1}>+</button>
  </div>
  
  <button class="add-to-cart-button" on:click={handleAddToCart}>
    Add to Cart
  </button>
</div>
```

Displaying cart data:

```svelte
<!-- cart-indicator.view.svelte -->
<script>
  import { cartStore } from '../stores/cart';
</script>

<div class="cart-indicator">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14.8v-.1l1.5-2.7h8.1c.8 0 1.4-.4 1.7-1.1l3.6-6.5c.2-.3.2-.7-.1-1-.3-.3-.6-.4-1-.4H5.2l-.7-1.5c-.2-.4-.6-.6-1-.6H1.1c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1h2l3.3 7-1.2 2.2c-.2.4-.3.8-.2 1.2.3.7 1 1.3 1.9 1.3h12c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1H7.2z" fill="currentColor"/>
  </svg>
  
  {#if $cartStore.itemCount > 0}
    <span class="item-count">{$cartStore.itemCount}</span>
    <span class="subtotal">${$cartStore.subtotal.toFixed(2)}</span>
  {/if}
</div>

<style>
  .cart-indicator {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    background: #f1f1f1;
  }
  
  .item-count {
    background: #e63946;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    margin-left: 5px;
  }
  
  .subtotal {
    margin-left: 8px;
    font-weight: bold;
  }
</style>
```

## Best Practices

1. **Leverage Svelte's Reactivity**: Use Svelte's reactive declarations to derive values and keep code concise
2. **Use Svelte Actions**: Take advantage of actions for DOM integration and third-party libraries
3. **Component Local Styles**: Use the `<style>` block for component-specific styles
4. **Lifecycle Hooks**: Use Svelte's lifecycle hooks like `onMount` and `onDestroy` for setup and cleanup
5. **Stores for Shared State**: Use Svelte stores for state that needs to be shared between components
6. **Transitions and Animations**: Use Svelte's built-in transitions for smooth UI animations
7. **Props Validation**: Define TypeScript interfaces for props to ensure type safety
8. **AssembleJS Event Integration**: Use custom events to bridge between Svelte and AssembleJS's event system

## Next Steps

- [Core Concepts - Components](../core-concepts-components.md) - Learn more about the component model
- [Core Concepts - Factories](../core-concepts-factories.md) - Understand how to prepare data for your components
- [Advanced Islands Architecture](../advanced-islands-architecture.md) - Learn about selective hydration
- [Cross-Framework State](../advanced-cross-framework-state.md) - Share state between Svelte and other frameworks