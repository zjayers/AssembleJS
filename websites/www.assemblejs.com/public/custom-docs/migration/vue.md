# Migrating from Vue to AssembleJS

This guide provides a comprehensive approach to migrating your Vue application to AssembleJS. It covers the key differences, migration strategies, and practical examples to help you transition smoothly.

## Key Differences Between Vue and AssembleJS

### Architecture Approach

| Vue | AssembleJS |
|-----|------------|
| Component-based | Component and Blueprint-based |
| Virtual DOM diffing | Islands Architecture with selective hydration |
| Single framework | Multi-framework support |
| Options or Composition API | Framework-agnostic component model |
| Built-in directives | Template-specific features |

### Performance Considerations

| Vue | AssembleJS |
|-----|------------|
| Full-page hydration | Selective component hydration |
| Manual code splitting | Automatic fine-grained code splitting |
| Vue-specific optimizations | Framework-agnostic optimizations |
| Large JavaScript payload | Minimal JavaScript payload |
| Framework overhead | Framework-agnostic efficiency |

### Developer Experience

| Vue | AssembleJS |
|-----|------------|
| Vue-specific patterns | Framework-agnostic component model |
| SFC (Single File Components) | Split component files by concern |
| Vue Router | Controller-based routing |
| Vuex/Pinia for state | Event system for component communication |
| Vue-specific plugins | Framework-independent services |

## Migration Planning

### Assessment Phase

1. **Project Audit**
   - Catalog all Vue components and their relationships
   - Identify components with complex state management
   - Review data fetching patterns
   - Analyze Vuex/Pinia store structure
   - Map out route configuration

2. **Component Classification**
   - Identify presentation components for direct migration
   - List components with complex state for refactoring
   - Determine server-rendering candidates
   - Identify components requiring client-side interactivity

3. **State Management Analysis**
   - Map Vuex/Pinia stores to AssembleJS patterns
   - Plan event-based communication strategy
   - Determine factory data preparation approach

### Migration Strategy Options

1. **Incremental Migration**
   - Migrate one component or feature at a time
   - Use Vue as a rendering option within AssembleJS
   - Gradually transition to AssembleJS's server-first approach
   - Incrementally adopt the event system

2. **Parallel Implementation**
   - Create a new AssembleJS application
   - Implement key features in AssembleJS
   - Run both applications side by side
   - Gradually shift traffic from Vue to AssembleJS

3. **Hybrid Approach**
   - Keep Vue components that work well
   - Implement new features in AssembleJS
   - Use AssembleJS's Vue renderer for compatibility
   - Replace Vue-specific features gradually

## Step-by-Step Migration Guide

### 1. Setup AssembleJS Project

```bash
# Create a new AssembleJS project
npx asmgen
# Select "Project" from the list
# Enter your project name
# Follow the prompts
```

### 2. Migrating Vue Components to AssembleJS Components

#### Single File Components (SFC)

**Vue Component:**

```vue
<!-- ProductCard.vue -->
<template>
  <div class="product-card">
    <img :src="product.imageUrl" :alt="product.name" />
    <h3>{{ product.name }}</h3>
    <p class="price">${{ product.price.toFixed(2) }}</p>
    
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
export default {
  props: {
    product: {
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
    increment() {
      this.quantity++;
    },
    
    decrement() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    
    addToCart() {
      this.$emit('add-to-cart', {
        product: this.product,
        quantity: this.quantity
      });
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

**AssembleJS Components:**

```vue
<!-- src/components/product/card/card.view.vue -->
<template>
  <div class="product-card">
    <img :src="data.product.imageUrl" :alt="data.product.name" />
    <h3>{{ data.product.name }}</h3>
    <p class="price">${{ data.product.price.toFixed(2) }}</p>
    
    <div class="quantity-control">
      <button class="decrement">-</button>
      <span class="quantity-display">{{ data.initialQuantity }}</span>
      <button class="increment">+</button>
    </div>
    
    <button class="add-to-cart-button">
      Add to Cart
    </button>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  }
};
</script>
```

```scss
/* src/components/product/card/card.styles.scss */
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
```

```typescript
// src/components/product/card/card.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ProductCardFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get product data from params or fetch from API
    const product = context.params.product || await this.fetchProduct(context.params.productId);
    
    // Set data for the component
    context.data.set('product', product);
    context.data.set('initialQuantity', 1);
  }
  
  private async fetchProduct(productId: string) {
    // Fetch product data if not provided directly
    if (!productId) {
      return null;
    }
    
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    return response.json();
  }
}
```

```typescript
// src/components/product/card/card.client.ts
import { Blueprint } from 'asmbl';

