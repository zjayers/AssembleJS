# Vue Integration

AssembleJS provides comprehensive support for Vue.js, allowing you to use Vue components within your AssembleJS application. This integration leverages Vue's powerful component model while taking advantage of AssembleJS's server-side rendering, component isolation, and event system.

## Getting Started with Vue in AssembleJS

### Prerequisites

Before using Vue with AssembleJS, ensure you have the following dependencies installed:

```bash
npm install vue vue-server-renderer
```

AssembleJS has built-in support for Vue through its renderer system.

### Creating a Vue Component

When you generate a component using `asmgen`, you can select Vue as the framework:

```bash
npx asmgen
# Select "Component" from the list
# Enter your component name
# Select "Vue" as the UI framework
```

### Folder Structure

For a Vue component named "product-card" in the "catalog" directory:

```
components/
└── catalog/
    └── product-card/
        ├── product-card.client.ts  # Client-side initialization
        ├── product-card.styles.scss # Component styles (optional, can also be in .vue file)
        └── product-card.view.vue   # Vue component
```

## Writing Vue Components in AssembleJS

### Basic Component Structure

```vue
<!-- product-card.view.vue -->
<template>
  <div class="product-card">
    <img :src="data.product.imageUrl" :alt="data.product.name" />
    <h3>{{ data.product.name }}</h3>
    <p class="price">${{ data.product.price.toFixed(2) }}</p>
    
    <div class="quantity-control">
      <button @click="decrement">-</button>
      <span>{{ quantity }}</span>
      <button @click="increment">+</button>
    </div>
    
    <p class="total">Total: ${{ totalPrice.toFixed(2) }}</p>
    
    <button class="add-to-cart-button">
      Add to Cart
    </button>
  </div>
</template>

<script>
export default {
  // Props from AssembleJS
  props: {
    data: {
      type: Object,
      required: true
    },
    context: {
      type: Object,
      required: true
    },
    params: {
      type: Object,
      required: true
    }
  },
  
  // Component data
  data() {
    return {
      quantity: 1
    };
  },
  
  // Computed properties
  computed: {
    totalPrice() {
      return this.data.product.price * this.quantity;
    }
  },
  
  // Methods
  methods: {
    increment() {
      this.quantity += 1;
    },
    decrement() {
      if (this.quantity > 1) {
        this.quantity -= 1;
      }
    }
  }
};
</script>

<style scoped>
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

.total {
  font-weight: bold;
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

Vue components in AssembleJS receive data from their factory through the `data` prop:

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

To add client-side interactivity to your Vue component, you can use the client file:

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

## Vue Component Options API

Vue's Options API is fully supported in AssembleJS:

```vue
<!-- shopping-cart.view.vue -->
<template>
  <div class="shopping-cart">
    <h2>Your Cart ({{ itemCount }} items)</h2>
    
    <div v-if="items.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
    </div>
    
    <template v-else>
      <ul class="cart-items">
        <li v-for="item in items" :key="item.id" class="cart-item">
          <img :src="item.imageUrl" :alt="item.name" />
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="price">${{ item.price.toFixed(2) }} each</p>
          </div>
          <div class="quantity-control">
            <button @click="updateQuantity(item.id, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
          <p class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</p>
          <button class="remove-item" @click="removeItem(item.id)">×</button>
        </li>
      </ul>
      
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Tax (7%):</span>
          <span>${{ tax.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
        
        <button class="checkout-button">Proceed to Checkout</button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      items: this.data.cartItems || []
    };
  },
  
  computed: {
    itemCount() {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    subtotal() {
      return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    tax() {
      return this.subtotal * 0.07;
    },
    
    total() {
      return this.subtotal + this.tax;
    }
  },
  
  methods: {
    updateQuantity(id, newQuantity) {
      if (newQuantity < 1) return;
      
      const updatedItems = this.items.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity } 
          : item
      );
      
      this.items = updatedItems;
      this.$emit('cart-updated', updatedItems);
    },
    
    removeItem(id) {
      const updatedItems = this.items.filter(item => item.id !== id);
      this.items = updatedItems;
      this.$emit('cart-updated', updatedItems);
    }
  }
};
</script>

