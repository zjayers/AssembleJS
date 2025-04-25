# Cross-Framework State Management

One of AssembleJS's most powerful features is its ability to manage state across components built with different UI frameworks. This document explains how to share and synchronize state between React, Vue, Svelte, and other components in your application.

## The Challenge of Cross-Framework State

In a traditional single-framework application, state management is relatively straightforward. Libraries like Redux, MobX, Vuex, or framework-specific solutions handle state effectively. However, in a multi-framework environment like AssembleJS, new challenges emerge:

1. **Different state paradigms**: Each framework has its own approach to state
2. **Framework-specific APIs**: State libraries are often tied to specific frameworks
3. **Hydration complexity**: Components hydrate independently with their own state
4. **Synchronization**: Changes in one component must propagate to others

## AssembleJS State Management Solutions

AssembleJS addresses these challenges with several integrated approaches:

1. **Event Bus**: A publish-subscribe system for cross-component communication
2. **Context API**: Shared context that works across framework boundaries
3. **State Stores**: Framework-agnostic state containers
4. **Server State**: State serialized from the server and hydrated on the client

## The Event Bus System

The event bus is the foundation of cross-framework communication:

```typescript
// Publishing from a React component
import { useEvents } from 'assemblejs/react';

function CartButton({ product }) {
  const events = useEvents();
  
  const handleAddToCart = () => {
    events.publish(
      { channel: 'cart', topic: 'item-added' },
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }
    );
  };
  
  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

```vue
<!-- Subscribing in a Vue component -->
<template>
  <div class="cart-widget">
    <span class="item-count">{{ itemCount }}</span>
    <i class="cart-icon"></i>
  </div>
</template>

<script>
import { useEvents } from 'assemblejs/vue';

export default {
  setup() {
    const events = useEvents();
    const itemCount = ref(0);
    const cartItems = ref([]);
    
    events.subscribe({ channel: 'cart', topic: 'item-added' }, (event) => {
      cartItems.value.push(event.payload);
      itemCount.value = cartItems.value.length;
    });
    
    return {
      itemCount,
      cartItems
    };
  }
}
</script>
```

```svelte
<!-- Using in a Svelte component -->
<script>
  import { onMount } from 'svelte';
  import { getEvents } from 'assemblejs/svelte';
  
  let notifications = [];
  
  onMount(() => {
    const events = getEvents();
    
    const unsubscribe = events.subscribe({ channel: 'cart', topic: 'item-added' }, (event) => {
      const item = event.payload;
      notifications = [...notifications, {
        type: 'success',
        message: `${item.name} added to cart`
      }];
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        notifications = notifications.slice(1);
      }, 3000);
    });
    
    return unsubscribe;
  });
</script>