class ProductCardComponent extends Blueprint {
  private quantity: number = 1;
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize from server-rendered state
    const quantityDisplay = this.element.querySelector('.quantity-display');
    if (quantityDisplay) {
      this.quantity = parseInt(quantityDisplay.textContent || '1', 10);
    }
    
    // Get references to elements
    const decrementButton = this.element.querySelector('.decrement');
    const incrementButton = this.element.querySelector('.increment');
    const addToCartButton = this.element.querySelector('.add-to-cart-button');
    
    // Add event listeners
    decrementButton?.addEventListener('click', () => this.decrement());
    incrementButton?.addEventListener('click', () => this.increment());
    addToCartButton?.addEventListener('click', () => this.addToCart());
  }
  
  private increment(): void {
    this.quantity++;
    this.updateDisplay();
  }
  
  private decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateDisplay();
    }
  }
  
  private updateDisplay(): void {
    const quantityDisplay = this.element.querySelector('.quantity-display');
    if (quantityDisplay) {
      quantityDisplay.textContent = this.quantity.toString();
    }
  }
  
  private addToCart(): void {
    const product = this.context.data.product;
    
    // Publish an event
    this.eventBus.publish('cart:add', {
      product,
      quantity: this.quantity
    });
  }
}

export default ProductCardComponent;
```

### 3. Migrating Vue Composition API

**Vue Component with Composition API:**

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <div v-if="loading">Loading profile...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else class="profile-content">
      <img :src="user.avatar" :alt="user.name" class="avatar" />
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ user.posts }}</span>
          <span class="stat-label">Posts</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ user.followers }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ user.following }}</span>
          <span class="stat-label">Following</span>
        </div>
      </div>
      
      <button @click="refreshProfile" :disabled="refreshing">
        {{ refreshing ? 'Refreshing...' : 'Refresh Profile' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const user = ref(null);
const loading = ref(true);
const error = ref(null);
const refreshing = ref(false);

const fetchUserProfile = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`/api/users/${props.userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    user.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const refreshProfile = async () => {
  refreshing.value = true;
  
  try {
    await fetchUserProfile();
  } finally {
    refreshing.value = false;
  }
};

onMounted(fetchUserProfile);
</script>

<style scoped>
/* Component styles */
</style>
```

**AssembleJS Components:**

```vue
<!-- src/components/user/profile/profile.view.vue -->
<template>
  <div class="user-profile">
    <div v-if="data.loading" class="loading-state">Loading profile...</div>
    <div v-else-if="data.error" class="error-state">Error: {{ data.error }}</div>
    <div v-else class="profile-content">
      <img :src="data.user.avatar" :alt="data.user.name" class="avatar" />
      <h2>{{ data.user.name }}</h2>
      <p>{{ data.user.email }}</p>
      
      <div class="stats">
        <div class="stat">
          <span class="stat-value">{{ data.user.posts }}</span>
          <span class="stat-label">Posts</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ data.user.followers }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ data.user.following }}</span>
          <span class="stat-label">Following</span>
        </div>
      </div>
      
      <button class="refresh-button">
        Refresh Profile
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  }
};
</script>
```

```typescript
// src/components/user/profile/profile.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class UserProfileFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const userId = context.params.userId;
    
    try {
      // Fetch user data
      const user = await this.fetchUserProfile(userId);
      
      // Set data for the component
      context.data.set('user', user);
      context.data.set('loading', false);
      context.data.set('error', null);
    } catch (error) {
      // Handle error
      context.data.set('user', null);
      context.data.set('loading', false);
      context.data.set('error', error.message);
    }
  }
  
  private async fetchUserProfile(userId: string) {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  }
}
```

```typescript
// src/components/user/profile/profile.client.ts
import { Blueprint } from 'asmbl';

