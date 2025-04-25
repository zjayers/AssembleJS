# Migrating from Nuxt.js to AssembleJS

This guide provides a comprehensive roadmap for migrating your Nuxt.js application to AssembleJS, covering the key differences, migration strategies, and best practices to ensure a smooth transition.

## Overview

Nuxt.js and AssembleJS are both frameworks that provide server-side rendering capabilities, but they differ in their architecture and approach to component organization. While Nuxt.js is built specifically on top of Vue.js, AssembleJS is framework-agnostic and supports multiple UI libraries including Vue.js, React, Preact, Svelte, and plain HTML templates.

## Key Differences

| Feature | Nuxt.js | AssembleJS |
|---------|---------|------------|
| **Framework Support** | Vue.js only | Multiple (Vue, React, Preact, Svelte, HTML) |
| **Architecture** | Page-based with directory structure conventions | Blueprint and Component-based with explicit relationships |
| **Routing** | File-system based routing | Configuration-based routing with controllers |
| **State Management** | Vuex (integrated) | Cross-framework event system |
| **Plugins** | Nuxt-specific plugin system | Service and Factory pattern |
| **Rendering** | Universal rendering | Islands architecture with selective hydration |
| **Data Fetching** | `asyncData` and `fetch` hooks | Factory system and component controllers |

## Migration Process

### 1. Project Structure Setup

First, set up your AssembleJS project structure:

```bash
# Create a new AssembleJS project
npx asm new my-project --template vue

# Navigate to your new project
cd my-project
```

### 2. Component Migration Strategy

#### Pages to Blueprints

In Nuxt.js, your pages are in the `/pages` directory. In AssembleJS, these become blueprints:

**Nuxt.js Page:**
```vue
<!-- pages/products/[id].vue -->
<template>
  <div>
    <h1>{{ product.name }}</h1>
    <p>{{ product.description }}</p>
    <ProductPrice :price="product.price" />
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios }) {
    const product = await $axios.$get(`/api/products/${params.id}`);
    return { product };
  }
}
</script>
```

**AssembleJS Blueprint:**
```tsx
// src/blueprints/product/details/details.view.vue
<template>
  <div>
    <h1>{{ product.name }}</h1>
    <p>{{ product.description }}</p>
    <product-price :price="product.price" />
  </div>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      required: true
    }
  }
}
</script>
```

**AssembleJS Controller & Factory:**
```typescript
// Create a controller for the product blueprint
import { BlueprintController } from 'assemblejs';

export class ProductController extends BlueprintController {
  async handleRequest(request, reply) {
    const productId = request.params.id;
    const product = await this.services.productService.getProduct(productId);
    
    return {
      view: 'details',
      props: {
        product
      }
    };
  }
}
```

### 3. Routing Migration

Nuxt.js uses file-based routing, while AssembleJS uses configuration-based routing:

**AssembleJS Server Configuration:**
```typescript
// src/server.ts
import { createBlueprintServer } from 'assemblejs';
import { ProductController } from './controllers/product.controller';

const server = createBlueprintServer({
  routes: [
    {
      method: 'GET',
      path: '/products/:id',
      controller: ProductController
    }
  ]
});

server.start();
```

### 4. State Management Migration

Migrate from Vuex to AssembleJS event system:

**Nuxt.js Vuex Store:**
```javascript
// store/cart.js
export const state = () => ({
  items: []
});

export const mutations = {
  addItem(state, item) {
    state.items.push(item);
  }
};

export const actions = {
  async addToCart({ commit }, product) {
    commit('addItem', product);
  }
};
```

**AssembleJS Event System:**
```typescript
// src/events/cart.events.ts
import { EventBus } from 'assemblejs';

// Define event types
export const CartEvents = {
  ADD_ITEM: 'cart.addItem',
  REMOVE_ITEM: 'cart.removeItem',
  UPDATE_QUANTITY: 'cart.updateQuantity'
};

// Create a cart service
export class CartService {
  private items = [];
  
  constructor() {
    // Subscribe to events
    EventBus.subscribe(CartEvents.ADD_ITEM, this.handleAddItem.bind(this));
  }
  
  private handleAddItem(product) {
    this.items.push(product);
    // Emit a state update event
    EventBus.publish('cart.updated', this.items);
  }
  
  getItems() {
    return this.items;
  }
}
```

**Using in Vue Components:**
```vue
<!-- In a Vue component -->
<template>
  <button @click="addToCart">Add to Cart</button>
</template>

<script>
import { EventBus } from 'assemblejs';
import { CartEvents } from '../events/cart.events';

export default {
  props: ['product'],
  methods: {
    addToCart() {
      EventBus.publish(CartEvents.ADD_ITEM, this.product);
    }
  }
}
</script>
```

