# Building a Storefront with AssembleJS

This tutorial will guide you through building a complete e-commerce storefront using AssembleJS. You'll learn how to create and connect multiple components, implement server-side rendering, and build a responsive, interactive user interface.

## What You'll Build

In this tutorial, you'll build a modern e-commerce storefront with the following features:

- A homepage with featured products
- A product listing page with filtering and sorting
- Product detail pages
- A shopping cart with real-time updates
- A checkout process

![Storefront preview](../assets/storefront-preview.png)

## Prerequisites

Before you get started, make sure you have:

- Node.js LTS or higher installed
- Basic knowledge of TypeScript and web development
- Familiarity with AssembleJS core concepts (or read the [Core Concepts](/docs/core-concepts) section first)

## Setup

Let's start by creating a new AssembleJS project:

```bash
# Install the CLI globally if you haven't already
npm install -g asmbl@next

# Create a new project using the generator
asmgen
```

When prompted:
1. Select "Project" from the list
2. Enter "assemblejs-storefront" as the name
3. Choose your preferred options for the remaining prompts

After the project is created, navigate to the directory and start the development server:

```bash
cd assemblejs-storefront
npm run dev
```

Your new project will be running at [http://localhost:3000](http://localhost:3000).

## Project Structure

Let's take a look at the project structure:

```
assemblejs-storefront/
├── src/
│   ├── blueprints/      # Page blueprints
│   ├── components/      # Reusable UI components
│   ├── controllers/     # API controllers
│   ├── factories/       # Data fetching factories
│   └── server.ts        # Main server file
├── package.json
└── tsconfig.json
```

## Step 1: Creating the Home Page

Let's create a home page blueprint with a hero banner and featured products section.

### Generate the Home Blueprint

Use the generator to create a new blueprint:

```bash
npx asmgen
```

When prompted:
1. Select "Blueprint"
2. Set the name to "home"
3. Set the view name to "welcome"
4. Choose "preact" as the UI framework

This will generate three files:

```
src/blueprints/home/welcome/
├── welcome.client.ts    # Client-side behavior
├── welcome.styles.scss  # Component styling
└── welcome.view.tsx     # Component template (Preact)
```

### Customize the Home Page

Let's update the welcome view to include a hero banner and featured products section.

Edit `src/blueprints/home/welcome/welcome.view.tsx`:

```tsx
export function Welcome(context: PreactViewContext) {
  // Sample featured products data (will come from a factory in a real app)
  const featuredProducts = [
    {
      id: "p1",
      name: "Classic Denim Jacket",
      price: 89.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.8,
      reviewCount: 156
    },
    {
      id: "p2",
      name: "Premium Cotton T-Shirt",
      price: 29.99, 
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.5,
      reviewCount: 89
    },
    // More products...
  ];

  return (
    <div className="home-welcome">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Welcome to Our Store</h1>
          <p>Discover the latest trends and best quality products.</p>
          <a href="/products/listing" className="shop-now-btn">Shop Now</a>
        </div>
      </div>
      
      {/* Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <div className="product-grid-item" key={product.id}>
              <context.component.product.card 
                product={product}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

## Step 2: Creating a Product Card Component

Now, let's create a reusable product card component that we'll use throughout the site.

### Generate the Product Card Component

```bash
npx asmgen
```

When prompted:
1. Select "Component"
2. Set the name to "product"
3. Set the view name to "card"
4. Choose "preact" as the UI framework
5. When asked if you want to add it to a blueprint, select "Yes" for the "home" blueprint

This will generate:

```
src/components/product/card/
├── card.client.ts
├── card.styles.scss
└── card.view.tsx
```

### Implement the Product Card Component

Update `src/components/product/card/card.view.tsx`:

```tsx
export function Card(context: PreactViewContext) {
  // Get product data from props or context
  const product = context.data.product || {
    id: "p1",
    name: "Product Name",
    price: 0,
    imageUrl: "https://via.placeholder.com/300x300",
    rating: 0,
    reviewCount: 0
  };
  
  // State for add to cart functionality
  const [isAdding, setIsAdding] = preact.useState(false);
  const [addedToCart, setAddedToCart] = preact.useState(false);
  
  // Handle add to cart action
  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate API call or processing
    setTimeout(() => {
      setIsAdding(false);
      setAddedToCart(true);
      
      // Emit event for cart component to listen to
      context.events.emit('cart.add', { 
        productId: product.id,
        quantity: 1,
        product: product
      });
      
      // Reset "Added" message after a delay
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }, 500);
  };

  return (
    <div className="product-card">
      <a href={`/product/details?id=${product.id}`} className="product-image">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
      </a>
      
      <div className="product-details">
        <h3 className="product-name">
          <a href={`/product/details?id=${product.id}`}>{product.name}</a>
        </h3>
        
        <div className="product-rating">
          <span className="stars" style={{ '--rating': product.rating }}>★★★★★</span>
          <span className="review-count">({product.reviewCount})</span>
        </div>
        
        <p className="product-price">${product.price.toFixed(2)}</p>
      </div>
      
      <button 
        className={`add-to-cart-button ${isAdding ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? (
          <span>Adding...</span>
        ) : addedToCart ? (
          <span>✓ Added to Cart</span>
        ) : (
          <span>Add to Cart</span>
        )}
      </button>
    </div>
  );
}
```

And update the styles in `src/components/product/card/card.styles.scss`:

```scss
.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .product-image {
    display: block;
    overflow: hidden;
    
    img {
      width: 100%;
      height: auto;
      aspect-ratio: 1/1;
      object-fit: cover;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .product-details {
    padding: 1rem;
    flex-grow: 1;
  }
  
  .product-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    
    a {
      color: #1a202c;
      text-decoration: none;
      
      &:hover {
        color: #3182ce;
      }
    }
  }
  
  .product-rating {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    
    .stars {
      color: #f6ad55;
      position: relative;
      
      &::before {
        content: "★★★★★";
        position: absolute;
        top: 0;
        left: 0;
        color: #f6ad55;
        width: calc(var(--rating) * 20%);
        overflow: hidden;
      }
    }
    
    .review-count {
      font-size: 0.75rem;
      color: #718096;
      margin-left: 0.5rem;
    }
  }
  
  .product-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
    margin: 0.5rem 0;
  }
  
  .add-to-cart-button {
    width: calc(100% - 2rem);
    margin: 0 1rem 1rem;
    padding: 0.75rem 1rem;
    background-color: #3182ce;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover:not(:disabled) {
      background-color: #2c5282;
    }
    
    &.loading {
      background-color: #90cdf4;
      cursor: wait;
    }
    
    &.added {
      background-color: #38a169;
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}
```

## Step 3: Creating a Data Factory

Now, let's create a factory to fetch the featured products data from a server-side source.

### Generate the Factory

```bash
npx asmgen
```

When prompted:
1. Select "Factory"
2. Set the name to "featured-products"
3. When asked which component it should be added to, select the "home" blueprint

This will create:

```
src/factories/featured-products.factory.ts
```

### Implement the Factory

Edit `src/factories/featured-products.factory.ts`:

```typescript
import { ComponentFactory, ServerContext } from 'asmbl';

// Define the product interface
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
}

export class FeaturedProductsFactory implements ComponentFactory {
  // Priority determines the order in which factories run
  priority = 10;
  
  // The factory method fetches and prepares data
  async factory(context: ServerContext): Promise<void> {
    try {
      // In a real app, you would fetch this from an API or database
      // For this tutorial, we'll use mock data
      const featuredProducts: Product[] = [
        {
          id: "p1",
          name: "Classic Denim Jacket",
          price: 89.99,
          imageUrl: "https://via.placeholder.com/300x300",
          rating: 4.8,
          reviewCount: 156
        },
        {
          id: "p2",
          name: "Premium Cotton T-Shirt",
          price: 29.99, 
          imageUrl: "https://via.placeholder.com/300x300",
          rating: 4.5,
          reviewCount: 89
        },
        {
          id: "p3",
          name: "Slim Fit Chino Pants",
          price: 59.99,
          imageUrl: "https://via.placeholder.com/300x300",
          rating: 4.3,
          reviewCount: 112
        },
        {
          id: "p4",
          name: "Leather Weekender Bag",
          price: 129.99,
          imageUrl: "https://via.placeholder.com/300x300",
          rating: 4.9,
          reviewCount: 76
        }
      ];
      
      // Add the products to the component's data context
      // This makes it available to the component
      context.data.set('featuredProducts', featuredProducts);
      
    } catch (error) {
      console.error('Error in FeaturedProductsFactory:', error);
      // Provide fallback data in case of an error
      context.data.set('featuredProducts', []);
    }
  }
}
```

Now update the home blueprint to use this data:

```tsx
export function Welcome(context: PreactViewContext) {
  // Get featured products from the context (populated by the factory)
  const featuredProducts = context.data.featuredProducts || [];

  return (
    <div className="home-welcome">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Welcome to Our Store</h1>
          <p>Discover the latest trends and best quality products.</p>
          <a href="/products/listing" className="shop-now-btn">Shop Now</a>
        </div>
      </div>
      
      {/* Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <div className="product-grid-item" key={product.id}>
              <context.component.product.card 
                product={product}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

## Step 4: Adding a Navigation Component

Let's create a navigation component to allow users to navigate between different pages.

### Generate the Navigation Component

```bash
npx asmgen
```

When prompted:
1. Select "Component"
2. Set the name to "navigation"
3. Set the view name to "main"
4. Choose "html" as the UI framework to demonstrate AssembleJS's multi-framework support
5. When asked if you want to add it to a blueprint, select "Yes" for all blueprints

This will generate:

```
src/components/navigation/main/
├── main.client.ts
├── main.styles.scss
└── main.view.html
```

### Implement the Navigation Component

Edit `src/components/navigation/main/main.view.html`:

```html
<header class="navigation-main">
  <div class="navigation-container">
    <div class="logo">
      <a href="/" aria-label="Home">
        <h1>AssembleJS Store</h1>
      </a>
    </div>
    
    <nav class="main-nav" aria-label="Main navigation">
      <ul class="nav-links">
        <li><a href="/" class="nav-link">Home</a></li>
        <li><a href="/products/listing" class="nav-link">Products</a></li>
        <li><a href="#" class="nav-link">Categories</a></li>
        <li><a href="#" class="nav-link">Deals</a></li>
        <li><a href="/about" class="nav-link">About</a></li>
      </ul>
    </nav>
    
    <!-- Shopping cart icon -->
    <div class="nav-actions">
      <a href="/cart" class="cart-link" aria-label="View shopping cart">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span id="cart-count" class="cart-count">0</span>
      </a>
    </div>
    
    <!-- Mobile menu toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
  </div>
</header>

<link href="main.styles.scss" rel="stylesheet" />
<script src="main.client.ts"></script>
```

And update the client behavior in `src/components/navigation/main/main.client.ts`:

```typescript
import { Blueprint, BlueprintClient, events } from "asmbl";

export class MainClient extends Blueprint {
  private cartCount = 0;
  private cartCountElement: HTMLElement | null = null;
  private mobileMenuToggle: HTMLElement | null = null;
  private mainNav: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get elements
    this.cartCountElement = document.getElementById('cart-count');
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.mainNav = document.querySelector('.main-nav');
    
    // Initialize mobile menu toggle
    this.initMobileMenu();
    
    // Load cart count from localStorage
    this.loadCartCount();
    
    // Listen for cart update events
    events.on('cart.add', this.handleCartAdd.bind(this));
  }
  
  private initMobileMenu(): void {
    if (!this.mobileMenuToggle || !this.mainNav) return;
    
    this.mobileMenuToggle.addEventListener('click', () => {
      this.mainNav?.classList.toggle('mobile-visible');
      this.mobileMenuToggle?.classList.toggle('active');
    });
  }
  
  private loadCartCount(): void {
    try {
      // Get cart items from localStorage
      const cartItems = localStorage.getItem('cartItems');
      if (cartItems) {
        const items = JSON.parse(cartItems);
        this.cartCount = items.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
        this.updateCartCountDisplay();
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  }
  
  private handleCartAdd(event: any): void {
    // Increment cart count and update display
    this.cartCount++;
    this.updateCartCountDisplay();
    
    // Animate the cart icon for visual feedback
    this.animateCartIcon();
  }
  
  private updateCartCountDisplay(): void {
    if (this.cartCountElement) {
      this.cartCountElement.textContent = this.cartCount.toString();
      
      // Show/hide the count based on whether there are items
      if (this.cartCount > 0) {
        this.cartCountElement.classList.add('visible');
      } else {
        this.cartCountElement.classList.remove('visible');
      }
    }
  }
  
  private animateCartIcon(): void {
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
      cartLink.classList.add('pulse');
      setTimeout(() => {
        cartLink.classList.remove('pulse');
      }, 300);
    }
  }
}

BlueprintClient.registerComponentCodeBehind(MainClient);
```

## Step 5: Creating a Cart Dropdown Component

Let's create a cart dropdown component using Vue to demonstrate AssembleJS's cross-framework support.

### Generate the Cart Component

```bash
npx asmgen
```

When prompted:
1. Select "Component"
2. Set the name to "cart"
3. Set the view name to "dropdown"
4. Choose "vue" as the UI framework
5. When asked if you want to add it to a blueprint, select "Yes" for all blueprints

This will generate:

```
src/components/cart/dropdown/
├── dropdown.client.ts
├── dropdown.styles.scss
└── dropdown.view.vue
```

### Implement the Cart Component

Edit `src/components/cart/dropdown/dropdown.view.vue`:

```vue
<template>
  <div class="cart-dropdown" :class="{ 'is-open': isOpen }">
    <!-- Cart toggle button -->
    <div class="cart-toggle" @click="toggleCart">
      <div class="cart-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span v-if="cartItems.length > 0" class="count">{{ totalItems }}</span>
      </div>
    </div>
    
    <!-- Cart dropdown content -->
    <div v-if="isOpen" class="cart-content">
      <div class="cart-header">
        <h3>Your Cart ({{ totalItems }})</h3>
        <button class="close-btn" @click="closeCart">×</button>
      </div>
      
      <!-- Empty cart state -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Your cart is empty</p>
        <button class="shop-now-btn" @click="goToProducts">Shop Now</button>
      </div>
      
      <!-- Cart items -->
      <div v-else class="cart-items">
        <ul class="cart-items-list">
          <li v-for="item in cartItems" :key="item.productId" class="cart-item">
            <div class="item-image">
              <img :src="item.product.imageUrl" :alt="item.product.name">
            </div>
            <div class="item-details">
              <h4 class="item-name">{{ item.product.name }}</h4>
              <div class="item-price">${{ item.product.price.toFixed(2) }}</div>
              <div class="item-quantity">
                <button @click="decrementQuantity(item)" :disabled="item.quantity <= 1">−</button>
                <span>{{ item.quantity }}</span>
                <button @click="incrementQuantity(item)">+</button>
              </div>
            </div>
            <button class="remove-item" @click="removeItem(item)">×</button>
          </li>
        </ul>
        
        <!-- Cart summary -->
        <div class="cart-summary">
          <div class="cart-subtotal">
            <span>Subtotal:</span>
            <span>${{ subtotal.toFixed(2) }}</span>
          </div>
          
          <div class="cart-buttons">
            <a href="/cart" class="view-cart-btn">View Cart</a>
            <a href="/checkout" class="checkout-btn">Checkout</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Overlay when cart is open -->
    <div v-if="isOpen" class="cart-overlay" @click="closeCart"></div>
  </div>
</template>

<script>
export default {
  name: 'CartDropdown',
  data() {
    return {
      isOpen: false,
      cartItems: []
    };
  },
  computed: {
    // Calculate total number of items
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    
    // Calculate cart subtotal
    subtotal() {
      return this.cartItems.reduce((total, item) => 
        total + (item.product.price * item.quantity), 0);
    }
  },
  methods: {
    // Toggle cart dropdown visibility
    toggleCart() {
      this.isOpen = !this.isOpen;
    },
    
    // Close the cart dropdown
    closeCart() {
      this.isOpen = false;
    },
    
    // Increment item quantity
    incrementQuantity(item) {
      item.quantity += 1;
      this.saveCart();
    },
    
    // Decrement item quantity
    decrementQuantity(item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        this.saveCart();
      }
    },
    
    // Remove item from cart
    removeItem(itemToRemove) {
      this.cartItems = this.cartItems.filter(item => 
        item.productId !== itemToRemove.productId);
      this.saveCart();
    },
    
    // Handle add to cart event
    handleCartAdd(event) {
      const { productId, quantity, product } = event.data;
      
      // Check if product already exists in cart
      const existingItem = this.cartItems.find(item => 
        item.productId === productId);
        
      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item to cart
        this.cartItems.push({
          productId,
          quantity,
          product
        });
      }
      
      // Save cart to localStorage
      this.saveCart();
      
      // Open the cart dropdown to show the item was added
      this.isOpen = true;
    },
    
    // Save cart to localStorage
    saveCart() {
      try {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    },
    
    // Load cart from localStorage
    loadCart() {
      try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
          this.cartItems = JSON.parse(savedCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    },
    
    // Navigate to products page
    goToProducts() {
      window.location.href = '/products/listing';
    }
  },
  mounted() {
    // Load cart from localStorage
    this.loadCart();
    
    // Listen for add to cart events
    this.$blueprint.events.on('cart.add', this.handleCartAdd);
    
    // Close cart when clicking outside
    document.addEventListener('click', (event) => {
      const dropdown = this.$el;
      if (!dropdown.contains(event.target) && this.isOpen) {
        this.closeCart();
      }
    });
  },
  beforeDestroy() {
    // Clean up event listeners
    this.$blueprint.events.off('cart.add', this.handleCartAdd);
  }
}
</script>
```

## Next Steps

Congratulations! You've built the core components of an e-commerce storefront with AssembleJS. You've seen how AssembleJS enables:

1. **Multi-framework components**: Using Preact, HTML, and Vue in the same application
2. **Server-side data fetching**: With the Factory system
3. **Component communication**: Through the event system
4. **Responsive UI**: With mobile-friendly components

To complete the storefront, you could add:

1. **Product listing page** with filtering and sorting
2. **Product detail page** with more information
3. **Checkout process** with forms and validation
4. **User authentication** for personalized experiences
5. **API controllers** for handling backend functionality

For more detailed examples, check out the complete [StoreFront project in the testbed](https://github.com/zjayers/assemblejs/tree/next/testbed/assemblejs-storefront) directory.

## Learn More

- [API Reference](/docs/api/global) - Learn about AssembleJS APIs
- [UI Framework Integration](/docs/frameworks/react) - Working with React, Vue, and other frameworks
- [Advanced Topics](/docs/advanced/islands-architecture) - Dive deeper into AssembleJS architecture