class UserProfileComponent extends Blueprint {
  private refreshing: boolean = false;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get reference to refresh button
    const refreshButton = this.element.querySelector('.refresh-button');
    
    // Add event listener
    refreshButton?.addEventListener('click', () => this.refreshProfile());
  }
  
  private async refreshProfile(): Promise<void> {
    if (this.refreshing) return;
    
    this.refreshing = true;
    
    // Update button text
    const refreshButton = this.element.querySelector('.refresh-button');
    if (refreshButton) {
      refreshButton.textContent = 'Refreshing...';
      refreshButton.setAttribute('disabled', 'true');
    }
    
    try {
      // Show loading state
      this.element.querySelector('.profile-content')?.classList.add('hidden');
      
      const loadingElement = document.createElement('div');
      loadingElement.className = 'loading-state';
      loadingElement.textContent = 'Loading profile...';
      this.element.appendChild(loadingElement);
      
      // Fetch new data
      const userId = this.context.params.userId;
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to refresh user profile');
      }
      
      const user = await response.json();
      
      // Publish event to update other components
      this.eventBus.publish('user:profile-refreshed', { user });
      
      // Reload the page or update the DOM directly
      window.location.reload();
    } catch (error) {
      // Handle error
      console.error('Failed to refresh profile:', error);
      
      const errorElement = document.createElement('div');
      errorElement.className = 'error-state';
      errorElement.textContent = `Error: ${error.message}`;
      
      this.element.innerHTML = '';
      this.element.appendChild(errorElement);
    } finally {
      this.refreshing = false;
      
      // Update button text
      if (refreshButton) {
        refreshButton.textContent = 'Refresh Profile';
        refreshButton.removeAttribute('disabled');
      }
    }
  }
}

export default UserProfileComponent;
```

### 4. Migrating Vuex/Pinia State Management

**Vuex Store:**

```javascript
// store/index.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    cart: {
      items: [],
      itemCount: 0,
      total: 0
    },
    user: null,
    notifications: []
  },
  
  getters: {
    cartItems: state => state.cart.items,
    cartItemCount: state => state.cart.itemCount,
    cartTotal: state => state.cart.total,
    isAuthenticated: state => !!state.user
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
      state.cart.total = state.cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
    },
    
    REMOVE_FROM_CART(state, productId) {
      state.cart.items = state.cart.items.filter(item => item.id !== productId);
      
      // Update cart metrics
      state.cart.itemCount = state.cart.items.reduce(
        (total, item) => total + item.quantity, 0
      );
      state.cart.total = state.cart.items.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
    },
    
    SET_USER(state, user) {
      state.user = user;
    },
    
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        ...notification
      });
    },
    
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(
        notification => notification.id !== id
      );
    }
  },
  
  actions: {
    addToCart({ commit }, payload) {
      commit('ADD_TO_CART', payload);
    },
    
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId);
    },
    
    async login({ commit }, credentials) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const { user } = await response.json();
        commit('SET_USER', user);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    },
    
    async logout({ commit }) {
      await fetch('/api/auth/logout', { method: 'POST' });
      commit('SET_USER', null);
    },
    
    showNotification({ commit, dispatch }, notification) {
      commit('ADD_NOTIFICATION', notification);
      
      // Auto-remove notification after timeout
      setTimeout(() => {
        dispatch('removeNotification', notification.id);
      }, notification.timeout || 3000);
    },
    
    removeNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
    }
  }
});
```

**AssembleJS Services and Event-Based Approach:**

```typescript
// src/services/cart.service.ts
import { Service } from 'asmbl';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  [key: string]: any;
}

export class CartService extends Service {
  private items: CartItem[] = [];
  
