# Migrating from Svelte to AssembleJS

This guide provides a comprehensive approach to migrating your Svelte application to AssembleJS. It covers the key differences, migration strategies, and practical examples to help you transition smoothly.

## Key Differences Between Svelte and AssembleJS

### Architecture Approach

| Svelte | AssembleJS |
|--------|------------|
| Component-based with compiler | Component and Blueprint-based |
| Compile-time reactivity | Islands Architecture with selective hydration |
| Single framework | Multi-framework support |
| Framework-specific patterns | Framework-agnostic component model |
| SvelteKit for full-stack | Built-in server with controllers |

### Performance Considerations

| Svelte | AssembleJS |
|--------|------------|
| Compile-time optimizations | Server-first rendering with selective hydration |
| No virtual DOM | No virtual DOM overhead |
| Framework-specific optimizations | Framework-agnostic optimizations |
| SvelteKit with partial hydration | Built-in Islands Architecture |
| Client-side state management | Server-prepared data with minimal client state |

### Developer Experience

| Svelte | AssembleJS |
|--------|------------|
| Single file components (SFC) | Split component files by concern |
| Built-in reactivity | Event-based reactivity |
| Directive-based DOM manipulation | Client-side JavaScript DOM manipulation |
| Stores for state management | Event system for component communication |
| Svelte-specific syntax | Standard JavaScript/TypeScript |

## Migration Planning

### Assessment Phase

1. **Project Audit**
   - Catalog all Svelte components and their relationships
   - Identify reactive states and stores
   - Review routing configuration
   - Analyze data fetching patterns
   - Map dependencies between components

2. **Component Classification**
   - Identify presentation components for direct migration
   - List components with complex reactivity for refactoring
   - Determine server-rendering candidates
   - Identify client-interactive components

3. **State Management Analysis**
   - Map Svelte stores to AssembleJS patterns
   - Plan event-based communication strategy
   - Determine factory data preparation approach

### Migration Strategy Options

1. **Incremental Migration**
   - Migrate one component or feature at a time
   - Use Svelte as a rendering option within AssembleJS
   - Gradually transition to AssembleJS's server-first approach
   - Incrementally adopt the event system

2. **Parallel Implementation**
   - Create a new AssembleJS application
   - Implement key features in AssembleJS
   - Run both applications side by side
   - Gradually shift traffic from Svelte to AssembleJS

3. **Hybrid Approach**
   - Keep Svelte components that work well
   - Implement new features in AssembleJS
   - Use AssembleJS's Svelte renderer for compatibility
   - Replace Svelte-specific features gradually

## Step-by-Step Migration Guide

### 1. Setup AssembleJS Project

```bash
# Create a new AssembleJS project
npx asmgen
# Select "Project" from the list
# Enter your project name
# Follow the prompts
```

### 2. Migrating Svelte Components to AssembleJS Components

#### Simple Svelte Component

**Svelte Component:**

```svelte
<!-- ProductCard.svelte -->
<script>
  export let product;
  
  let quantity = 1;
  
  function increment() {
    quantity += 1;
  }
  
  function decrement() {
    if (quantity > 1) {
      quantity -= 1;
    }
  }
  
  function addToCart() {
    const event = new CustomEvent('add-to-cart', {
      detail: { product, quantity },
      bubbles: true
    });
    
    dispatchEvent(event);
  }
</script>

<div class="product-card">
  <img src={product.imageUrl} alt={product.name} />
  <h3>{product.name}</h3>
  <p class="price">${product.price.toFixed(2)}</p>
  
  <div class="quantity-control">
    <button on:click={decrement}>-</button>
    <span>{quantity}</span>
    <button on:click={increment}>+</button>
  </div>
  
  <button class="add-to-cart-button" on:click={addToCart}>
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

**AssembleJS Component:**

```svelte
<!-- src/components/product/card/card.view.svelte -->
<script>
  export let data;
  
  const { product } = data;
</script>

<div class="product-card">
  <img src={product.imageUrl} alt={product.name} />
  <h3>{product.name}</h3>
  <p class="price">${product.price.toFixed(2)}</p>
  
  <div class="quantity-control">
    <button class="decrement">-</button>
    <span class="quantity-display">{data.initialQuantity}</span>
    <button class="increment">+</button>
  </div>
  
  <button class="add-to-cart-button">
    Add to Cart
  </button>