<div class="notifications">
  {#each notifications as notification}
    <div class="notification {notification.type}">
      {notification.message}
    </div>
  {/each}
</div>
```

### Advanced Event Patterns

For more complex scenarios, use these event patterns:

```typescript
// Request-response pattern using events
// Component A: Send request and create a specific response channel
const responseChannel = `response-${Date.now()}`;
events.publish(
  { channel: 'cart', topic: 'get-items' },
  { responseChannel } // Include the response channel in the payload
);

// Listen for the response on a specific channel
events.subscribe({ channel: responseChannel, topic: 'items' }, (event) => {
  // Handle response with cart items
  const items = event.payload;
  console.log('Received cart items:', items);
  
  // Unsubscribe after receiving the response
  events.unsubscribe({ channel: responseChannel, topic: 'items' }, this);
});

// Component B: Handle request
events.subscribe({ channel: 'cart', topic: 'get-items' }, (event) => {
  // Get items from local state
  const items = getCartItems();
  
  // Send response to the specified channel
  if (event.payload.responseChannel) {
    events.publish(
      { channel: event.payload.responseChannel, topic: 'items' },
      items
    );
  }
});
```

```typescript
// Filtered subscriptions
events.subscribe({ channel: 'product', topic: 'updated' }, (event) => {
  const product = event.payload;
  // Only process this event if the product is in the electronics category
  if (product.category === 'electronics') {
    // Handle electronics product update
    console.log('Electronics product updated:', product);
  }
});
```

```typescript
// Using a consistent channel for related events
// Component A
events.publish(
  { channel: 'product', topic: 'updated' },
  { id: '123', name: 'Updated Product' }
);

// Component B
events.subscribe({ channel: 'product', topic: 'updated' }, (event) => {
  // Handle product update
  const product = event.payload;
  console.log('Product updated:', product);
});
```

## Context API

The context API allows components to share data without direct parent-child relationships:

```typescript
// Create a shared context
import { createContext } from 'assemblejs';

// Create a theme context with default value
export const ThemeContext = createContext({
  theme: 'light',
  fontSize: 'medium'
});
```

```tsx
// Using context in React
import { useContext } from 'assemblejs/react';
import { ThemeContext } from './theme-context';

function ReactHeader() {
  const { theme, fontSize } = useContext(ThemeContext);
  
  return (
    <header className={`header theme-${theme} font-${fontSize}`}>
      <h1>AssembleJS Demo</h1>
    </header>
  );
}
```

```vue
<!-- Using context in Vue -->
<template>
  <div :class="`content theme-${theme} font-${fontSize}`">
    <slot></slot>
  </div>
</template>

<script>
import { useContext } from 'assemblejs/vue';
import { ThemeContext } from './theme-context';

export default {
  setup() {
    const { theme, fontSize } = useContext(ThemeContext);
    
    return {
      theme,
      fontSize
    };
  }
}
</script>
```

```svelte
<!-- Using context in Svelte -->
<script>
  import { getContext } from 'assemblejs/svelte';
  import { ThemeContext } from './theme-context';
  
  const { theme, fontSize } = getContext(ThemeContext);
</script>

<footer class="footer theme-{theme} font-{fontSize}">
  <p>© 2023 AssembleJS</p>
</footer>
```

### Providing Context Values

Context values can be provided at various levels:

```tsx
// Providing context in a React component
import { ContextProvider } from 'assemblejs/react';
import { ThemeContext } from './theme-context';

function App() {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ContextProvider
      context={ThemeContext}
      value={{ theme, fontSize, toggleTheme }}
    >
      <div className="app">
        {/* Child components can access the context */}
        <Header />
        <Content />
        <Footer />
      </div>
    </ContextProvider>
  );
}
```

```typescript
// Providing context at server level
export class ThemeController extends BlueprintController {
  async get(request, reply) {
    // Get theme from cookies or user preferences
    const theme = request.cookies.theme || 'light';
    const fontSize = request.cookies.fontSize || 'medium';
    
    // Provide context value for all components in this request
    this.provideContext(ThemeContext, {
      theme,
      fontSize
    });
    
    // Render the page
    return reply.view('theme-demo');
  }
}
```

## State Stores

For more complex state, AssembleJS offers framework-agnostic state stores:

```typescript
// Create a store
import { createStore } from 'assemblejs';

export const cartStore = createStore({
  // Initial state
  state: {
    items: [],
    itemCount: 0,
    total: 0
  },
  
  // Actions to modify state
  actions: {
    addItem(state, item) {
      // Check if item already exists
      const existingItem = state.items.find(i => i.id === item.id);
      
      if (existingItem) {
        // Increment quantity
        existingItem.quantity += item.quantity;
      } else {
        // Add new item
        state.items.push({ ...item });
      }
      
      // Update derived state
      this.updateDerivedState(state);
    },
    
    removeItem(state, itemId) {
      state.items = state.items.filter(item => item.id !== itemId);
      this.updateDerivedState(state);
    },
    
    updateQuantity(state, { itemId, quantity }) {
      const item = state.items.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        this.updateDerivedState(state);
      }
    },
    
    clearCart(state) {
      state.items = [];
      this.updateDerivedState(state);
    },
    
    // Helper method for updating derived state
    updateDerivedState(state) {
      state.itemCount = state.items.reduce(
        (count, item) => count + item.quantity, 0
      );
      
      state.total = state.items.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
    }
  },
  
  // Computed values
  getters: {
    hasItems: state => state.items.length > 0,
    itemsGroupedByCategory: state => {
      // Group items by category
      return state.items.reduce((groups, item) => {
        const category = item.category || 'other';
        if (!groups[category]) groups[category] = [];
        groups[category].push(item);
        return groups;
      }, {});
    }
  }
});
```

```tsx
// Using store in React
import { useStore } from 'assemblejs/react';
import { cartStore } from './cart-store';