  initialize() {
    // Initialize cart from storage if available
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        this.items = JSON.parse(storedCart);
      } catch (error) {
        console.error('Failed to parse stored cart:', error);
        this.items = [];
      }
    }
  }
  
  getItems(): CartItem[] {
    return [...this.items];
  }
  
  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
  
  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  addItem(product: any, quantity: number): void {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    
    this.persistCart();
  }
  
  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.persistCart();
  }
  
  updateItemQuantity(productId: string, quantity: number): void {
    const item = this.items.find(item => item.id === productId);
    
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.persistCart();
    }
  }
  
  clearCart(): void {
    this.items = [];
    this.persistCart();
  }
  
  private persistCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
}
```

```typescript
// src/services/auth.service.ts
import { Service } from 'asmbl';

export class AuthService extends Service {
  private user: any = null;
  
  initialize() {
    // Check for existing session
    this.checkSession();
  }
  
  getUser() {
    return this.user;
  }
  
  isAuthenticated(): boolean {
    return !!this.user;
  }
  
  async login(credentials: { email: string, password: string }) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const { user } = await response.json();
      this.user = user;
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      this.user = null;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private async checkSession() {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const { user } = await response.json();
        this.user = user;
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    }
  }
}
```

```typescript
// src/services/notification.service.ts
import { Service } from 'asmbl';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout?: number;
}

export class NotificationService extends Service {
  private notifications: Notification[] = [];
  
  getNotifications(): Notification[] {
    return [...this.notifications];
  }
  
  showNotification(notification: Omit<Notification, 'id'>): number {
    const id = Date.now();
    const newNotification = { id, ...notification };
    
    this.notifications.push(newNotification);
    
    // Auto-remove notification after timeout
    if (notification.timeout !== 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.timeout || 3000);
    }
    
    return id;
  }
  
  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
  }
}
```

```typescript
// src/components/cart/indicator/indicator.client.ts
import { Blueprint } from 'asmbl';
import { CartService } from '../../../services/cart.service';

class CartIndicatorComponent extends Blueprint {
  private cartService: CartService;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get the cart service
    this.cartService = this.getService(CartService);
    
    // Update the cart indicator
    this.updateCartIndicator();
    
    // Listen for cart events
    this.eventBus.subscribe('cart:add', (data) => {
      this.cartService.addItem(data.product, data.quantity);
      this.updateCartIndicator();
    });
    
    this.eventBus.subscribe('cart:remove', (data) => {
      this.cartService.removeItem(data.productId);
      this.updateCartIndicator();
    });
    
    this.eventBus.subscribe('cart:update', (data) => {
      this.cartService.updateItemQuantity(data.productId, data.quantity);
      this.updateCartIndicator();
    });
    
    this.eventBus.subscribe('cart:clear', () => {
      this.cartService.clearCart();
      this.updateCartIndicator();
    });
  }
  
  private updateCartIndicator(): void {
    const itemCount = this.cartService.getItemCount();
    const total = this.cartService.getTotal();
    
    // Update the UI
    const countElement = this.element.querySelector('.cart-count');
    const totalElement = this.element.querySelector('.cart-total');
    
    if (countElement) {
      countElement.textContent = itemCount.toString();
      
      // Show/hide based on item count
      if (itemCount > 0) {
        countElement.classList.remove('hidden');
      } else {
        countElement.classList.add('hidden');
      }
    }
    
    if (totalElement) {
      totalElement.textContent = `$${total.toFixed(2)}`;
    }
  }
}

export default CartIndicatorComponent;
```

### 5. Migrating Vue Router

**Vue Router:**

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import ProductList from '../views/ProductList.vue';
import ProductDetail from '../views/ProductDetail.vue';
import NotFound from '../views/NotFound.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

**AssembleJS Controllers:**

```typescript
// src/controllers/home.controller.ts
import { BlueprintController } from 'asmbl';

export class HomeController extends BlueprintController {
  async get(request, reply) {
    return this.renderBlueprint(reply, {
      components: [
        { name: 'home-hero' },
        { name: 'featured-products' },
        { name: 'testimonials' }
      ]
    });
  }
}
```

```typescript
// src/controllers/about.controller.ts
import { BlueprintController } from 'asmbl';