</div>
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
    
    // Publish event to event bus (replacing Svelte's custom event)
    this.eventBus.publish('cart:add', {
      product,
      quantity: this.quantity
    });
  }
}

export default ProductCardComponent;
```

```scss
// src/components/product/card/card.styles.scss
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

### 3. Migrating Svelte Reactivity

**Svelte Component with Reactivity:**

```svelte
<!-- ShoppingCart.svelte -->
<script>
  export let items = [];
  
  // Reactive declarations
  $: itemCount = items.reduce((total, item) => total + item.quantity, 0);
  $: subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  $: tax = subtotal * 0.07;
  $: total = subtotal + tax;
  
  function updateQuantity(id, newQuantity) {
    if (newQuantity < 1) return;
    
    items = items.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    
    // Dispatch event for parent components
    dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { items },
      bubbles: true
    }));
  }
  
  function removeItem(id) {
    items = items.filter(item => item.id !== id);
    
    // Dispatch event for parent components
    dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { items },
      bubbles: true
    }));
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
  /* Styles for the cart */
</style>
```

**AssembleJS Component:**

```svelte
<!-- src/components/cart/summary/summary.view.svelte -->
<script>
  export let data;
  
  const { items = [], itemCount, subtotal, tax, total } = data;
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
            <button class="decrement" data-item-id={item.id}>-</button>
            <span class="quantity-display" data-item-id={item.id}>{item.quantity}</span>
            <button class="increment" data-item-id={item.id}>+</button>
          </div>
          <p class="item-total">${(item.price * item.quantity).toFixed(2)}</p>
          <button class="remove-item" data-item-id={item.id}>×</button>
        </li>
      {/each}
    </ul>
    
    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span class="subtotal-display">${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (7%):</span>
        <span class="tax-display">${tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span class="total-display">${total.toFixed(2)}</span>
      </div>
      
      <button class="checkout-button">Proceed to Checkout</button>
    </div>
  {/if}
</div>
```

```typescript
// src/components/cart/summary/summary.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { CartService } from '../../../services/cart.service';

export class CartSummaryFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get cart service
    const cartService = context.getService(CartService);
    
    // Get cart items
    const items = await cartService.getItems();
    
    // Calculate derived values
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    
    // Set data for the component
    context.data.set('items', items);
    context.data.set('itemCount', itemCount);
    context.data.set('subtotal', subtotal);
    context.data.set('tax', tax);
    context.data.set('total', total);
  }
}
```