function CartSummary() {
  const { state, actions, getters } = useStore(cartStore);
  
  return (
    <div className="cart-summary">
      <h2>Your Cart ({state.itemCount} items)</h2>
      
      {getters.hasItems ? (
        <>
          <ul className="cart-items">
            {state.items.map(item => (
              <li key={item.id} className="cart-item">
                <span className="item-name">{item.name}</span>
                <span className="item-price">${item.price.toFixed(2)}</span>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={e => actions.updateQuantity({
                    itemId: item.id,
                    quantity: parseInt(e.target.value)
                  })}
                />
                <button onClick={() => actions.removeItem(item.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          
          <div className="cart-total">
            <strong>Total:</strong> ${state.total.toFixed(2)}
          </div>
          
          <button onClick={() => actions.clearCart()}>
            Clear Cart
          </button>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}
```

```vue
<!-- Using store in Vue -->
<template>
  <div class="mini-cart">
    <button @click="toggleCart">
      <i class="cart-icon"></i>
      <span class="item-count">{{ state.itemCount }}</span>
    </button>
    
    <div v-if="isOpen" class="mini-cart-dropdown">
      <h3>Cart Summary</h3>
      
      <div v-if="getters.hasItems">
        <div class="mini-cart-items">
          <div v-for="item in state.items" :key="item.id" class="mini-cart-item">
            <span>{{ item.name }} ({{ item.quantity }})</span>
            <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="mini-cart-total">
          <strong>Total:</strong> ${{ state.total.toFixed(2) }}
        </div>
        
        <button @click="viewCart">View Cart</button>
      </div>
      <div v-else>
        <p>Your cart is empty</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'assemblejs/vue';
import { cartStore } from './cart-store';

export default {
  setup() {
    const { state, actions, getters } = useStore(cartStore);
    const isOpen = ref(false);
    
    const toggleCart = () => {
      isOpen.value = !isOpen.value;
    };
    
    const viewCart = () => {
      window.location.href = '/cart';
    };
    
    return {
      state,
      actions,
      getters,
      isOpen,
      toggleCart,
      viewCart
    };
  }
}
</script>
```

```svelte
<!-- Using store in Svelte -->
<script>
  import { useStore } from 'assemblejs/svelte';
  import { cartStore } from './cart-store';
  
  const { state, actions, getters } = useStore(cartStore);
  
  // Local component state
  let showCategories = false;
  
  function toggleCategories() {
    showCategories = !showCategories;
  }
</script>

<div class="cart-categories">
  <button on:click={toggleCategories}>
    {showCategories ? 'Hide' : 'Show'} Categories
  </button>
  
  {#if showCategories && $getters.hasItems}
    <div class="categories">
      {#each Object.entries($getters.itemsGroupedByCategory) as [category, items]}
        <div class="category">
          <h4>{category}</h4>
          <ul>
            {#each items as item}
              <li>
                {item.name} - ${item.price.toFixed(2)} × {item.quantity}
                <button on:click={() => actions.removeItem(item.id)}>
                  Remove
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

### Persisting Store State

Stores can persist state between page loads:

```typescript
// Create a persistent store
import { createStore } from 'assemblejs';

export const userPreferencesStore = createStore({
  // Initial state
  state: {
    theme: 'light',
    fontSize: 'medium',
    notifications: true,
    language: 'en'
  },
  
  // Actions
  actions: {
    setTheme(state, theme) {
      state.theme = theme;
    },
    
    setFontSize(state, fontSize) {
      state.fontSize = fontSize;
    },
    
    toggleNotifications(state) {
      state.notifications = !state.notifications;
    },
    
    setLanguage(state, language) {
      state.language = language;
    }
  }
}, {
  // Persistence options
  persist: {
    key: 'user-preferences',
    storage: 'localStorage',
    paths: ['theme', 'fontSize', 'language'] // Only persist these properties
  }
});
```

## Server State and Hydration

State can be prepared on the server and hydrated on the client:

```typescript
// Server controller with state preparation
export class ProductController extends BlueprintController {
  async get(request, reply) {
    // Get product ID from URL
    const productId = request.params.id;
    
    // Fetch product data
    const product = await this.productService.getById(productId);
    
    if (!product) {
      return reply.notFound();
    }
    
    // Prepare state for client hydration
    const initialState = {
      product,
      relatedProducts: await this.productService.getRelated(productId),
      reviews: await this.reviewService.getForProduct(productId, { limit: 5 })
    };
    
    // Include state for hydration
    return reply.view('product-detail', {
      hydrationState: initialState
    });
  }
}
```

```tsx
// React component that hydrates from server state
import { useHydration } from 'assemblejs/react';

function ProductDetail() {
  // Hydrate component state from server
  const initialState = useHydration();
  
  // Use the hydrated state
  const [product, setProduct] = useState(initialState.product);
  const [relatedProducts, setRelatedProducts] = useState(initialState.relatedProducts);
  const [reviews, setReviews] = useState(initialState.reviews);
  
  // Rest of component...
}
```

```vue
<!-- Vue component with hydration -->
<template>
  <div class="product-detail">
    <!-- Product details UI -->
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useHydration } from 'assemblejs/vue';

export default {
  setup() {
    // Get hydration state
    const initialState = useHydration();
    
    // Create reactive state from hydration data
    const product = reactive(initialState.product);
    const relatedProducts = reactive(initialState.relatedProducts);
    const reviews = reactive(initialState.reviews);
    
    return {
      product,
      relatedProducts,
      reviews
    };
  }
}
</script>
```

## Advanced Patterns

### Custom State Synchronization

For more complex scenarios, implement custom synchronization:

```typescript
// Custom synchronization between frameworks
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('product-configurator');

client.onReady(() => {
  // State containers for different framework components
  const reactStateContainer = document.querySelector('#react-state');
  const vueStateContainer = document.querySelector('#vue-state');
  const svelteStateContainer = document.querySelector('#svelte-state');
  
  // Initialize shared state
  let sharedState = {
    product: {
      id: '123',
      name: 'Customizable Widget',
      basePrice: 99.99
    },
    options: {
      color: 'blue',
      size: 'medium',
      material: 'plastic'
    },
    price: 99.99
  };
  
  // Update function to propagate state changes
  function updateState(newState) {
    // Update local state
    sharedState = { ...sharedState, ...newState };
    
    // Propagate to React
    if (reactStateContainer) {
      reactStateContainer.textContent = JSON.stringify(sharedState);
      reactStateContainer.dispatchEvent(new Event('state-update'));
    }
    
    // Propagate to Vue
    if (vueStateContainer) {
      vueStateContainer.textContent = JSON.stringify(sharedState);
      vueStateContainer.dispatchEvent(new Event('state-update'));
    }
    
    // Propagate to Svelte
    if (svelteStateContainer) {
      svelteStateContainer.textContent = JSON.stringify(sharedState);
      svelteStateContainer.dispatchEvent(new Event('state-update'));
    }
  }
  
  // Listen for events from React
  client.events.subscribe({ channel: 'react', topic: 'state-update' }, (event) => {
    updateState(event.payload);
  });
  
  // Listen for events from Vue
  client.events.subscribe({ channel: 'vue', topic: 'state-update' }, (event) => {
    updateState(event.payload);
  });
  
  // Listen for events from Svelte
  client.events.subscribe({ channel: 'svelte', topic: 'state-update' }, (event) => {
    updateState(event.payload);
  });
});
```

### State Machines for Complex Logic

Use state machines for complex business logic:

```typescript
// State machine for cart checkout process
import { createMachine } from 'assemblejs/state-machine';
import { cartStore } from './cart-store';

export const checkoutMachine = createMachine({
  id: 'checkout',
  initialState: 'idle',
  context: {
    cart: null,
    customerInfo: null,
    shippingAddress: null,
    billingAddress: null,
    paymentMethod: null,
    errors: null
  },
  states: {
    idle: {
      on: {
        START_CHECKOUT: {
          target: 'collectingCustomerInfo',
          actions: 'initializeCheckout'
        }
      }
    },
    collectingCustomerInfo: {
      on: {
        SUBMIT_CUSTOMER_INFO: [
          {
            target: 'collectingShipping',
            cond: 'isValidCustomerInfo',
            actions: 'saveCustomerInfo'
          },
          {
            target: 'collectingCustomerInfo',
            actions: 'setCustomerInfoErrors'
          }
        ],
        CANCEL: {
          target: 'idle',
          actions: 'clearCheckout'
        }
      }
    },
    collectingShipping: {
      on: {
        SUBMIT_SHIPPING: [
          {
            target: 'collectingBilling',
            cond: 'isValidShipping',
            actions: 'saveShipping'
          },
          {
            target: 'collectingShipping',
            actions: 'setShippingErrors'
          }
        ],
        BACK: 'collectingCustomerInfo',
        CANCEL: {
          target: 'idle',
          actions: 'clearCheckout'
        }
      }
    },
    collectingBilling: {
      on: {
        SUBMIT_BILLING: [
          {
            target: 'collectingPayment',
            cond: 'isValidBilling',
            actions: 'saveBilling'
          },
          {
            target: 'collectingBilling',
            actions: 'setBillingErrors'
          }
        ],
        USE_SHIPPING_AS_BILLING: {
          target: 'collectingPayment',
          actions: 'copyShippingToBilling'
        },
        BACK: 'collectingShipping',
        CANCEL: {
          target: 'idle',
          actions: 'clearCheckout'
        }
      }
    },
    collectingPayment: {
      on: {
        SUBMIT_PAYMENT: [
          {
            target: 'reviewingOrder',
            cond: 'isValidPayment',
            actions: 'savePayment'
          },
          {
            target: 'collectingPayment',
            actions: 'setPaymentErrors'
          }
        ],
        BACK: 'collectingBilling',
        CANCEL: {
          target: 'idle',
          actions: 'clearCheckout'
        }
      }
    },
    reviewingOrder: {
      on: {
        CONFIRM_ORDER: {
          target: 'processing',
          actions: 'submitOrder'
        },
        EDIT_CUSTOMER_INFO: 'collectingCustomerInfo',
        EDIT_SHIPPING: 'collectingShipping',
        EDIT_BILLING: 'collectingBilling',
        EDIT_PAYMENT: 'collectingPayment',
        CANCEL: {
          target: 'idle',
          actions: 'clearCheckout'
        }
      }
    },
    processing: {
      on: {
        ORDER_SUCCESS: {
          target: 'orderComplete',
          actions: 'finalizeOrder'
        },
        ORDER_ERROR: {
          target: 'orderError',
          actions: 'setOrderErrors'
        }
      }
    },
    orderComplete: {
      type: 'final',
      entry: 'clearCart'
    },
    orderError: {
      on: {
        RETRY: 'processing',
        EDIT_ORDER: 'reviewingOrder',
        CANCEL: {
          target: 'idle',
          actions: 'clearCheckout'
        }
      }
    }
  }
}, {
  actions: {
    initializeCheckout: (context) => {
      // Get cart from store
      context.cart = cartStore.getState().items;
    },
    clearCart: () => {
      // Clear cart when order is complete
      cartStore.getActions().clearCart();
    }
    // other action implementations...
  },
  conditions: {
    isValidCustomerInfo: (context, event) => {
      // Validation logic
      return true;
    }
    // other condition implementations...
  }
});
```

```tsx
// Using the state machine in React
import { useMachine } from 'assemblejs/react';
import { checkoutMachine } from './checkout-machine';

function CheckoutProcess() {
  const [state, send] = useMachine(checkoutMachine);
  
  // Render different steps based on state
  return (
    <div className="checkout-process">
      <h1>Checkout</h1>
      
      {state.matches('idle') && (
        <button onClick={() => send('START_CHECKOUT')}>
          Begin Checkout
        </button>
      )}
      
      {state.matches('collectingCustomerInfo') && (
        <CustomerInfoForm 
          onSubmit={(data) => send('SUBMIT_CUSTOMER_INFO', { data })}
          onCancel={() => send('CANCEL')}
          errors={state.context.errors}
        />
      )}
      
      {state.matches('collectingShipping') && (
        <ShippingForm 
          onSubmit={(data) => send('SUBMIT_SHIPPING', { data })}
          onBack={() => send('BACK')}
          onCancel={() => send('CANCEL')}
          errors={state.context.errors}
        />
      )}
      
      {/* Other checkout steps */}
    </div>
  );
}
```

## Best Practices

### Performance Optimization

Optimize state updates:

1. **Minimize state updates**: Batch changes to avoid unnecessary renders
2. **Use immutable patterns**: Create new objects instead of mutating existing ones
3. **Calculate derived values**: Use getters for values that depend on other state
4. **Optimize subscriptions**: Subscribe only to the parts of state you need
5. **Debounce and throttle**: Limit the frequency of state updates

```typescript
// Optimized store update example
actions: {
  // WRONG: Updating state multiple times
  updateCartBad(state, item) {
    // These are separate state updates
    state.items.push(item);
    state.itemCount += 1;
    state.total += item.price * item.quantity;
  },
  
  // RIGHT: Batch updates and calculate derived values
  updateCartGood(state, item) {
    // Single update with all changes
    return {
      ...state,
      items: [...state.items, item]
      // Derived values calculated by getters
    };
  }
}

// Use getters for derived values
getters: {
  itemCount: state => state.items.reduce((count, item) => count + item.quantity, 0),
  total: state => state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
}
```

### Security Considerations

Secure your state management:

1. **Validate input**: Always validate data coming from user inputs
2. **Sanitize stored data**: Remove sensitive information before storing
3. **Use HTTPS**: Ensure all communication is encrypted
4. **Consider XSS protection**: Be careful with data rendered in the DOM
5. **Avoid storing secrets**: Never store API keys or credentials in client state

```typescript
// Store with security features
export const userStore = createStore({
  state: {
    user: null,
    isAuthenticated: false,
    permissions: []
  },
  
  actions: {
    setUser(state, userData) {
      // Sanitize user data - remove sensitive fields
      const sanitizedUser = sanitizeUserData(userData);
      
      // Update state
      state.user = sanitizedUser;
      state.isAuthenticated = true;
    }
  }
});

// Security helpers
function sanitizeUserData(userData) {
  // Create a new object with only safe properties
  const { 
    id, name, email, avatar, role, 
    // Exclude these sensitive fields
    // password, token, securityQuestion, creditCardInfo
  } = userData;
  
  return { id, name, email, avatar, role };
}
```

### Debugging and Testing

Make debugging easier:

```typescript
// Store with debugging features
export const debuggableStore = createStore({
  // Store config
}, {
  debug: process.env.NODE_ENV === 'development',
  
  // Log all state changes
  onStateChange: (prevState, newState, action) => {
    console.group('State Update');
    console.log('Previous State:', prevState);
    console.log('Action:', action);
    console.log('New State:', newState);
    console.groupEnd();
  }
});
```

```typescript
// Testing store example
describe('Cart Store', () => {
  // Test initial state
  test('should have empty initial state', () => {
    const { state } = cartStore;
    expect(state.items).toEqual([]);
    expect(state.itemCount).toBe(0);
    expect(state.total).toBe(0);
  });
  
  // Test actions
  test('should add items correctly', () => {
    const { state, actions } = cartStore;
    
    // Add an item
    actions.addItem({
      id: '123',
      name: 'Test Product',
      price: 9.99,
      quantity: 1
    });
    
    // Check that state was updated
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('Test Product');
    expect(state.itemCount).toBe(1);
    expect(state.total).toBe(9.99);
  });
  
  // Test getters
  test('hasItems getter should work correctly', () => {
    const { state, actions, getters } = cartStore;
    
    // Empty cart
    expect(getters.hasItems).toBe(false);
    
    // Add an item
    actions.addItem({
      id: '123',
      name: 'Test Product',
      price: 9.99,
      quantity: 1
    });
    
    // Cart now has items
    expect(getters.hasItems).toBe(true);
  });
});
```

## Common Patterns and Examples

### Shopping Cart

A complete shopping cart implementation:

```typescript
// Cart store
export const cartStore = createStore({
  state: {
    items: [],
    itemCount: 0,
    total: 0,
    currency: 'USD',
    taxRate: 0.0725,
    shipping: 0
  },
  
  actions: {
    addItem(state, item) {
      const existingIndex = state.items.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + item.quantity
        };
        
        return {
          ...state,
          items: updatedItems
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, { ...item }]
        };
      }
    },
    
    removeItem(state, itemId) {
      return {
        ...state,
        items: state.items.filter(item => item.id !== itemId)
      };
    },
    
    updateQuantity(state, { itemId, quantity }) {
      return {
        ...state,
        items: state.items.map(item => 
          item.id === itemId 
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      };
    },
    
    clearCart(state) {
      return {
        ...state,
        items: []
      };
    },
    
    setShipping(state, shipping) {
      return {
        ...state,
        shipping
      };
    },
    
    setCurrency(state, currency) {
      return {
        ...state,
        currency
      };
    },
    
    setTaxRate(state, taxRate) {
      return {
        ...state,
        taxRate
      };
    }
  },
  
  getters: {
    itemCount: state => state.items.reduce(
      (count, item) => count + item.quantity, 0
    ),
    
    subtotal: state => state.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    ),
    
    tax: (state, getters) => getters.subtotal * state.taxRate,
    
    total: (state, getters) => getters.subtotal + getters.tax + state.shipping,
    
    formatCurrency: state => (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: state.currency
      }).format(amount);
    },
    
    isEmpty: state => state.items.length === 0,
    
    itemsGroupedByCategory: state => {
      return state.items.reduce((groups, item) => {
        const category = item.category || 'Other';
        if (!groups[category]) groups[category] = [];
        groups[category].push(item);
        return groups;
      }, {});
    }
  }
}, {
  // Persist cart between page refreshes
  persist: {
    key: 'shopping-cart',
    storage: 'localStorage'
  }
});
```

### User Authentication

Cross-framework authentication:

```typescript
// Auth store
export const authStore = createStore({
  state: {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null
  },
  
  actions: {
    login: async (state, credentials) => {
      // Set loading state
      state.loading = true;
      state.error = null;
      
      try {
        // Call API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          throw new Error('Login failed');
        }
        
        const data = await response.json();
        
        // Update state with auth data
        return {
          ...state,
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          loading: false
        };
      } catch (error) {
        // Handle error
        return {
          ...state,
          error: error.message,
          loading: false
        };
      }
    },
    
    logout: async (state) => {
      // Clear auth state
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false
      };
    },
    
    checkAuth: async (state) => {
      // Set loading state
      state.loading = true;
      
      try {
        // Call API with stored token
        const response = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Session expired');
        }
        
        const data = await response.json();
        
        // Update user data
        return {
          ...state,
          user: data.user,
          isAuthenticated: true,
          loading: false
        };
      } catch (error) {
        // Session is invalid, clear auth state
        return {
          ...state,
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: error.message
        };
      }
    }
  },
  
  getters: {
    isAdmin: state => {
      return state.isAuthenticated && 
             state.user && 
             state.user.role === 'admin';
    },
    
    permissions: state => {
      return state.user?.permissions || [];
    },
    
    hasPermission: (state, getters) => (permission) => {
      return getters.permissions.includes(permission);
    }
  }
}, {
  // Persist auth between page refreshes
  persist: {
    key: 'auth',
    storage: 'localStorage',
    // Don't persist loading or error state
    paths: ['user', 'token', 'isAuthenticated']
  }
});
```

## Next Steps

Now that you understand cross-framework state management in AssembleJS, explore these related topics:

- [Component Lifecycle](advanced-component-lifecycle.md) to learn how components interact with state
- [Server-Side Rendering](advanced-server-side-rendering.md) for more on state hydration
- [Islands Architecture](advanced-islands-architecture.md) to understand how state works with islands
- [Security Best Practices](advanced-security.md) for securing your application