export class AboutController extends BlueprintController {
  async get(request, reply) {
    return this.renderBlueprint(reply, {
      components: [
        { name: 'about-content' },
        { name: 'team-members' },
        { name: 'company-mission' }
      ]
    });
  }
}
```

```typescript
// src/controllers/product-list.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductListController extends BlueprintController {
  async get(request, reply) {
    const { category, sort, page = 1 } = request.query;
    
    return this.renderBlueprint(reply, {
      components: [
        { 
          name: 'product-filters',
          params: { 
            category,
            sort
          }
        },
        { 
          name: 'product-grid',
          params: { 
            category,
            sort,
            page
          }
        },
        {
          name: 'pagination',
          params: {
            currentPage: page,
            // Other pagination params
          }
        }
      ]
    });
  }
}
```

```typescript
// src/controllers/product-detail.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductDetailController extends BlueprintController {
  async get(request, reply) {
    const { id } = request.params;
    
    return this.renderBlueprint(reply, {
      components: [
        { 
          name: 'product-details',
          params: { productId: id }
        },
        { 
          name: 'product-reviews',
          params: { productId: id }
        },
        { 
          name: 'related-products',
          params: { productId: id }
        }
      ]
    });
  }
}
```

For client-side navigation:

```typescript
// src/components/navigation/main/main.client.ts
import { Blueprint } from 'asmbl';

class NavigationComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Set up client-side navigation
    const links = this.element.querySelectorAll('a[data-client-nav]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (!href) return;
        
        // Update browser history
        window.history.pushState({}, '', href);
        
        // Publish navigation event
        this.eventBus.publish('navigation:changed', { path: href });
      });
    });
    
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', () => {
      this.eventBus.publish('navigation:changed', { path: window.location.pathname });
    });
  }
}

export default NavigationComponent;
```

### 6. Migrating Vue Directives

**Vue Component with Directives:**

```vue
<!-- ProductFeatures.vue -->
<template>
  <div class="product-features">
    <h3>Key Features</h3>
    <ul>
      <li v-for="feature in features" :key="feature.id" v-show="!feature.hidden">
        <span v-if="feature.highlighted" class="highlight">{{ feature.name }}</span>
        <span v-else>{{ feature.name }}</span>
        <p v-html="feature.description"></p>
      </li>
    </ul>
    
    <div v-if="showAdditionalInfo" class="additional-info">
      <h4>Additional Information</h4>
      <p>{{ additionalInfo }}</p>
    </div>
    
    <button @click="toggleAdditionalInfo">
      {{ showAdditionalInfo ? 'Hide Details' : 'Show Details' }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    features: {
      type: Array,
      required: true
    },
    additionalInfo: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      showAdditionalInfo: false
    };
  },
  
  methods: {
    toggleAdditionalInfo() {
      this.showAdditionalInfo = !this.showAdditionalInfo;
    }
  }
};
</script>
```

**AssembleJS Component with Similar Functionality:**

```vue
<!-- src/components/product/features/features.view.vue -->
<template>
  <div class="product-features">
    <h3>Key Features</h3>
    <ul>
      <template v-for="feature in data.features" :key="feature.id">
        <li v-if="!feature.hidden">
          <span :class="{ highlight: feature.highlighted }">{{ feature.name }}</span>
          <p v-html="feature.description"></p>
        </li>
      </template>
    </ul>
    
    <div v-if="data.showAdditionalInfo" class="additional-info">
      <h4>Additional Information</h4>
      <p>{{ data.additionalInfo }}</p>
    </div>
    
    <button class="toggle-info-button">
      {{ data.showAdditionalInfo ? 'Hide Details' : 'Show Details' }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  }
};
</script>
```

```typescript
// src/components/product/features/features.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ProductFeaturesFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get features from params or fetch from API
    const features = context.params.features || [];
    const additionalInfo = context.params.additionalInfo || '';
    
    // Set data for the component
    context.data.set('features', features);
    context.data.set('additionalInfo', additionalInfo);
    context.data.set('showAdditionalInfo', false);
  }
}
```

```typescript
// src/components/product/features/features.client.ts
import { Blueprint } from 'asmbl';