```typescript
// src/components/cart/summary/summary.client.ts
import { Blueprint } from 'asmbl';
import { CartService } from '../../../services/cart.service';

class CartSummaryComponent extends Blueprint {
  private cartService: CartService;
  private items: any[] = [];
  
  protected override onMount(): void {
    super.onMount();
    
    // Get cart service
    this.cartService = this.getService(CartService);
    
    // Initialize items from server-rendered state
    this.items = [...this.context.data.items] || [];
    
    // Add event listeners for quantity controls
    this.element.querySelectorAll('.decrement').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = (e.target as HTMLElement).getAttribute('data-item-id');
        if (itemId) {
          const item = this.items.find(i => i.id === itemId);
          if (item && item.quantity > 1) {
            this.updateItemQuantity(itemId, item.quantity - 1);
          }
        }
      });
    });
    
    this.element.querySelectorAll('.increment').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = (e.target as HTMLElement).getAttribute('data-item-id');
        if (itemId) {
          const item = this.items.find(i => i.id === itemId);
          if (item) {
            this.updateItemQuantity(itemId, item.quantity + 1);
          }
        }
      });
    });
    
    // Add event listeners for remove buttons
    this.element.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemId = (e.target as HTMLElement).getAttribute('data-item-id');
        if (itemId) {
          this.removeItem(itemId);
        }
      });
    });
    
    // Add event listener for checkout button
    const checkoutButton = this.element.querySelector('.checkout-button');
    checkoutButton?.addEventListener('click', () => {
      this.eventBus.publish('cart:checkout', {
        items: this.items,
        total: this.calculateTotal()
      });
    });
    
    // Subscribe to cart events
    this.eventBus.subscribe('cart:add', (data) => {
      const { product, quantity } = data;
      this.addItem(product, quantity);
    });
    
    this.eventBus.subscribe('cart:update', (data) => {
      const { itemId, quantity } = data;
      this.updateItemQuantity(itemId, quantity);
    });
    
    this.eventBus.subscribe('cart:remove', (data) => {
      const { itemId } = data;
      this.removeItem(itemId);
    });
    
    this.eventBus.subscribe('cart:clear', () => {
      this.clearCart();
    });
  }
  
  private addItem(product: any, quantity: number): void {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    
    // Update the UI and cart service
    this.updateCartState();
  }
  
  private updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity < 1) return;
    
    this.items = this.items.map(item =>
      item.id === itemId
        ? { ...item, quantity }
        : item
    );
    
    // Update the UI and cart service
    this.updateCartState();
  }
  
  private removeItem(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
    
    // Update the UI and cart service
    this.updateCartState();
  }
  
  private clearCart(): void {
    this.items = [];
    
    // Update the UI and cart service
    this.updateCartState();
  }
  
  private updateCartState(): void {
    // Calculate derived values
    const itemCount = this.items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    
    // Update the cart service
    this.cartService.setItems(this.items);
    
    // Update the UI
    this.updateUI(itemCount, subtotal, tax, total);
    
    // Publish event for other components
    this.eventBus.publish('cart:updated', {
      items: this.items,
      itemCount,
      subtotal,
      tax,
      total
    });
  }
  
  private updateUI(itemCount: number, subtotal: number, tax: number, total: number): void {
    // Update item count
    const itemCountElement = this.element.querySelector('h2');
    if (itemCountElement) {
      itemCountElement.textContent = `Your Cart (${itemCount} items)`;
    }
    
    // Update cart items display
    const cartItemsList = this.element.querySelector('.cart-items');
    if (cartItemsList) {
      if (this.items.length === 0) {
        // Show empty cart message
        cartItemsList.innerHTML = '<p>Your cart is empty</p>';
        
        // Hide cart summary
        const cartSummary = this.element.querySelector('.cart-summary');
        if (cartSummary) {
          cartSummary.classList.add('hidden');
        }
      } else {
        // Ensure cart summary is visible
        const cartSummary = this.element.querySelector('.cart-summary');
        if (cartSummary) {
          cartSummary.classList.remove('hidden');
        }
        
        // Update summary values
        const subtotalElement = this.element.querySelector('.subtotal-display');
        const taxElement = this.element.querySelector('.tax-display');
        const totalElement = this.element.querySelector('.total-display');
        
        if (subtotalElement) {
          subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
        
        if (taxElement) {
          taxElement.textContent = `$${tax.toFixed(2)}`;
        }
        
        if (totalElement) {
          totalElement.textContent = `$${total.toFixed(2)}`;
        }
      }
    }
  }
  
  private calculateTotal(): number {
    const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    return subtotal + (subtotal * 0.07); // Add tax
  }
}

export default CartSummaryComponent;
```

### 4. Migrating Svelte Stores

**Svelte Store:**

```javascript
// stores/cart.js
import { writable, derived } from 'svelte/store';

// Create the writable store
export const cartItems = writable([]);

// Derived stores for calculations
export const itemCount = derived(cartItems, $items => 
  $items.reduce((total, item) => total + item.quantity, 0)
);

export const subtotal = derived(cartItems, $items => 
  $items.reduce((total, item) => total + (item.price * item.quantity), 0)
);

export const tax = derived(subtotal, $subtotal => $subtotal * 0.07);

export const total = derived([subtotal, tax], ([$subtotal, $tax]) => $subtotal + $tax);

// Cart actions
export function addToCart(product, quantity = 1) {
  cartItems.update(items => {
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      return items.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      return [...items, { ...product, quantity }];
    }
  });
}

export function updateQuantity(productId, quantity) {
  if (quantity < 1) return;
  
  cartItems.update(items => 
    items.map(item => 
      item.id === productId 
        ? { ...item, quantity } 
        : item
    )
  );
}

export function removeFromCart(productId) {
  cartItems.update(items => items.filter(item => item.id !== productId));
}

export function clearCart() {
  cartItems.set([]);
}
```

**AssembleJS Service:**