<style scoped>
/* Styles for the cart component */
</style>
```

## Vue Composition API

Vue 3's Composition API is also fully supported:

```vue
<!-- product-details.view.vue -->
<template>
  <div class="product-details">
    <div class="gallery">
      <img 
        ref="mainImage"
        :src="product.images[selectedImage]" 
        :alt="product.name"
        @click="toggleExpanded"
        :class="{ expanded: isExpanded }"
      />
      <div class="thumbnails">
        <img 
          v-for="(img, idx) in product.images"
          :key="idx"
          :src="img" 
          :class="{ selected: idx === selectedImage }"
          @click="selectedImage = idx"
          :alt="`${product.name} - view ${idx + 1}`"
        />
      </div>
    </div>
    
    <div class="info">
      <h2>{{ product.name }}</h2>
      <p class="price">${{ product.price.toFixed(2) }}</p>
      <p class="description">{{ product.description }}</p>
      
      <div class="variants" v-if="product.variants">
        <h3>Variants</h3>
        <div class="variant-options">
          <button 
            v-for="variant in product.variants"
            :key="variant.id"
            @click="selectVariant(variant)"
            :class="{ selected: selectedVariant && selectedVariant.id === variant.id }"
          >
            {{ variant.name }}
          </button>
        </div>
      </div>
      
      <div class="actions">
        <div class="quantity">
          <button @click="decrement">-</button>
          <span>{{ quantity }}</span>
          <button @click="increment">+</button>
        </div>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  
  setup(props) {
    // References
    const mainImage = ref(null);
    
    // Reactive state
    const product = computed(() => props.data.product);
    const selectedImage = ref(0);
    const isExpanded = ref(false);
    const selectedVariant = ref(null);
    const quantity = ref(1);
    
    // Methods
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
    };
    
    const selectVariant = (variant) => {
      selectedVariant.value = variant;
    };
    
    const increment = () => {
      quantity.value += 1;
    };
    
    const decrement = () => {
      if (quantity.value > 1) {
        quantity.value -= 1;
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      // Initialize with the first variant if available
      if (product.value.variants && product.value.variants.length > 0) {
        selectedVariant.value = product.value.variants[0];
      }
      
      // Track product view
      if (typeof window !== 'undefined') {
        trackProductView(product.value.id);
      }
    });
    
    // Watch for variant changes
    watch(selectedVariant, (newVariant) => {
      // If variant has a specific image, show it
      if (newVariant && newVariant.imageIndex !== undefined) {
        selectedImage.value = newVariant.imageIndex;
      }
    });
    
    // Helper functions
    const trackProductView = (productId) => {
      // Implementation of tracking logic
      console.log(`Tracking view for product ${productId}`);
    };
    
    return {
      product,
      mainImage,
      selectedImage,
      isExpanded,
      selectedVariant,
      quantity,
      toggleExpanded,
      selectVariant,
      increment,
      decrement
    };
  }
};
</script>

<style scoped>
/* Styles for the product details component */
</style>
```

## Vue Component Props

AssembleJS passes several props to your Vue components:

| Prop | Description |
|------|-------------|
| `data` | The data object populated by the component's factory |
| `context` | The component context with additional utilities |
| `params` | URL and route parameters |

```vue
<!-- container.view.vue -->
<template>
  <div :class="`container ${data.size}`">
    <h2>{{ data.title }}</h2>
    <div class="container-content">
      <slot></slot>
    </div>
    <div class="debug-info">
      <p>Route: {{ params.route }}</p>
      <p>Component ID: {{ context.id }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    },
    context: {
      type: Object,
      required: true
    },
    params: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
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

AssembleJS fully supports TypeScript with Vue:

```vue
<!-- product-card.view.vue -->
<template>
  <div class="product-card">
    <!-- Component content -->
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Product, ComponentContext } from '../types';

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<{ product: Product }>,
      required: true
    },
    context: {
      type: Object as PropType<ComponentContext>,
      required: true
    },
    params: {
      type: Object as PropType<Record<string, string>>,
      required: true
    }
  },
  
  data() {
    return {
      quantity: 1
    };
  },
  
  computed: {
    totalPrice(): number {
      return this.data.product.price * this.quantity;
    }
  },
  
  methods: {
    increment(): void {
      this.quantity += 1;
    },
    decrement(): void {
      if (this.quantity > 1) {
        this.quantity -= 1;
      }
    }
  }
});
</script>
```

## Interacting with the AssembleJS Event System

Vue components can interact with the AssembleJS event system through a combination of the client file and custom events:

```typescript
// notification.client.ts
import { Blueprint } from 'asmbl';

class NotificationComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for cart events
    this.subscribe('cart', 'add', (event) => {
      // Use custom event to communicate with Vue component
      const customEvent = new CustomEvent('show-notification', {
        detail: `Added ${event.payload.quantity} item(s) to cart`
      });
      this.root.dispatchEvent(customEvent);
    });
  }
}

export default NotificationComponent;
```

In your Vue component, listen for these custom events:

```vue
<!-- notification.view.vue -->
<template>
  <div class="notification-container">
    <transition-group name="notification">
      <div 
        v-for="note in notifications" 
        :key="note.id" 
        class="notification"
      >
        {{ note.message }}
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notifications: []
    };
  },
  
  methods: {
    showNotification(message) {
      const id = Date.now();
      this.notifications.push({ id, message });
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 3000);
    }
  },
  
  mounted() {
    // Listen for custom events from the client file
    this.$el.addEventListener('show-notification', (event) => {
      this.showNotification(event.detail);
    });
  },
  
  beforeUnmount() {
    // Clean up event listener
    this.$el.removeEventListener('show-notification', this.showNotification);
  }
};
</script>

<style scoped>
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

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
```

## Vue Custom Directives

Vue custom directives are useful for low-level DOM access and are fully supported in AssembleJS:

```vue
<!-- chart.view.vue -->
<template>
  <div class="chart-container">
    <h3>{{ data.title }}</h3>
    <canvas v-chart="chartConfig"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      chartConfig: {
        type: 'bar',
        data: {
          labels: this.data.labels,
          datasets: this.data.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    };
  },
  
  directives: {
    chart: {
      mounted(el, binding) {
        // Create chart instance
        el._chart = new Chart(el, binding.value);
      },
      updated(el, binding) {
        // Update chart with new data
        el._chart.data = binding.value.data;
        el._chart.options = binding.value.options;
        el._chart.update();
      },
      unmounted(el) {
        // Clean up chart instance
        if (el._chart) {
          el._chart.destroy();
          delete el._chart;
        }
      }
    }
  }
};
</script>

<style scoped>
.chart-container {
  height: 300px;
  margin: 20px 0;
}
</style>
```

## Server-Side Rendering and Hydration

AssembleJS handles server-side rendering and hydration of Vue components automatically:

1. On the server, AssembleJS renders your Vue component to HTML
2. The HTML is sent to the client along with the necessary data
3. On the client, Vue hydrates the component, making it interactive
4. The component retains its state and event handlers

This process is transparent to the developer - you don't need to write special code to handle SSR and hydration.

## Vue's State Management with Vuex/Pinia

For more complex state management, you can integrate Vuex or Pinia:

```typescript
// store.ts (Vuex example)
import { createStore } from 'vuex';

export const store = createStore({
  state: {
    cart: {
      items: [],
      itemCount: 0,
      subtotal: 0
    }
  },
  
  getters: {
    cartItems: state => state.cart.items,
    itemCount: state => state.cart.itemCount,
    subtotal: state => state.cart.subtotal,
    tax: state => state.cart.subtotal * 0.07,
    total: state => state.cart.subtotal + (state.cart.subtotal * 0.07)
  },
  
  mutations: {
    ADD_TO_CART(state, { product, quantity }) {
      const existingItem = state.cart.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cart.items.push({ ...product, quantity });
      }
      
      // Update cart metrics
      state.cart.itemCount = state.cart.items.reduce(
        (total, item) => total + item.quantity, 0
      );
      state.cart.subtotal = state.cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
    },
    
    REMOVE_FROM_CART(state, productId) {
      state.cart.items = state.cart.items.filter(item => item.id !== productId);
      
      // Update cart metrics
      state.cart.itemCount = state.cart.items.reduce(
        (total, item) => total + item.quantity, 0
      );
      state.cart.subtotal = state.cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
    },
    
    UPDATE_QUANTITY(state, { productId, quantity }) {
      const item = state.cart.items.find(item => item.id === productId);
      if (item) {
        item.quantity = quantity;
      }
      
      // Update cart metrics
      state.cart.itemCount = state.cart.items.reduce(
        (total, item) => total + item.quantity, 0
      );
      state.cart.subtotal = state.cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
    }
  },
  
  actions: {
    addToCart({ commit }, { product, quantity = 1 }) {
      commit('ADD_TO_CART', { product, quantity });
    },
    
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId);
    },
    
    updateQuantity({ commit }, { productId, quantity }) {
      if (quantity < 1) return;
      commit('UPDATE_QUANTITY', { productId, quantity });
    }
  }
});
```

Using the store in a component:

```vue
<!-- product-card.view.vue -->
<template>
  <div class="product-card">
    <!-- Product details -->
    
    <div class="quantity-control">
      <button @click="decrement">-</button>
      <span>{{ quantity }}</span>
      <button @click="increment">+</button>
    </div>
    
    <button class="add-to-cart-button" @click="addToCart">
      Add to Cart
    </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      quantity: 1
    };
  },
  
  methods: {
    ...mapActions(['addToCart']),
    
    increment() {
      this.quantity += 1;
    },
    
    decrement() {
      if (this.quantity > 1) {
        this.quantity -= 1;
      }
    },
    
    addToCart() {
      this.addToCart({
        product: this.data.product,
        quantity: this.quantity
      });
    }
  }
};
</script>
```

## Best Practices

1. **Keep Components Focused**: Create small, focused Vue components that do one thing well
2. **Use Factory for Data Fetching**: Fetch data in the factory, not in the Vue component
3. **Leverage SSR**: Take advantage of AssembleJS's server-side rendering for faster initial load
4. **Type Your Props**: Use TypeScript to define prop types for better development experience
5. **Use Computed Properties**: Leverage Vue's computed properties for derived values
6. **Manage State Carefully**: Keep state as local as possible to avoid unnecessary re-renders
7. **Optimize Component Composition**: Structure your components for optimal re-use and performance
8. **Use AssembleJS Events for Cross-Component Communication**: Rather than prop drilling
9. **Scoped Styles**: Use scoped styles to prevent CSS conflicts

## Next Steps

- [Core Concepts - Components](../core-concepts-components.md) - Learn more about the component model
- [Core Concepts - Factories](../core-concepts-factories.md) - Understand how to prepare data for your components
- [Advanced Islands Architecture](../advanced-islands-architecture.md) - Learn about selective hydration
- [Cross-Framework State](../advanced-cross-framework-state.md) - Share state between Vue and other frameworks