class ProductFeaturesComponent extends Blueprint {
  private showAdditionalInfo: boolean = false;
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize from server-rendered state
    this.showAdditionalInfo = this.context.data.showAdditionalInfo || false;
    
    // Get toggle button
    const toggleButton = this.element.querySelector('.toggle-info-button');
    
    // Add event listener
    toggleButton?.addEventListener('click', () => this.toggleAdditionalInfo());
  }
  
  private toggleAdditionalInfo(): void {
    this.showAdditionalInfo = !this.showAdditionalInfo;
    
    // Update UI
    const additionalInfoSection = this.element.querySelector('.additional-info');
    const toggleButton = this.element.querySelector('.toggle-info-button');
    
    if (additionalInfoSection) {
      if (this.showAdditionalInfo) {
        additionalInfoSection.classList.remove('hidden');
      } else {
        additionalInfoSection.classList.add('hidden');
      }
    }
    
    if (toggleButton) {
      toggleButton.textContent = this.showAdditionalInfo ? 'Hide Details' : 'Show Details';
    }
  }
}

export default ProductFeaturesComponent;
```

## Advanced Migration Topics

### Handling Vue Slots

**Vue Component with Slots:**

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div class="card-footer">
      <slot name="footer">
        <button v-if="showDefaultButton" @click="$emit('action')">
          {{ buttonText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Card Title'
    },
    showDefaultButton: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: 'Submit'
    }
  }
};
</script>
```

**AssembleJS Component Template Approach:**

```vue
<!-- src/components/common/card/card.view.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <!-- Customize with data.headerTemplate or use default -->
      <div v-if="data.headerTemplate" v-html="data.headerTemplate"></div>
      <h3 v-else>{{ data.title }}</h3>
    </div>
    
    <div class="card-body">
      <!-- Main content from data.bodyTemplate -->
      <div v-html="data.bodyTemplate"></div>
    </div>
    
    <div class="card-footer">
      <!-- Customize with data.footerTemplate or use default -->
      <div v-if="data.footerTemplate" v-html="data.footerTemplate"></div>
      <button 
        v-else-if="data.showDefaultButton" 
        class="default-action-button"
      >
        {{ data.buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  }
};
</script>
```

```typescript
// src/components/common/card/card.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class CardFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Set default values
    context.data.set('title', context.params.title || 'Card Title');
    context.data.set('showDefaultButton', context.params.showDefaultButton || false);
    context.data.set('buttonText', context.params.buttonText || 'Submit');
    
    // Set templates for slot-like behavior
    context.data.set('headerTemplate', context.params.headerTemplate || null);
    context.data.set('bodyTemplate', context.params.bodyTemplate || '');
    context.data.set('footerTemplate', context.params.footerTemplate || null);
  }
}
```

```typescript
// src/components/common/card/card.client.ts
import { Blueprint } from 'asmbl';

class CardComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Add event listener to the default action button if present
    const actionButton = this.element.querySelector('.default-action-button');
    
    if (actionButton) {
      actionButton.addEventListener('click', () => {
        // Publish an event
        this.eventBus.publish('card:action', {
          cardId: this.element.id,
          action: 'default'
        });
      });
    }
  }
}

export default CardComponent;
```

### Handling Vue Mixins and Plugins

**Vue Mixin and Plugin:**

```javascript
// mixins/trackable.js
export const trackableMixin = {
  data() {
    return {
      trackingId: `component-${Date.now()}`
    };
  },
  
  mounted() {
    this.trackPageView();
  },
  
  methods: {
    trackPageView() {
      if (this.$tracking) {
        this.$tracking.trackPageView({
          component: this.$options.name,
          id: this.trackingId
        });
      }
    },
    
    trackEvent(event, data) {
      if (this.$tracking) {
        this.$tracking.trackEvent({
          component: this.$options.name,
          id: this.trackingId,
          event,
          data
        });
      }
    }
  }
};

// plugins/tracking.js
export const trackingPlugin = {
  install(app, options) {
    const trackingService = {
      trackPageView(data) {
        console.log('Page view:', data);
        // Send to analytics service
      },
      
      trackEvent(data) {
        console.log('Event:', data);
        // Send to analytics service
      }
    };
    
    app.config.globalProperties.$tracking = trackingService;
  }
};
```