```typescript
// src/services/cart.service.ts
import { Service } from 'asmbl';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  [key: string]: any;
}

export class CartService extends Service {
  private items: CartItem[] = [];
  
  initialize() {
    // Load cart from local storage if available
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        this.items = JSON.parse(storedCart);
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
  }
  
  getItems(): CartItem[] {
    return [...this.items];
  }
  
  setItems(items: CartItem[]): void {
    this.items = [...items];
    this.persistCart();
  }
  
  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
  
  getSubtotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  getTax(): number {
    return this.getSubtotal() * 0.07;
  }
  
  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }
  
  addItem(product: any, quantity: number = 1): void {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    
    this.persistCart();
  }
  
  updateItemQuantity(productId: string, quantity: number): void {
    if (quantity < 1) return;
    
    const item = this.items.find(item => item.id === productId);
    
    if (item) {
      item.quantity = quantity;
      this.persistCart();
    }
  }
  
  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.persistCart();
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

### 5. Migrating Svelte Routing

**SvelteKit Routing:**

```javascript
// src/routes/+page.svelte
<script>
  // Home page component
</script>

<div class="home-page">
  <h1>Welcome to Our Store</h1>
  <!-- Content -->
</div>

// src/routes/products/+page.svelte
<script>
  export let data;
  
  const { products } = data;
</script>

<div class="products-page">
  <h1>Our Products</h1>
  
  <div class="product-grid">
    {#each products as product (product.id)}
      <ProductCard {product} on:add-to-cart />
    {/each}
  </div>
</div>

// src/routes/products/+page.js
export const load = async ({ fetch }) => {
  const response = await fetch('/api/products');
  const products = await response.json();
  
  return { products };
};

// src/routes/products/[slug]/+page.svelte
<script>
  export let data;
  
  const { product } = data;
</script>

<div class="product-detail">
  <h1>{product.name}</h1>
  <!-- Product details -->
</div>

// src/routes/products/[slug]/+page.js
export const load = async ({ params, fetch }) => {
  const { slug } = params;
  const response = await fetch(`/api/products/${slug}`);
  const product = await response.json();
  
  return { product };
};
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
        { name: 'promotion-banner' }
      ]
    });
  }
}
```

```typescript
// src/controllers/product-list.controller.ts
import { BlueprintController } from 'asmbl';
import { ProductService } from '../services/product.service';

export class ProductListController extends BlueprintController {
  private productService: ProductService;
  
  constructor() {
    super();
    this.productService = this.getService(ProductService);
  }
  
  async get(request, reply) {
    // Get query parameters for filtering
    const { category, sort } = request.query;
    
    // Fetch products
    const products = await this.productService.getProducts({
      category,
      sort
    });
    
    return this.renderBlueprint(reply, {
      components: [
        { 
          name: 'products-header',
          params: { title: 'Our Products' }
        },
        { 
          name: 'product-filters',
          params: { category, sort }
        },
        { 
          name: 'product-grid',
          params: { products }
        }
      ]
    });
  }
}
```

```typescript
// src/controllers/product-detail.controller.ts
import { BlueprintController } from 'asmbl';
import { ProductService } from '../services/product.service';

export class ProductDetailController extends BlueprintController {
  private productService: ProductService;
  
  constructor() {
    super();
    this.productService = this.getService(ProductService);
  }
  
  async get(request, reply) {
    const { slug } = request.params;
    
    // Fetch product
    const product = await this.productService.getProductBySlug(slug);
    
    if (!product) {
      return reply.code(404).send({ error: 'Product not found' });
    }
    
    return this.renderBlueprint(reply, {
      components: [
        { 
          name: 'product-detail',
          params: { product }
        },
        { 
          name: 'product-reviews',
          params: { productId: product.id }
        },
        { 
          name: 'related-products',
          params: { 
            category: product.category,
            excludeProductId: product.id
          }
        }
      ]
    });
  }
}
```

```typescript
// src/server.ts
import { createBlueprintServer } from 'asmbl';
import { HomeController } from './controllers/home.controller';
import { ProductListController } from './controllers/product-list.controller';
import { ProductDetailController } from './controllers/product-detail.controller';
import { CartController } from './controllers/cart.controller';
import { NotFoundController } from './controllers/not-found.controller';