### 5. Migrating Layouts

Nuxt.js layouts can be implemented in AssembleJS using component composition:

**AssembleJS Layout Components:**
```typescript
// src/components/layout/main/main.view.vue
<template>
  <div class="main-layout">
    <header-component />
    <main>
      <slot></slot>
    </main>
    <footer-component />
  </div>
</template>

<script>
import HeaderComponent from '../header/header.view.vue';
import FooterComponent from '../footer/footer.view.vue';

export default {
  components: {
    'header-component': HeaderComponent,
    'footer-component': FooterComponent
  }
}
</script>
```

### 6. Data Fetching Migration

Replace Nuxt.js data fetching with AssembleJS factories:

**Create a Product Factory:**
```typescript
// src/factories/product.factory.ts
import { Service } from 'assemblejs';

export class ProductFactory extends Service {
  constructor(private apiService) {
    super();
  }
  
  async getProductDetails(id) {
    return await this.apiService.get(`/products/${id}`);
  }
  
  async getRelatedProducts(id) {
    return await this.apiService.get(`/products/${id}/related`);
  }
}
```

**Using the Factory in a Controller:**
```typescript
// src/controllers/product.controller.ts
import { BlueprintController } from 'assemblejs';

export class ProductController extends BlueprintController {
  async handleRequest(request, reply) {
    const { id } = request.params;
    
    // Use factories to fetch data
    const productFactory = this.serviceContainer.get('productFactory');
    const product = await productFactory.getProductDetails(id);
    const relatedProducts = await productFactory.getRelatedProducts(id);
    
    return {
      view: 'details',
      props: {
        product,
        relatedProducts
      }
    };
  }
}
```

### 7. Plugin Migration

Migrate Nuxt.js plugins to AssembleJS services:

**Nuxt.js Plugin:**
```javascript
// plugins/api.js
export default ({ $axios }, inject) => {
  const api = {
    async getProducts() {
      return await $axios.$get('/api/products');
    }
  };
  
  inject('api', api);
}
```

**AssembleJS Service:**
```typescript
// src/services/api.service.ts
import { Service } from 'assemblejs';
import axios from 'axios';

export class ApiService extends Service {
  private client;
  
  onInit() {
    this.client = axios.create({
      baseURL: process.env.API_URL
    });
  }
  
  async get(url) {
    const response = await this.client.get(url);
    return response.data;
  }
  
  async post(url, data) {
    const response = await this.client.post(url, data);
    return response.data;
  }
}
```

### 8. Middleware Migration

Replace Nuxt.js middleware with AssembleJS hooks:

**AssembleJS Hooks:**
```typescript
// src/hooks/auth.hook.ts
import { onRequest } from 'assemblejs';

export const authHook = onRequest(async (request, reply) => {
  if (!request.session.userId) {
    reply.redirect('/login');
    return;
  }
});

// Apply in server.ts
server.registerHook(authHook);
```

## Testing During Migration

It's recommended to run both your Nuxt.js and AssembleJS applications side by side during migration, which allows you to:

1. Compare the behavior and rendering
2. Migrate parts of the application gradually
3. Conduct A/B testing to validate the migration

## Deployment Considerations

When deploying your migrated AssembleJS application:

1. Update your CI/CD pipelines to use AssembleJS build commands
2. Adjust environment variables for the new application
3. Consider a phased rollout strategy to minimize risk

## Common Challenges and Solutions

### Component Lifecycle Differences

**Challenge:** Nuxt.js components have lifecycle hooks like `asyncData` that don't exist in Vue.js.

**Solution:** Use AssembleJS factories and controllers to handle data fetching before component rendering.

### Route Parameters

**Challenge:** Accessing route parameters is different in AssembleJS.

**Solution:** Parameters are available in the controller's `request.params` object.

### Client-Side Navigation

**Challenge:** Nuxt.js's `NuxtLink` component handles client-side navigation.

**Solution:** AssembleJS provides its own navigation system via the blueprint client:

```vue
<template>
  <a href="/products/123" @click.prevent="navigate">View Product</a>
</template>

<script>
import { BlueprintClient } from 'assemblejs';

export default {
  methods: {
    navigate(e) {
      BlueprintClient.navigate('/products/123');
    }
  }
}
</script>
```

## Performance Optimization

After migration, take advantage of AssembleJS's Islands Architecture for better performance:

1. Identify components that need interactivity vs. static content
2. Configure selective hydration for interactive components
3. Use the AssembleJS profiling tools to identify performance bottlenecks

## Related Topics

- [Vue Integration](../frameworks/vue)
- [Blueprints](../core-concepts-blueprints)
- [Event System](../core-concepts-event-system)
- [Islands Architecture](../advanced-islands-architecture)