**AssembleJS Service Approach:**

```typescript
// src/services/tracking.service.ts
import { Service } from 'asmbl';

interface TrackingData {
  component: string;
  id: string;
  [key: string]: any;
}

export class TrackingService extends Service {
  initialize() {
    // Set up tracking service
    console.log('Tracking service initialized');
  }
  
  trackPageView(data: TrackingData): void {
    console.log('Page view:', data);
    
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: data.component,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...data
      });
    }
  }
  
  trackEvent(event: string, data: TrackingData): void {
    console.log('Event:', event, data);
    
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data);
    }
  }
}
```

```typescript
// src/components/base/trackable/trackable.client.ts
import { Blueprint } from 'asmbl';
import { TrackingService } from '../../../services/tracking.service';

class TrackableComponent extends Blueprint {
  private trackingId: string;
  private trackingService: TrackingService;
  
  constructor() {
    super();
    this.trackingId = `component-${Date.now()}`;
  }
  
  protected override onMount(): void {
    super.onMount();
    
    // Get tracking service
    this.trackingService = this.getService(TrackingService);
    
    // Track page view
    this.trackPageView();
  }
  
  protected trackPageView(): void {
    this.trackingService.trackPageView({
      component: this.constructor.name,
      id: this.trackingId
    });
  }
  
  protected trackEvent(event: string, data: any = {}): void {
    this.trackingService.trackEvent(event, {
      component: this.constructor.name,
      id: this.trackingId,
      ...data
    });
  }
}

export default TrackableComponent;
```

Usage in components:

```typescript
// src/components/product/details/details.client.ts
import TrackableComponent from '../../base/trackable/trackable.client';

class ProductDetailsComponent extends TrackableComponent {
  protected override onMount(): void {
    super.onMount();
    
    // Component-specific initialization
    const addToCartButton = this.element.querySelector('.add-to-cart-button');
    
    addToCartButton?.addEventListener('click', () => {
      const product = this.context.data.product;
      
      // Track the event
      this.trackEvent('add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        price: product.price
      });
      
      // Publish to event bus
      this.eventBus.publish('cart:add', {
        product,
        quantity: 1
      });
    });
  }
}

export default ProductDetailsComponent;
```

## Testing Your Migration

1. **Unit Tests**: Update your unit tests to match the new component structure
2. **Integration Tests**: Test the interaction between components and the event system
3. **End-to-End Tests**: Verify the complete user flows
4. **Performance Testing**: Compare performance metrics before and after migration
5. **Visual Regression Testing**: Ensure the UI remains consistent

## Common Challenges and Solutions

### Challenge: Vue Ecosystem Dependencies

Vue has a large ecosystem of libraries and plugins that may not directly work with AssembleJS.

**Solution:**
- Look for framework-agnostic alternatives
- Create adapter services that provide similar functionality
- Use Vue renderer in AssembleJS for critical components

### Challenge: Complex Vue Component Logic

Some Vue components may have complex logic that's hard to migrate directly.

**Solution:**
- Break down complex components into smaller, focused components
- Move business logic to factories and services
- Use the event system for cross-component communication

### Challenge: Developer Familiarity with Vue

Your team may be more comfortable with Vue patterns and concepts.

**Solution:**
- Provide training on AssembleJS concepts
- Document migration patterns for common Vue patterns
- Migrate incrementally to allow gradual learning

## Conclusion

Migrating from Vue to AssembleJS requires thoughtful planning and execution, but offers significant benefits in terms of performance, flexibility, and framework independence. By following this guide, you can leverage the strengths of AssembleJS while maintaining the core functionality and user experience of your Vue application.

Remember to:
- Start with a thorough assessment of your Vue application
- Choose the appropriate migration strategy based on your needs
- Migrate components in logical groupings
- Test thoroughly at each step
- Update documentation for your team

With AssembleJS's server-first approach and selective hydration, your application will benefit from improved performance, smaller bundle sizes, and more flexibility in choosing frontend technologies.