createBlueprintServer({
  serverRoot: import.meta.url,
  manifest: {
    controllers: [
      { path: '/', controller: HomeController },
      { path: '/products', controller: ProductListController },
      { path: '/products/:slug', controller: ProductDetailController },
      { path: '/cart', controller: CartController },
      { path: '*', controller: NotFoundController }
    ]
  }
});
```

### 6. Migrating Svelte Actions and Transitions

**Svelte Component with Actions and Transitions:**

```svelte
<!-- Modal.svelte -->
<script>
  import { fade, fly } from 'svelte/transition';
  import { clickOutside } from '../actions/click-outside';
  
  export let isOpen = false;
  export let title = 'Modal';
  
  function close() {
    isOpen = false;
    dispatchEvent(new CustomEvent('close'));
  }
  
  // Trap focus in modal
  function trapFocus(node) {
    if (!node) return;
    
    // Save active element to restore focus later
    const previouslyFocused = document.activeElement;
    
    // Focus the modal
    node.focus();
    
    // Trap focus inside modal
    function handleKeydown(event) {
      if (event.key !== 'Tab') return;
      
      // Find all focusable elements
      const focusableElements = node.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
    
    // Event listeners
    node.addEventListener('keydown', handleKeydown);
    
    return {
      destroy() {
        node.removeEventListener('keydown', handleKeydown);
        
        // Restore focus
        if (previouslyFocused) {
          previouslyFocused.focus();
        }
      }
    };
  }
</script>

{#if isOpen}
  <div class="modal-backdrop" transition:fade={{ duration: 200 }}>
    <div 
      class="modal-container" 
      transition:fly={{ y: -20, duration: 300 }}
      use:clickOutside={close}
      use:trapFocus
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button class="close-button" on:click={close} aria-label="Close modal">
          ×
        </button>
      </div>
      
      <div class="modal-content">
        <slot />
      </div>
      
      <div class="modal-footer">
        <slot name="footer">
          <button class="cancel-button" on:click={close}>Cancel</button>
          <button class="primary-button">
            <slot name="confirm-text">Confirm</slot>
          </button>
        </slot>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Modal styles */
</style>
```

**AssembleJS Component:**

```svelte
<!-- src/components/common/modal/modal.view.svelte -->
<script>
  export let data;
  
  const { isOpen, title, content, footerContent, confirmText } = data;
</script>

{#if isOpen}
  <div class="modal-backdrop">
    <div 
      class="modal-container"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button class="close-button" aria-label="Close modal">
          ×
        </button>
      </div>
      
      <div class="modal-content">
        {#if typeof content === 'string'}
          <div>{@html content}</div>
        {:else}
          {content}
        {/if}
      </div>
      
      <div class="modal-footer">
        {#if footerContent}
          {@html footerContent}
        {:else}
          <button class="cancel-button">Cancel</button>
          <button class="primary-button">
            {confirmText || 'Confirm'}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
```

```typescript
// src/components/common/modal/modal.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ModalFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get modal data from params
    const isOpen = context.params.isOpen || false;
    const title = context.params.title || 'Modal';
    const content = context.params.content || '';
    const footerContent = context.params.footerContent || null;
    const confirmText = context.params.confirmText || 'Confirm';
    
    // Set data for the component
    context.data.set('isOpen', isOpen);
    context.data.set('title', title);
    context.data.set('content', content);
    context.data.set('footerContent', footerContent);
    context.data.set('confirmText', confirmText);
  }
}
```

```typescript
// src/components/common/modal/modal.client.ts
import { Blueprint } from 'asmbl';

class ModalComponent extends Blueprint {
  private isOpen: boolean = false;
  private previouslyFocused: Element | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize from server-rendered state
    this.isOpen = this.context.data.isOpen || false;
    
    // Get modal elements
    const backdrop = this.element.querySelector('.modal-backdrop');
    const container = this.element.querySelector('.modal-container');
    const closeButton = this.element.querySelector('.close-button');
    const cancelButton = this.element.querySelector('.cancel-button');
    const primaryButton = this.element.querySelector('.primary-button');
    
    if (!backdrop || !container) return;
    
    // Set initial state (adding animation classes)
    if (this.isOpen) {
      document.body.classList.add('modal-open');
      backdrop.classList.add('fade-in');
      container.classList.add('slide-in');
      
      // Store previously focused element
      this.previouslyFocused = document.activeElement;
      
      // Focus the modal
      container.setAttribute('tabindex', '-1');
      (container as HTMLElement).focus();
      
      // Set up focus trapping
      document.addEventListener('keydown', this.handleKeyDown);
      
      // Set up click outside to close
      backdrop.addEventListener('click', this.handleBackdropClick);
    }
    
    // Add event listeners
    closeButton?.addEventListener('click', () => this.close());
    cancelButton?.addEventListener('click', () => this.close());
    primaryButton?.addEventListener('click', () => this.confirm());
    
    // Subscribe to open/close events
    this.eventBus.subscribe('modal:open', (data) => this.open(data));
    this.eventBus.subscribe('modal:close', () => this.close());
  }
  
  protected override onDestroy(): void {
    super.onDestroy();
    
    // Clean up event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore body state
    if (this.isOpen) {
      document.body.classList.remove('modal-open');
    }
  }
  
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Close on Escape
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    
    // Trap focus inside modal
    if (event.key === 'Tab') {
      const container = this.element.querySelector('.modal-container');
      if (!container) return;
      
      // Find all focusable elements
      const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  private handleBackdropClick = (event: MouseEvent): void => {
    const container = this.element.querySelector('.modal-container');
    if (!container) return;
    
    // Close only if clicking on backdrop, not the modal content
    if (event.target === event.currentTarget) {
      this.close();
    }
  };
  
  private open(data: any): void {
    if (this.isOpen) return;
    
    // Store previously focused element
    this.previouslyFocused = document.activeElement;
    
    // Update modal content
    this.updateContent(data);
    
    // Show modal
    this.isOpen = true;
    
    const backdrop = this.element.querySelector('.modal-backdrop');
    const container = this.element.querySelector('.modal-container');
    
    if (backdrop && container) {
      // Add animation classes
      backdrop.classList.remove('hidden');
      backdrop.classList.add('fade-in');
      container.classList.add('slide-in');
      
      // Prevent background scrolling
      document.body.classList.add('modal-open');
      
      // Focus the modal
      container.setAttribute('tabindex', '-1');
      (container as HTMLElement).focus();
      
      // Set up event listeners
      document.addEventListener('keydown', this.handleKeyDown);
      backdrop.addEventListener('click', this.handleBackdropClick);
    }
  }
  
  private close(): void {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    const backdrop = this.element.querySelector('.modal-backdrop');
    const container = this.element.querySelector('.modal-container');
    
    if (backdrop && container) {
      // Add animation classes for closing
      backdrop.classList.remove('fade-in');
      backdrop.classList.add('fade-out');
      container.classList.remove('slide-in');
      container.classList.add('slide-out');
      
      // Wait for animation to complete
      setTimeout(() => {
        backdrop.classList.add('hidden');
        backdrop.classList.remove('fade-out');
        container.classList.remove('slide-out');
        
        // Restore body state
        document.body.classList.remove('modal-open');
        
        // Clean up event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        backdrop.removeEventListener('click', this.handleBackdropClick);
        
        // Restore focus
        if (this.previouslyFocused && this.previouslyFocused instanceof HTMLElement) {
          this.previouslyFocused.focus();
        }
      }, 300); // Match animation duration
    }
    
    // Publish event
    this.eventBus.publish('modal:closed', {});
  }
  
  private confirm(): void {
    // Publish event
    this.eventBus.publish('modal:confirmed', {});
    
    // Close the modal
    this.close();
  }
  
  private updateContent(data: any): void {
    // Update modal title
    const titleElement = this.element.querySelector('#modal-title');
    if (titleElement && data.title) {
      titleElement.textContent = data.title;
    }
    
    // Update modal content
    const contentElement = this.element.querySelector('.modal-content');
    if (contentElement && data.content) {
      contentElement.innerHTML = data.content;
    }
    
    // Update footer content
    if (data.footerContent) {
      const footerElement = this.element.querySelector('.modal-footer');
      if (footerElement) {
        footerElement.innerHTML = data.footerContent;
        
        // Re-attach event listeners to new buttons
        const closeButton = footerElement.querySelector('.cancel-button');
        const confirmButton = footerElement.querySelector('.primary-button');
        
        closeButton?.addEventListener('click', () => this.close());
        confirmButton?.addEventListener('click', () => this.confirm());
      }
    } else if (data.confirmText) {
      // Update confirm button text
      const confirmButton = this.element.querySelector('.primary-button');
      if (confirmButton) {
        confirmButton.textContent = data.confirmText;
      }
    }
  }
}

export default ModalComponent;
```

```scss
// src/components/common/modal/modal.styles.scss
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  &.hidden {
    display: none;
  }
  
  &.fade-in {
    animation: fadeIn 0.2s ease-in-out forwards;
  }
  
  &.fade-out {
    animation: fadeOut 0.2s ease-in-out forwards;
  }
}

.modal-container {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  
  &.slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  &.slide-out {
    animation: slideOut 0.3s ease-in forwards;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-content {
  padding: 16px;
  flex-grow: 1;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.cancel-button {
  background-color: #f1f1f1;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e1e1e1;
  }
}

.primary-button {
  background-color: #457b9d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #1d3557;
  }
}

// Animations
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  from { 
    opacity: 1;
    transform: translateY(0);
  }
  to { 
    opacity: 0;
    transform: translateY(-20px);
  }
}

// Helper class for body
:global(body.modal-open) {
  overflow: hidden;
}
```

## Advanced Migration Topics

### Handling SvelteKit Load Functions

**SvelteKit Load Function:**

```javascript
// src/routes/products/+page.js
export const load = async ({ fetch, params, url, parent }) => {
  const parentData = await parent();
  const { user } = parentData;
  
  // Get query parameters
  const category = url.searchParams.get('category');
  const page = url.searchParams.get('page') || '1';
  
  // Fetch products
  const response = await fetch(`/api/products?category=${category || ''}&page=${page}`);
  const { products, pagination } = await response.json();
  
  return {
    products,
    pagination,
    category,
    user
  };
};
```

**AssembleJS Factory:**

```typescript
// src/components/product/grid/grid.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { ProductService } from '../../../services/product.service';

export class ProductGridFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get services
    const productService = context.getService(ProductService);
    
    // Get query parameters
    const category = context.params.category;
    const page = parseInt(context.params.page || '1', 10);
    
    // Fetch products
    const { products, pagination } = await productService.getProducts({
      category,
      page
    });
    
    // Set data for the component
    context.data.set('products', products);
    context.data.set('pagination', pagination);
    context.data.set('category', category);
  }
}
```

### Handling Svelte Special Elements

**Svelte Component with Special Elements:**

```svelte
<!-- ProductList.svelte -->
<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import ProductCard from './ProductCard.svelte';
  
  export let products = [];
  export let loading = false;
  
  let filteredProducts = [];
  let searchTerm = '';
  
  $: {
    if (searchTerm) {
      filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      filteredProducts = products;
    }
  }
  
  // Keyed each block for optimized updates
</script>

<div class="product-list">
  <div class="search-container">
    <input 
      bind:value={searchTerm} 
      placeholder="Search products..." 
    />
  </div>
  
  {#if loading}
    <div class="loading-indicator">Loading products...</div>
  {:else if filteredProducts.length === 0}
    <div class="no-results">No products found</div>
  {:else}
    <div class="product-grid">
      {#each filteredProducts as product (product.id)}
        <div in:fly={{ y: 20, duration: 300, delay: 300 }}>
          <ProductCard {product} on:add-to-cart />
        </div>
      {/each}
    </div>
  {/if}
  
  <svelte:window on:resize={handleWindowResize} />
</div>
```

**AssembleJS Component:**

```svelte
<!-- src/components/product/list/list.view.svelte -->
<script>
  export let data;
  
  const { products, loading, searchTerm } = data;
  
  let filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;
</script>

<div class="product-list">
  <div class="search-container">
    <input 
      value={searchTerm}
      class="search-input"
      placeholder="Search products..." 
    />
  </div>
  
  {#if loading}
    <div class="loading-indicator">Loading products...</div>
  {:else if filteredProducts.length === 0}
    <div class="no-results">No products found</div>
  {:else}
    <div class="product-grid">
      {#each filteredProducts as product (product.id)}
        <div class="product-item">
          <div data-component="product-card" data-product-id={product.id}></div>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

```typescript
// src/components/product/list/list.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { ProductService } from '../../../services/product.service';

export class ProductListFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get services
    const productService = context.getService(ProductService);
    
    // Get parameters
    const category = context.params.category;
    
    // Set initial state
    context.data.set('loading', true);
    context.data.set('searchTerm', '');
    
    // Fetch products
    try {
      const products = await productService.getProducts({ category });
      
      context.data.set('products', products);
      context.data.set('loading', false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      context.data.set('products', []);
      context.data.set('loading', false);
      context.data.set('error', error.message);
    }
  }
}
```

```typescript
// src/components/product/list/list.client.ts
import { Blueprint } from 'asmbl';

class ProductListComponent extends Blueprint {
  private searchTerm: string = '';
  private products: any[] = [];
  private filteredProducts: any[] = [];
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize from server-rendered state
    this.products = [...this.context.data.products] || [];
    this.searchTerm = this.context.data.searchTerm || '';
    this.filteredProducts = [...this.products];
    
    // Set up search functionality
    const searchInput = this.element.querySelector('.search-input');
    if (searchInput) {
      // Set initial value
      (searchInput as HTMLInputElement).value = this.searchTerm;
      
      // Add event listener
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = (e.target as HTMLInputElement).value;
        this.filterProducts();
      });
    }
    
    // Add window resize handler
    window.addEventListener('resize', this.handleWindowResize);
  }
  
  protected override onDestroy(): void {
    super.onDestroy();
    
    // Clean up event listeners
    window.removeEventListener('resize', this.handleWindowResize);
  }
  
  private filterProducts(): void {
    if (this.searchTerm) {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredProducts = [...this.products];
    }
    
    this.updateProductGrid();
  }
  
  private updateProductGrid(): void {
    const productGrid = this.element.querySelector('.product-grid');
    if (!productGrid) return;
    
    // Handle empty results
    if (this.filteredProducts.length === 0) {
      productGrid.innerHTML = '<div class="no-results">No products found</div>';
      return;
    }
    
    // Create product cards
    const productItems = this.filteredProducts.map(product => {
      // Create element with animation classes
      const item = document.createElement('div');
      item.className = 'product-item slide-in';
      
      // Add component
      item.innerHTML = `<div data-component="product-card" data-product-id="${product.id}"></div>`;
      
      return item;
    });
    
    // Clear and append new items
    productGrid.innerHTML = '';
    productItems.forEach(item => {
      productGrid.appendChild(item);
    });
    
    // Initialize new components
    this.eventBus.publish('components:initialize', {
      root: productGrid
    });
  }
  
  private handleWindowResize = (): void => {
    // Handle window resize events
    // For example, adjust grid layout or card sizes
    const productGrid = this.element.querySelector('.product-grid');
    if (!productGrid) return;
    
    // Adjust layout based on window size
    if (window.innerWidth < 600) {
      productGrid.classList.add('single-column');
      productGrid.classList.remove('multi-column');
    } else {
      productGrid.classList.remove('single-column');
      productGrid.classList.add('multi-column');
    }
  };
}

export default ProductListComponent;
```

## Testing Your Migration

1. **Unit Testing**: Update your tests to match the new component structure
2. **Integration Testing**: Test the interaction between components and the event system
3. **End-to-End Testing**: Verify the complete user flows
4. **Performance Testing**: Compare performance metrics before and after migration
5. **Visual Testing**: Ensure the UI remains consistent

## Common Challenges and Solutions

### Challenge: Svelte's Reactive Declarations

Svelte's reactive declarations are a core part of its design but don't have a direct equivalent in AssembleJS.

**Solution:**
- Use factory methods for server-side calculations
- Implement equivalent logic in client-side code
- Consider using computed properties in data models

### Challenge: Svelte Transitions

Svelte's built-in transitions don't have direct equivalents in AssembleJS.

**Solution:**
- Implement CSS transitions and animations
- Add/remove classes to trigger animations
- Use the Web Animations API for more complex animations

### Challenge: SvelteKit Features

SvelteKit offers many features for routing, data loading, and more.

**Solution:**
- Map SvelteKit routes to AssembleJS controllers
- Implement similar data loading patterns in factories
- Use service classes for shared functionality

## Conclusion

Migrating from Svelte to AssembleJS requires thoughtful planning and execution, but offers significant benefits in terms of performance, flexibility, and framework independence. By following this guide, you can leverage the strengths of AssembleJS while maintaining the core functionality and user experience of your Svelte application.

Remember to:
- Start with a thorough assessment of your Svelte application
- Choose an appropriate migration strategy
- Migrate components in logical groupings
- Test thoroughly at each step
- Update documentation for your team

With AssembleJS's server-first approach and selective hydration, your application will benefit from improved performance, smaller bundle sizes, and more flexibility in choosing frontend technologies.