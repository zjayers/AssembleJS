# AssembleJS Storefront Tutorial

Welcome to the AssembleJS Storefront Tutorial! This guide will walk you through creating a modern e-commerce application using AssembleJS, demonstrating the framework's powerful features and patterns.

## Introduction

In this tutorial, we'll build a complete storefront application with product listings, search functionality, shopping cart, and checkout process. By following along, you'll learn how to:

- Create and organize blueprints (pages) and components
- Implement server-side controllers for data handling
- Use factories for data transformation
- Create services for shared functionality
- Implement client-side interactivity with the event system
- Style components with SCSS
- Connect components using the event bus

## Prerequisites

- Node.js (LTS version recommended)
- Basic knowledge of TypeScript, HTML, and CSS
- Familiarity with web development concepts

## Project Overview

Our storefront application will include:

1. **Home Page**: Featured products, categories, and promotional banners
2. **Product Listing**: Grid display of products with filtering and sorting
3. **Product Details**: Detailed product information, images, and add-to-cart functionality
4. **Shopping Cart**: Cart management with quantity adjustments and totals
5. **Checkout**: Multi-step checkout process

Let's get started building our AssembleJS storefront!

## Step 1: Creating a New Project

We'll begin by creating a new AssembleJS project using the CLI tool.

```bash
npx asmgen
```

When prompted, select "Project" from the list and enter "assemblejs-storefront" as the project name.

After the project creation completes, you'll have a basic project structure with the following files:

```
assemblejs-storefront/
├── node_modules/
├── src/
│   └── server.ts        # Main server entry point
├── package.json         # Project dependencies and scripts
├── README.md            # Project documentation
└── tsconfig.json        # TypeScript configuration
```

### Understanding the Project Structure

The generated project provides a starting point for our storefront application. Let's examine the key files:

#### 1. server.ts

This is the main entry point for our AssembleJS application. It creates a server instance and configures our components, blueprints, controllers, and services.

```typescript
import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';
import { createBlueprintServer } from "asmbl";

void createBlueprintServer({
  // Server root URL (using import.meta.url for ESM compatibility)
  serverRoot: import.meta.url,
  
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  // Application manifest - register all your components here
  manifest: {
    // Components are registered here
    components: [],
    
    // Controllers are registered here
    // controllers: [],
    
    // Services are registered here
    // services: []
  }
});
```

As we build our application, we'll register our components, blueprints, controllers, and services in this file.

#### 2. package.json

The package.json file contains our project dependencies and scripts for development, building, and testing.

Key scripts:
- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm start`: Run the production build
- `npm run asm`: Generate new components, blueprints, etc.

## Step 2: Creating the Home Page Blueprint

Next, we'll create our first blueprint for the home page. Blueprints in AssembleJS are similar to pages in other frameworks and serve as the container for multiple components.

Let's use the generator command to create a home page blueprint with Preact as our UI framework:

```bash
npx asmgen
```

When prompted:
1. Select "Blueprint"
2. Set the blueprint name to "home"
3. Set the view name to "welcome"
4. Choose "preact" as the UI framework

This will generate three files for our home page blueprint:

```
assemblejs-storefront/
└── src/
    └── blueprints/
        └── home/
            └── welcome/
                ├── welcome.client.ts    # Client-side behavior
                ├── welcome.styles.scss  # Component styling
                └── welcome.view.tsx     # Component template (Preact)
```

Let's examine what each file does:

### 1. The View File (welcome.view.tsx)

The view file contains the Preact component that defines the structure and appearance of our page:

```tsx
export function Welcome(context: PreactViewContext) {
  // Error handling with Error Boundary pattern
  const [hasError, setHasError] = preact.useState(false);
  const [errorDetails, setErrorDetails] = preact.useState<string | null>(null);
  
  // Component implementation
  return (
    <div className="home-welcome" role="region" aria-label="Welcome section">
      <h2 id="welcome-title">Home - Welcome</h2>
      <p aria-labelledby="welcome-title">is ready to rock!</p>

      {/* Include stylesheet and client script */}
      <link href="welcome.styles.scss" rel="stylesheet" />
      <script src="welcome.client.ts"></script>
    </div>
  );
}
```

### 2. The Client File (welcome.client.ts)

The client file handles the client-side behavior of our component:

```typescript
import { preact, Blueprint, BlueprintClient, events } from "asmbl";
import { Welcome } from './welcome.view';

export class WelcomeClient extends Blueprint {
  // Initialize the component when mounted
  protected override async onMount(): Promise<void> {
    try {
      super.onMount();
      this.mounted = true;
      
      // Detect device type and set up responsive handling
      this.detectDeviceType();
      this.setupResponsiveHandling();
      
      // Bootstrap Preact component
      preact.bootstrap(Welcome, this.context);
      
      // Notify completion
      events.emit('home.welcome.ready', { 
        componentId: this.context.id 
      });
    } catch (error) {
      this.handleError(error);
    }
  }
  
  // Client-side methods to handle device detection, responsiveness, and errors
  // ...
}

// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(WelcomeClient);
```

### 3. The Styles File (welcome.styles.scss)

The styles file contains the SCSS styling for our component:

```scss
// Base variables
$primary-color: #d0663d;
$text-color: #333;
$error-color: #d32f2f;
$background-color: #ffffff;
$border-radius: 4px;
$transition-speed: 0.3s;

// Base component styles
.home-welcome {
  border: 2px dashed $primary-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: $text-color;
  position: relative;
  transition: all $transition-speed ease;
  max-width: 100%;
  overflow-x: hidden;
  
  // Responsive styling
  // ...
}
```

The generator has also automatically registered our blueprint in the server.ts file:

```typescript
manifest: {
  components: [
    {
      path: 'home',
      views: [{
        exposeAsBlueprint: true,
        viewName: 'welcome',
        templateFile: 'welcome.view.tsx',
      }],
    },
  ],
  // ...
}
```

With this setup, we now have a basic home page blueprint. Let's enhance it by creating some components for our storefront application.

## Step 3: Creating Product Card Component

Now, let's create a reusable product card component that we'll use to display products in our storefront. We'll use Preact for this component as well:

```bash
npx asmgen
```

When prompted:
1. Select "Component"
2. Set the component name to "product"
3. Set the view name to "card"
4. Choose "preact" as the UI framework
5. Select "Yes" when asked if you want to add it to a blueprint
6. Select "home" blueprint when prompted

This will generate the following component files:

```
assemblejs-storefront/
└── src/
    └── components/
        └── product/
            └── card/
                ├── card.client.ts    # Client-side behavior
                ├── card.styles.scss  # Component styling
                └── card.view.tsx     # Component template (Preact)
```

Let's examine these files:

### 1. The View File (card.view.tsx)

The product card view file defines the component's appearance:

```tsx
export function Card(context: PreactViewContext) {
  // Error handling with Error Boundary pattern
  const [hasError, setHasError] = preact.useState(false);
  const [errorDetails, setErrorDetails] = preact.useState<string | null>(null);
  
  // Error handling and other component logic...

  return (
    <div className="product-card" role="region" aria-label="Card section">
      <h2 id="card-title">Product - Card</h2>
      <p aria-labelledby="card-title">is ready to go!</p>

      {/* Include stylesheet and client script */}
      <link href="card.styles.scss" rel="stylesheet" />
      <script src="card.client.ts"></script>
    </div>
  );
}
```

### 2. The Client File (card.client.ts)

The client file handles client-side behavior and interactions:

```typescript
import { preact, Blueprint, BlueprintClient, events } from "asmbl";
import { Card } from './card.view';

export class CardClient extends Blueprint {
  // Track component state
  private mounted = false;
  private resizeObserver?: ResizeObserver;
  private errorHandled = false;
  
  // Track device/viewport information
  private isMobileDevice = false;
  private viewportWidth = 0;
  
  protected override async onMount(): Promise<void> {
    try {
      super.onMount();
      this.mounted = true;
      
      // Detect device type
      this.detectDeviceType();
      
      // Set up responsive handling
      this.setupResponsiveHandling();
      
      // Initialize error handling
      this.setupErrorHandling();
      
      // Bootstrap Preact component
      preact.bootstrap(Card, this.context);
      
      // Notify completion
      events.emit('product.card.ready', { 
        componentId: this.context.id 
      });
    } catch (error) {
      this.handleError(error);
    }
  }
  
  // Additional methods for device detection, responsive handling, and error management...
}

// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(CardClient);
```

### 3. The Styles File (card.styles.scss)

The styles file contains SCSS for styling our product card:

```scss
// Base variables
$primary-color: #0095c5;
$text-color: #333;
$error-color: #d32f2f;
$background-color: #ffffff;
$border-radius: 4px;
$transition-speed: 0.3s;

// Base component styles (mobile-first approach)
.product-card {
  border: 2px dashed $primary-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: $text-color;
  position: relative;
  transition: all $transition-speed ease;
  max-width: 100%;
  overflow-x: hidden;
  
  // Additional responsive and accessibility styles...
}
```

The AssembleJS generator has also automatically updated our server.ts file to register the product card component:

```typescript
// Application manifest - register all your components here
manifest: {
  components: [
    {
      path: "product",
      views: [{
        viewName: "card",
        template: ProductCard
      }]
    },
    {
      path: 'home',
      views: [{
        exposeAsBlueprint: true,
        viewName: 'welcome',
        templateFile: 'welcome.view.tsx',
      }],
    },
  ],
  // ...
}
```

### Developing Components in Isolation

AssembleJS makes it easy to develop and test components in isolation. To view the product card component by itself during development, simply start the development server with:

```bash
npm run dev
```

Then access the component directly at:

```
http://localhost:3000/product/card
```

This allows you to focus on styling and functionality of a single component without having to navigate through the entire application.

Now we need to add this product card component to our home page blueprint.

## Step 4: Customizing the Product Card

Let's customize our product card component to display actual product information. We'll make the following changes:

1. Update the product card view to display product information
2. Add styles to make it look like a typical e-commerce product card
3. Add an "Add to Cart" button with client-side functionality

First, we modify our product card view file to display product details and add functionality:

```tsx
export function Card(context: PreactViewContext) {
  // Add to cart state management
  const [adding, setAdding] = preact.useState(false);
  const [addedToCart, setAddedToCart] = preact.useState(false);
  
  // Example product data (will be replaced with real data from a factory later)
  const product = context.data.product || {
    id: "p1",
    title: "Stylish T-Shirt",
    price: 29.99,
    imageUrl: "https://via.placeholder.com/300x300",
    rating: 4.5,
    reviewCount: 128,
    description: "A comfortable, stylish t-shirt perfect for any occasion.",
    inStock: true
  };
  
  // Handle adding to cart
  const handleAddToCart = () => {
    try {
      setAdding(true);
      
      // Simulate API call or processing
      setTimeout(() => {
        setAdding(false);
        setAddedToCart(true);
        
        // Emit event for cart component to listen to
        context.events.emit('cart.add', { 
          productId: product.id,
          quantity: 1
        });
        
        // Reset "Added" message after a delay
        setTimeout(() => {
          setAddedToCart(false);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAdding(false);
      setHasError(true);
      setErrorDetails(error instanceof Error ? error.message : "Unknown error");
    }
  };
  
  // Add rating stars component to display product rating
  const RatingStars = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="rating" aria-label={`${rating} out of 5 stars`}>
        {/* Star rendering logic */}
        <span className="review-count">({product.reviewCount})</span>
      </div>
    );
  };

  return (
    <div className="product-card" role="region" aria-label={`Product: ${product.title}`}>
      <div className="product-image">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          loading="lazy" 
        />
        {!product.inStock && (
          <div className="out-of-stock-overlay" aria-label="Out of stock">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="product-details">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-rating">
          <RatingStars rating={product.rating} />
        </div>
        <p className="product-price" aria-label={`Price: $${product.price}`}>
          ${product.price.toFixed(2)}
        </p>
        <p className="product-description">{product.description}</p>
      </div>
      
      <div className="product-actions">
        <button 
          className={`add-to-cart-button ${adding ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={adding || !product.inStock}
          aria-busy={adding}
          aria-label={product.inStock ? "Add to cart" : "Out of stock"}
        >
          {adding ? (
            <span className="loading-text">Adding...</span>
          ) : addedToCart ? (
            <span className="added-text">✓ Added to Cart</span>
          ) : product.inStock ? (
            <span>Add to Cart</span>
          ) : (
            <span>Out of Stock</span>
          )}
        </button>
      </div>
    </div>
  );
}
```

Next, we update the SCSS styles for our product card to make it visually appealing:

```scss
.product-card {
  display: flex;
  flex-direction: column;
  background-color: $background-color;
  border-radius: $border-radius;
  box-shadow: $card-shadow;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  // Product image container
  .product-image {
    position: relative;
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
    
    // Out of stock overlay
    .out-of-stock-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.25rem;
      text-transform: uppercase;
    }
  }
  
  // Product details styling
  .product-details {
    padding: 1rem;
    flex-grow: 1;
    
    .product-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
    }
    
    .product-rating {
      margin-bottom: 0.75rem;
    }
    
    .product-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: $accent-color;
    }
    
    .product-description {
      font-size: 0.875rem;
      color: $light-text;
      line-height: 1.5;
    }
  }
  
  // Add to cart button styling
  .product-actions {
    padding: 0 1rem 1rem;
    
    .add-to-cart-button {
      width: 100%;
      background-color: $accent-color;
      color: white;
      padding: 0.75rem 1rem;
      font-weight: 600;
      border: none;
      border-radius: $border-radius;
      cursor: pointer;
      
      &.loading {
        cursor: wait;
      }
      
      &.added {
        background-color: $success-color;
      }
    }
  }
}
```

## Step 5: Enhancing the Home Page Blueprint

Now, let's enhance our home page blueprint to integrate the product card component and create a proper storefront layout:

First, we update the welcome view to include a hero banner, product grid, and categories section:

```tsx
export function Welcome(context: PreactViewContext) {
  // Example products data (will be replaced with real data from a factory later)
  const featuredProducts = [
    {
      id: "p1",
      title: "Classic Denim Jacket",
      price: 89.99,
      imageUrl: "https://via.placeholder.com/300x300",
      rating: 4.8,
      reviewCount: 156,
      description: "A timeless denim jacket that pairs with everything in your wardrobe.",
      inStock: true
    },
    // More product examples...
  ];

  return (
    <div className="home-welcome">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Welcome to Our Storefront</h1>
          <p>Discover the latest trends and best quality products.</p>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </div>
      
      {/* Featured Products Section */}
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
      
      {/* Categories Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          <div className="category-item">
            <div className="category-image">
              <img src="https://via.placeholder.com/200x200" alt="Clothing" />
            </div>
            <h3>Clothing</h3>
          </div>
          {/* More categories... */}
        </div>
      </section>
    </div>
  );
}
```

Then, we update the welcome styles to create a responsive layout:

```scss
// Base variables and mixins
$primary-color: #2563eb;
$accent-color: #f97316;
$background-color: #f9fafb;
$content-max-width: 1280px;

@mixin container {
  width: 100%;
  max-width: $content-max-width;
  margin: 0 auto;
  padding: 0 1rem;
}

// Base component styles
.home-welcome {
  display: flex;
  flex-direction: column;
  background-color: $background-color;
  
  // Hero Banner
  .hero-banner {
    background: linear-gradient(135deg, #4a6cf7 0%, #2563eb 100%);
    color: white;
    padding: 4rem 0;
    margin-bottom: 3rem;
    text-align: center;
    
    .hero-content {
      @include container;
      
      h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 1rem;
      }
      
      // Shop Now button styling
      .shop-now-btn {
        background-color: $accent-color;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
    }
  }
  
  // Featured Products Section
  .featured-products {
    @include container;
    margin-bottom: 4rem;
    
    h2 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-align: center;
      position: relative;
    }
    
    // Responsive product grid
    .product-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1.5rem;
      
      @media (min-width: 576px) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @media (min-width: 992px) {
        grid-template-columns: repeat(3, 1fr);
      }
      
      @media (min-width: 1200px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  }
  
  // Categories Section
  .categories-section {
    @include container;
    margin-bottom: 4rem;
    
    // Categories grid
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1.5rem;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}
```

## Step 6: Creating a Products Listing Blueprint

Now that we have our home page and product card component working, let's create a products listing page that will display all available products with filtering and sorting capabilities.

Let's generate a new blueprint for the products page:

```bash
npx asmgen
```

When prompted:
1. Select "Create a new blueprint"
2. Set the blueprint name to "products"
3. Set the view name to "listing"
4. Choose "preact" as the UI framework

This will generate three files for our products listing blueprint:

```
assemblejs-storefront/
└── src/
    └── blueprints/
        └── products/
            └── listing/
                ├── listing.client.ts    # Client-side behavior
                ├── listing.styles.scss  # Component styling
                └── listing.view.tsx     # Component template (Preact)
```

After modifying these files, we created a product listing page with:

1. A grid of product cards
2. Category filters on the sidebar
3. Price range filtering functionality
4. Sorting options (price, popularity, etc.)
5. Pagination controls

## Step 7: Creating a Navigation Component

To allow users to navigate between our different pages, we'll create a responsive navigation component using HTML as the template language. This will demonstrate AssembleJS's ability to work with different UI languages.

```bash
npx asmgen
```

When prompted:
1. Select "Create a new component"
2. Set the component name to "navigation"
3. Set the view name to "main"
4. Choose "html" as the UI framework
5. When asked if you want to add to a blueprint, select "Yes"
6. Select the "home" blueprint
7. When asked if you want to add to another blueprint, select "Yes"
8. Select the "products" blueprint

This will generate three files for our navigation component:

```
assemblejs-storefront/
└── src/
    └── components/
        └── navigation/
            └── main/
                ├── main.client.ts      # Client-side behavior
                ├── main.styles.scss    # Component styling
                ├── main.view.html      # HTML template
```

We've implemented a responsive navigation bar with:

1. A logo/brand section
2. Navigation links to different pages
3. Icons for search, cart, and user account
4. A mobile-friendly menu toggle
5. Dark mode support
6. Cart badge that updates when products are added

### The HTML Template (main.view.html)

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
        <li><a href="/about/main" class="nav-link">About</a></li>
      </ul>
    </nav>
    
    <!-- Navigation actions: search, cart, user -->
    <div class="nav-actions">
      <!-- Icons and cart badge -->
    </div>
    
    <!-- Mobile menu toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
  </div>
</header>
```

### The Client-Side Logic (main.client.ts)

The client file handles interactions and events:

```typescript
export class MainClient extends Blueprint {
  // Initialize the component when mounted
  protected override onMount(): void {
    super.onMount();
    
    // Initialize mobile menu toggle
    this.initMobileMenu();
    
    // Highlight the current page in navigation
    this.highlightCurrentPage();
    
    // Listen for cart update events
    events.on('cart.add', this.updateCartCount.bind(this));
  }
  
  // More methods for handling mobile menu, 
  // highlighting current page, and updating cart count
}
```

### Benefits of this Approach

This demonstrates several powerful features of AssembleJS:

1. **Multi-framework support**: Using HTML for the navigation while using Preact for other components
2. **Component composition**: Adding the navigation to multiple blueprints
3. **Event-based communication**: Using events to update the cart badge
4. **Responsive design**: Mobile-first approach with viewport adaptations
5. **Accessibility**: Proper ARIA attributes and keyboard navigation

## Step 8: Creating the Footer Component with EJS

Our next step was to create a comprehensive footer component using EJS (Embedded JavaScript Templates). 

```bash
npx asmgen
```

When prompted:
1. Select "Create a new component"
2. Set the component name to "footer"
3. Set the view name to "main"
4. Choose "ejs" as the UI framework
5. When asked if you want to add to a blueprint, select "Yes" for all blueprints

We implemented a full-featured footer that includes:
1. Company information
2. Quick links to important pages
3. Customer service links
4. Newsletter subscription form
5. Social media links
6. Payment method icons
7. Copyright information

The EJS template allowed us to use dynamic content and conditional rendering, while maintaining a clean, semantic HTML structure.

## Step 9: Creating an About Page with Markdown

To showcase AssembleJS's support for content-heavy pages, we created an About page blueprint using Markdown as the template language.

```bash
npx asmgen
```

When prompted:
1. Select "Create a new blueprint"
2. Set the blueprint name to "about"
3. Set the view name to "main"
4. Choose "md" (Markdown) as the UI framework

This generated the following files:

```
assemblejs-storefront/
└── src/
    └── blueprints/
        └── about/
            └── main/
                ├── main.client.ts    # Client-side behavior
                ├── main.styles.scss  # Component styling
                └── main.view.md      # Markdown template
```

### The Markdown Template (main.view.md)

We created a comprehensive About page with multiple sections, mixing Markdown with HTML for more complex layouts:

```markdown
<div class="about-main">

# About AssembleJS Store

## Our Story

Founded in 2023, AssembleJS Store began with a simple mission: to provide high-quality products while showcasing the power of modern web development. What started as a small proof-of-concept has grown into a full-fledged e-commerce platform built entirely with the AssembleJS framework.

## Our Mission

We believe that shopping online should be:

- **Simple** - Easy to navigate and find what you need
- **Secure** - Your data is always protected
- **Sustainable** - We minimize our environmental impact

## Why Choose Us?

<div class="benefits-grid">
  <div class="benefit-card">
    <h3>Quality Assurance</h3>
    <p>Every product in our catalog undergoes rigorous quality testing before being offered to our customers.</p>
  </div>
  
  <div class="benefit-card">
    <h3>Fast Shipping</h3>
    <p>We partner with reliable logistics companies to ensure your orders arrive promptly and in perfect condition.</p>
  </div>
  
  <div class="benefit-card">
    <h3>Easy Returns</h3>
    <p>Not satisfied? Our hassle-free 30-day return policy has you covered.</p>
  </div>
</div>

## Our Team

Meet the passionate individuals who make AssembleJS Store possible:

| Name | Position | Experience |
|------|----------|------------|
| Jane Doe | CEO & Founder | 15+ years in e-commerce |
| John Smith | CTO | Former tech lead at Major Corp |
| Emily Johnson | Head of Customer Relations | Expert in customer satisfaction |
| Michael Brown | Lead Developer | AssembleJS contributor |

<!-- More sections... -->

<link href="main.styles.scss" rel="stylesheet"/>
<script src="main.client.ts"></script>
</div>
```

### The Styling (main.styles.scss)

We created comprehensive styles for the About page, handling various Markdown elements and custom HTML components:

```scss
.about-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #333;
  line-height: 1.6;

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 1rem;
  }

  h2 {
    font-size: 1.8rem;
    color: #3498db;
    margin: 2rem 0 1rem;
  }

  // Styling for benefits grid
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .benefit-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
  }

  // Table styling
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .clickable-row {
      cursor: pointer;
      
      &:hover {
        background-color: #e9f5fd;
      }
    }
  }

  // Responsive design
  @media (max-width: 768px) {
    padding: 1.5rem;
    
    h1 {
      font-size: 2rem;
    }
    
    .benefits-grid {
      grid-template-columns: 1fr;
    }
  }
}
```

### Client-Side Behavior (main.client.ts)

We added interactive features to the About page:

```typescript
import { Blueprint, BlueprintClient, events } from "asmbl";

interface TeamMember {
  name: string;
  position: string;
  experience: string;
  bio?: string;
}

export class MainClient extends Blueprint {
  private teamMembers: TeamMember[] = [
    {
      name: "Jane Doe",
      position: "CEO & Founder",
      experience: "15+ years in e-commerce",
      bio: "Jane founded AssembleJS Store with a vision to create an e-commerce platform that demonstrates modern web development practices."
    },
    // More team members...
  ];

  protected override onMount(): void {
    super.onMount();
    this.initBenefitCards();
    this.attachTeamMemberListeners();
  }

  private initBenefitCards(): void {
    // Add animations to benefit cards on scroll
    // ...
  }

  private attachTeamMemberListeners(): void {
    // Make team member rows clickable to show their bio
    const teamRows = document.querySelectorAll('.about-main table tr:not(:first-child)');
    
    teamRows.forEach((row, index) => {
      row.addEventListener('click', () => {
        const member = this.teamMembers[index];
        if (member && member.bio) {
          events.emit('showTeamMemberBio', { 
            name: member.name,
            position: member.position,
            bio: member.bio
          });
        }
      });
      
      row.classList.add('clickable-row');
    });
  }
}

BlueprintClient.registerComponentCodeBehind(MainClient);
```

### Key Benefits of Using Markdown

Using Markdown for the About page demonstrates several strengths of AssembleJS:

1. **Content-first approach**: Perfect for content-heavy pages like About, Blog, or Documentation
2. **Simplified authoring**: Non-developers can easily edit content in Markdown
3. **HTML integration**: Ability to mix Markdown with HTML for custom layouts
4. **Styling flexibility**: Full access to SCSS styling while keeping content clean
5. **Interactive elements**: Can still add JavaScript interactivity to Markdown content

## Step 10: Creating a Product Details Page with React

Next, we created a comprehensive product details page using React (JSX). This blueprint will display detailed information about a specific product, including images, specifications, reviews, and a tabbed interface.

```bash
npx asmgen
```

When prompted:
1. Select "Create a new blueprint"
2. Set the blueprint name to "product"
3. Set the view name to "details"
4. Choose "react" as the UI framework

This generated the following files:

```
assemblejs-storefront/
└── src/
    └── blueprints/
        └── product/
            └── details/
                ├── details.client.ts    # Client-side behavior
                ├── details.styles.scss  # Component styling
                └── details.view.jsx     # React JSX template
```

### The React Component (details.view.jsx)

We implemented a feature-rich product details page with React:

```jsx
import React, { useState, useEffect } from 'react';
import { react, events } from 'asmbl';

export default function Details({ params, publicData, components, id }) {
  // Product state with sample data
  const [product, setProduct] = useState(publicData.product || {
    id: 'p1',
    name: 'Premium Ergonomic Office Chair',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    rating: 4.7,
    reviewCount: 128,
    stock: 24,
    sku: 'ECH-PRO-1001',
    description: 'Experience unparalleled comfort with our Premium Ergonomic Office Chair...',
    features: [
      'Adjustable lumbar support for optimal back health',
      'Breathable mesh back keeps you cool during long work sessions',
      // More features...
    ],
    specifications: {
      dimensions: '26"W x 26"D x 38-42"H',
      weight: '35 lbs',
      material: 'High-grade mesh, premium foam, steel frame',
      // More specifications...
    },
    images: [
      // Multiple product images...
    ],
    categories: ['Office Furniture', 'Ergonomic', 'Chairs'],
    relatedProducts: ['p2', 'p3', 'p4', 'p5'],
  });

  // UI state for various interactive elements
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  // Handler for adding to cart with communication to other components
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Emit event for cart component to listen to
      events.emit('cart.add', {
        productId: product.id,
        quantity: quantity,
        name: product.name,
        price: product.price,
        image: product.images[0].url
      });
      
      setIsAddingToCart(false);
      setAddedToCart(true);
      
      // Reset "Added" message after a delay
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }, 800);
  };

  // JSX for rendering the product details page
  return (
    <div className="product-details">
      <div className="breadcrumb">
        <a href="/">Home</a> / 
        <a href="/products/listing">Products</a> / 
        <span>{product.name}</span>
      </div>

      <div className="product-main">
        {/* Product Images with thumbnails and main image */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={product.images[selectedImage].url} 
              alt={product.images[selectedImage].alt} 
              loading="lazy"
            />
          </div>
          <div className="thumbnail-gallery">
            {/* Thumbnails with click handlers */}
          </div>
        </div>

        {/* Product Info section with pricing, ratings, etc. */}
        <div className="product-info">
          <h1>{product.name}</h1>
          
          {/* Product metadata including ratings, SKU, stock status */}
          <div className="product-meta">
            {/* Rating stars and count */}
            {/* SKU information */}
            {/* Stock status */}
          </div>
          
          {/* Price display with discount if applicable */}
          <div className="product-price">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                <span className="discount-badge">{product.discount}% OFF</span>
              </>
            )}
          </div>
          
          {/* Short description */}
          {/* Product categories */}
          
          {/* Quantity selector with increment/decrement buttons */}
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity:</label>
            <div className="quantity-input">
              <button className="quantity-btn decrement" onClick={decrementQuantity}>-</button>
              <input type="number" id="quantity" value={quantity} onChange={handleQuantityChange} />
              <button className="quantity-btn increment" onClick={incrementQuantity}>+</button>
            </div>
          </div>
          
          {/* Add to cart and wishlist buttons */}
          <div className="action-buttons">
            <button 
              className={`add-to-cart-btn ${isAddingToCart ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
            >
              {isAddingToCart ? "Adding to Cart..." : 
               addedToCart ? "✓ Added to Cart" : 
               product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button className="wishlist-btn" aria-label="Add to wishlist">♡</button>
          </div>
          
          {/* Shipping and returns information */}
        </div>
      </div>

      {/* Tabbed content for product details */}
      <div className="product-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button 
            className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviewCount})
          </button>
        </div>
        
        <div className="tabs-content">
          {/* Conditional rendering of different tabs */}
          {activeTab === 'description' && (
            <div className="tab-pane">
              <p>{product.description}</p>
            </div>
          )}
          
          {/* Features tab */}
          {/* Specifications tab */}
          {/* Reviews tab with ratings and user reviews */}
        </div>
      </div>

      {/* Related products carousel */}
      <div className="related-products">
        <h2>You May Also Like</h2>
        <div className="products-carousel">
          {/* Related product cards */}
        </div>
      </div>
    </div>
  );
}
```

### The Styling (details.styles.scss)

We implemented comprehensive styles for the product details page:

```scss
// Variables
$primary-color: #3498db;
$accent-color: #f39c12;
$text-color: #333;
$light-text: #666;
$border-color: #e0e0e0;
$success-color: #27ae60;
$error-color: #e74c3c;
$background-color: #fff;
$light-background: #f9f9f9;
$card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
$transition-duration: 0.3s;
$border-radius: 4px;

// Mixins for common patterns
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// Product Details Component
.product-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: $text-color;
  
  // Breadcrumb Navigation
  .breadcrumb {
    margin-bottom: 2rem;
    font-size: 0.875rem;
    color: $light-text;
    
    a {
      color: $light-text;
      text-decoration: none;
      
      &:hover {
        color: $primary-color;
        text-decoration: underline;
      }
    }
  }
  
  // Main Product Section with responsive grid
  .product-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
    
    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
    
    // Product Images with main image and thumbnails
    .product-images {
      // Styles for main image and thumbnails...
    }
    
    // Product Info section
    .product-info {
      // Styles for product title, price, metadata...
      
      // Add to cart button and other actions
      .action-buttons {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        
        .add-to-cart-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          background-color: $primary-color;
          color: white;
          font-weight: 600;
          border: none;
          border-radius: $border-radius;
          cursor: pointer;
          transition: background-color $transition-duration;
          
          &:hover {
            background-color: darken($primary-color, 10%);
          }
          
          &.loading {
            background-color: lighten($primary-color, 10%);
            cursor: wait;
          }
          
          &.added {
            background-color: $success-color;
          }
        }
      }
    }
  }
  
  // Product Tabs
  .product-tabs {
    margin-bottom: 3rem;
    border: 1px solid $border-color;
    border-radius: $border-radius;
    overflow: hidden;
    
    .tabs-header {
      display: flex;
      overflow-x: auto;
      background-color: #f9f9f9;
      
      .tab-btn {
        // Tab button styling...
      }
    }
    
    .tabs-content {
      // Tab content styling...
      
      // Reviews tab with rating summary
      .reviews-summary {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
        
        @media (min-width: 768px) {
          grid-template-columns: auto 1fr;
        }
        
        // Review statistics...
      }
    }
  }
  
  // Related Products
  .related-products {
    // Carousel of related products...
  }
}
```

### Client-Side Behavior (details.client.ts)

We enhanced the product details page with client-side functionality:

```typescript
import { Blueprint, BlueprintClient, events, react } from "asmbl";
import type { ComponentContext } from "asmbl";

// Type definitions for product data and cart items
interface ProductImage {
  url: string;
  alt: string;
  type: string;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  features: string[];
  specifications: Record<string, any>;
  images: ProductImage[];
  categories: string[];
  relatedProducts: string[];
}

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export class ProductDetails extends Blueprint<{}, {}> {
  private imageZoomed = false;
  private recentlyViewed: string[] = [];
  private isInViewport = false;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(context: ComponentContext) {
    super(context);
    
    // Initialize the component when ready
    this.onReady(() => {
      this.initializeComponent();
    });
  }

  private initializeComponent(): void {
    // Get component root
    const componentRoot = document.querySelector('.product-details');
    if (!componentRoot) return;

    // Initialize various features
    this.setupProductTracking();
    this.setupImageZoom();
    this.initializeTabs();
    this.setupRelatedProducts();
    this.updateRecentlyViewed();
    this.setupCartEventListeners();
    this.setupVisibilityTracking();
    this.setupResponsiveBehavior();
  }

  // Implementation of zoom functionality on product images
  private setupImageZoom(): void {
    const mainImage = document.querySelector('.main-image img');
    if (!mainImage) return;
    
    // Implement image zoom on hover
    mainImage.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return; // Don't zoom on mobile
      
      const { left, top, width, height } = (mainImage as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      (mainImage as HTMLElement).style.transformOrigin = `${x * 100}% ${y * 100}%`;
      
      if (!this.imageZoomed) {
        (mainImage as HTMLElement).style.transform = 'scale(1.5)';
        this.imageZoomed = true;
      }
    });
    
    mainImage.addEventListener('mouseleave', () => {
      (mainImage as HTMLElement).style.transform = 'scale(1)';
      this.imageZoomed = false;
    });
  }

  // Track recently viewed products in local storage
  private updateRecentlyViewed(): void {
    const productId = this.context.params?.productId || 'p1';
    
    try {
      const storedRecentlyViewed = localStorage.getItem('recentlyViewedProducts');
      this.recentlyViewed = storedRecentlyViewed ? JSON.parse(storedRecentlyViewed) : [];
      
      if (!this.recentlyViewed.includes(productId)) {
        this.recentlyViewed.unshift(productId);
        this.recentlyViewed = this.recentlyViewed.slice(0, 5);
        localStorage.setItem('recentlyViewedProducts', JSON.stringify(this.recentlyViewed));
      }
    } catch (error) {
      console.error('Error updating recently viewed products:', error);
    }
  }

  // Additional methods for analytics, responsive behavior, etc.

  protected override onDestroy(): void {
    // Clean up observers when component is destroyed
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(ProductDetails);
```

### Key Benefits of Using React for Product Details

Using React for the product details page showcases several advantages of AssembleJS's multi-framework support:

1. **Component-based architecture**: React's component model works perfectly with AssembleJS
2. **State management**: React's useState hook for managing UI state
3. **Conditional rendering**: Easily switch between different content based on state
4. **Event handling**: Clean integration of React events with AssembleJS events
5. **Performance optimization**: React's virtual DOM for efficient updates
6. **Developer experience**: Familiar JSX syntax for React developers

Our implementation demonstrates how AssembleJS seamlessly integrates with React, allowing developers to leverage React's powerful features while still benefiting from AssembleJS's component system and event bus.

## Step 11: Creating a Cart Dropdown Component with Vue

Next, we created a cart dropdown component using Vue to handle the shopping cart functionality. The component will be displayed in the navigation bar and will show a dropdown with cart contents when clicked.

```bash
npx asmgen
```

When prompted:
1. Select "Create a new component"
2. Set the component name to "cart"
3. Set the view name to "dropdown"
4. Choose "vue" as the UI framework
5. When asked if you want to add to a blueprint, select "Yes" for all blueprints

This generated the following files:

```
assemblejs-storefront/
└── src/
    └── components/
        └── cart/
            └── dropdown/
                ├── dropdown.client.ts    # Client-side behavior
                ├── dropdown.styles.scss  # Component styling
                └── dropdown.view.vue     # Vue template
```

### The Vue Component (dropdown.view.vue)

We implemented a comprehensive cart dropdown with Vue:

```vue
<template>
  <div class="cart-dropdown" :class="{ 'is-open': isOpen }">
    <!-- Cart Icon and Toggle Button -->
    <div class="cart-toggle" @click="toggleCart" ref="cartToggle">
      <div class="cart-icon">
        <i class="icon-cart">🛒</i>
        <span v-if="cartItems.length > 0" class="cart-count">{{ totalItems }}</span>
      </div>
    </div>

    <!-- Cart Dropdown Content -->
    <div class="cart-content" v-if="isOpen" ref="cartContent">
      <div class="cart-header">
        <h3>Your Cart ({{ totalItems }})</h3>
        <button class="close-btn" @click="closeCart">×</button>
      </div>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Your cart is empty</p>
        <button class="shop-now-btn" @click="goToProducts">Shop Now</button>
      </div>
      
      <div v-else class="cart-items">
        <transition-group name="fade-slide" tag="ul" class="cart-items-list">
          <li v-for="item in cartItems" :key="item.productId" class="cart-item">
            <div class="item-image">
              <img :src="item.image" :alt="item.name" loading="lazy">
            </div>
            <div class="item-details">
              <h4 class="item-name">{{ item.name }}</h4>
              <div class="item-price">${{ item.price.toFixed(2) }}</div>
              <div class="item-quantity">
                <button class="quantity-btn" @click="decrementQuantity(item)" :disabled="item.quantity <= 1">-</button>
                <span class="quantity-value">{{ item.quantity }}</span>
                <button class="quantity-btn" @click="incrementQuantity(item)">+</button>
              </div>
            </div>
            <button class="remove-item-btn" @click="removeItem(item)">×</button>
          </li>
        </transition-group>

        <div class="cart-subtotal">
          <span>Subtotal:</span>
          <span class="subtotal-price">${{ subtotal.toFixed(2) }}</span>
        </div>

        <div class="cart-actions">
          <button class="view-cart-btn" @click="viewCart">View Cart</button>
          <button class="checkout-btn" @click="checkout">Checkout</button>
        </div>
      </div>
    </div>
    
    <!-- Backdrop when cart is open -->
    <div v-if="isOpen" class="cart-backdrop" @click="closeCart"></div>
  </div>
</template>

<script>
import { vue, events } from 'asmbl';

export default {
  name: 'CartDropdown',
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    publicData: {
      type: Object,
      default: () => ({})
    },
    components: {
      type: Object,
      default: () => ({})
    },
    id: String
  },
  data() {
    return {
      isOpen: false,
      cartItems: [],
      freeShippingThreshold: 50,
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    subtotal() {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    freeShippingMessage() {
      const remaining = this.freeShippingThreshold - this.subtotal;
      return remaining > 0 
        ? `Add $${remaining.toFixed(2)} more for free shipping!`
        : 'You qualify for free shipping!';
    }
  },
  methods: {
    toggleCart() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        // Add event listener to close cart when clicking outside
        this.$nextTick(() => {
          document.addEventListener('click', this.handleOutsideClick);
        });
      } else {
        document.removeEventListener('click', this.handleOutsideClick);
      }
    },
    closeCart() {
      this.isOpen = false;
      document.removeEventListener('click', this.handleOutsideClick);
    },
    handleOutsideClick(event) {
      if (this.$refs.cartContent && !this.$refs.cartContent.contains(event.target) && 
          this.$refs.cartToggle && !this.$refs.cartToggle.contains(event.target)) {
        this.closeCart();
      }
    },
    incrementQuantity(item) {
      item.quantity += 1;
      this.updateCartInStorage();
      events.emit('cart.update', { 
        cartItems: this.cartItems,
        action: 'increment',
        productId: item.productId
      });
    },
    decrementQuantity(item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        this.updateCartInStorage();
        events.emit('cart.update', { 
          cartItems: this.cartItems,
          action: 'decrement',
          productId: item.productId
        });
      }
    },
    removeItem(item) {
      const index = this.cartItems.findIndex(i => i.productId === item.productId);
      if (index !== -1) {
        // Use Vue's array mutation methods for reactivity
        this.cartItems.splice(index, 1);
        this.updateCartInStorage();
        events.emit('cart.update', { 
          cartItems: this.cartItems,
          action: 'remove',
          productId: item.productId
        });
      }
    },
    updateCartInStorage() {
      try {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
      } catch (error) {
        console.error('Error updating cart in storage:', error);
      }
    },
    handleCartAdd(cartItem) {
      // Check if item already exists in cart
      const existingItem = this.cartItems.find(item => item.productId === cartItem.productId);
      
      if (existingItem) {
        // Update quantity if item already exists
        existingItem.quantity += cartItem.quantity;
      } else {
        // Add new item to cart
        this.cartItems.push({ ...cartItem });
      }
      
      // Update storage and show cart
      this.updateCartInStorage();
      this.isOpen = true;
      
      // Show notification
      this.showNotification(`${cartItem.name} added to cart`);
    },
    loadCartFromStorage() {
      try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
          this.cartItems = JSON.parse(storedCart);
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    },
    showNotification(message) {
      events.emit('notification.show', {
        message,
        type: 'success',
        duration: 3000
      });
    },
    viewCart() {
      window.location.href = '/cart';
    },
    checkout() {
      window.location.href = '/checkout/form';
    },
    goToProducts() {
      window.location.href = '/products/listing';
    }
  },
  mounted() {
    // Load cart from storage
    this.loadCartFromStorage();
    
    // Listen for cart add events
    events.on('cart.add', this.handleCartAdd);
  },
  beforeDestroy() {
    // Clean up event listeners
    events.off('cart.add', this.handleCartAdd);
    document.removeEventListener('click', this.handleOutsideClick);
  }
}
</script>

<style scoped>
/* Vue-specific scoped styles */
.cart-dropdown {
  position: relative;
}

.cart-toggle {
  cursor: pointer;
}

.cart-icon i {
  font-size: 1.5rem;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f39c12;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s;
}

.fade-slide-enter, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

### The Styling (dropdown.styles.scss)

We created comprehensive styles for the cart dropdown:

```scss
// Variables
$primary-color: #3498db;
$accent-color: #f39c12;
$success-color: #27ae60;
$error-color: #e74c3c;
$text-color: #333;
$light-text: #666;
$border-color: #e0e0e0;
$background-color: #fff;
$shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
$transition-duration: 0.3s;
$border-radius: 4px;

// Cart Dropdown Component
.cart-dropdown {
  position: relative;
  display: inline-block;
  
  // Cart Toggle Button
  .cart-toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: $border-radius;
    transition: background-color $transition-duration;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  // Cart Icon
  .cart-icon {
    position: relative;
    font-size: 1.5rem;
    color: $text-color;
    
    i {
      display: block;
    }
  }
  
  // Cart Item Count Badge
  .cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: $accent-color;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
    
    // Animation for new items added to cart
    &.pulse {
      animation: pulse 0.5s ease-out;
    }
  }
  
  // Cart Dropdown Content
  .cart-content {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 320px;
    max-height: 500px;
    background-color: $background-color;
    border-radius: $border-radius;
    box-shadow: $shadow;
    overflow: hidden;
    z-index: 1000;
    animation: slideDown 0.3s ease forwards;
  }
  
  // Cart Header
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid $border-color;
    background-color: #f8f9fa;
    
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      color: $light-text;
      
      &:hover {
        color: $error-color;
      }
    }
  }
  
  // Empty Cart State
  .empty-cart {
    padding: 2rem;
    text-align: center;
    
    .empty-cart-icon {
      font-size: 3rem;
      color: $light-text;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    p {
      margin-bottom: 1.5rem;
      color: $light-text;
    }
    
    .shop-now-btn {
      background-color: $primary-color;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: $border-radius;
      font-weight: 600;
      cursor: pointer;
      transition: background-color $transition-duration;
      
      &:hover {
        background-color: darken($primary-color, 10%);
      }
    }
  }
  
  // Cart Items
  .cart-items {
    max-height: 350px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 10px;
    }
  }
  
  // Cart Items List
  .cart-items-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  // Individual Cart Item
  .cart-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid $border-color;
    transition: background-color $transition-duration;
    
    &:hover {
      background-color: #f9f9f9;
    }
    
    .item-image {
      width: 60px;
      height: 60px;
      border-radius: $border-radius;
      overflow: hidden;
      margin-right: 1rem;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .item-details {
      flex: 1;
      min-width: 0;
      
      .item-name {
        margin: 0 0 0.25rem;
        font-size: 0.875rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .item-price {
        color: $primary-color;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      .item-quantity {
        display: flex;
        align-items: center;
        
        .quantity-btn {
          width: 24px;
          height: 24px;
          border: 1px solid $border-color;
          background: none;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &:hover:not(:disabled) {
            background-color: #f0f0f0;
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
        
        .quantity-value {
          width: 30px;
          text-align: center;
          font-size: 0.875rem;
        }
      }
    }
    
    .remove-item-btn {
      background: none;
      border: none;
      color: $light-text;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.5rem;
      
      &:hover {
        color: $error-color;
      }
    }
  }
  
  // Cart Subtotal
  .cart-subtotal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    font-weight: 600;
    border-bottom: 1px solid $border-color;
    background-color: #f8f9fa;
    
    .subtotal-price {
      color: $primary-color;
    }
  }
  
  // Cart Actions
  .cart-actions {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    
    .view-cart-btn, .checkout-btn {
      flex: 1;
      padding: 0.75rem 0;
      border-radius: $border-radius;
      font-weight: 600;
      cursor: pointer;
      transition: all $transition-duration;
      text-align: center;
    }
    
    .view-cart-btn {
      background-color: transparent;
      border: 1px solid $primary-color;
      color: $primary-color;
      
      &:hover {
        background-color: rgba($primary-color, 0.1);
      }
    }
    
    .checkout-btn {
      background-color: $primary-color;
      border: 1px solid $primary-color;
      color: white;
      
      &:hover {
        background-color: darken($primary-color, 10%);
      }
    }
  }
  
  // Backdrop
  .cart-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease forwards;
  }
}

// Animations
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

// Mobile Adjustments
@media (max-width: 768px) {
  .cart-dropdown {
    .cart-content {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: 80vh;
      border-radius: $border-radius $border-radius 0 0;
      animation: slideUp 0.3s ease forwards;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
}
```

### Client-Side Behavior (dropdown.client.ts)

We added robust client-side functionality for the cart dropdown:

```typescript
import { Blueprint, BlueprintClient, events, vue } from "asmbl";
import type { ComponentContext } from "asmbl";

// Type definitions for cart items
interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface CartUpdateEvent {
  cartItems: CartItem[];
  action: 'add' | 'remove' | 'increment' | 'decrement' | 'clear';
  productId?: string;
}

export class CartDropdown extends Blueprint<{}, {}> {
  private cartItems: CartItem[] = [];
  private vueApp: any = null;
  private cartOpenState = false;
  private clickOutsideHandler: ((e: MouseEvent) => void) | null = null;
  private freeShippingThreshold = 50;
  
  constructor(context: ComponentContext) {
    super(context);
    
    // Initialize component when ready
    this.onReady(() => {
      this.initializeComponent();
    });
  }

  private initializeComponent(): void {
    // Load cart from storage
    this.loadCartFromStorage();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize Vue component
    this.mountVueComponent();
    
    // Set up analytics tracking
    this.setupAnalyticsTracking();
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // Reset to empty cart if there's an error
      this.cartItems = [];
    }
  }

  private setupEventListeners(): void {
    // Listen for cart add events
    events.on('cart.add', this.handleCartAdd.bind(this));
    
    // Listen for cart update events
    events.on('cart.update', this.handleCartUpdate.bind(this));
    
    // Listen for checkout events
    events.on('checkout.complete', this.handleCheckoutComplete.bind(this));
    
    // Listen for cart clear events
    events.on('cart.clear', this.handleCartClear.bind(this));
  }

  private handleCartAdd(cartItem: CartItem): void {
    // Check if item already exists in cart
    const existingItemIndex = this.cartItems.findIndex(item => item.productId === cartItem.productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      this.cartItems[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add new item to cart
      this.cartItems.push({ ...cartItem });
    }
    
    // Update storage
    this.updateCartInStorage();
    
    // Show cart dropdown
    this.setCartOpenState(true);
    
    // Animate cart count badge
    this.animateCartBadge();
    
    // Track add to cart event
    events.emit('analytics.track', {
      event: 'add_to_cart',
      product: cartItem,
      cartValue: this.calculateSubtotal()
    });
  }

  // Additional methods for cart management, analytics, etc.

  protected override onDestroy(): void {
    // Clean up event listeners
    events.off('cart.add', this.handleCartAdd);
    events.off('cart.update', this.handleCartUpdate);
    events.off('checkout.complete', this.handleCheckoutComplete);
    events.off('cart.clear', this.handleCartClear);
    
    // Clean up click outside handler
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
  }
}

// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(CartDropdown);
```

### Key Benefits of Using Vue for Cart Dropdown

Using Vue for the cart dropdown demonstrates several advantages of AssembleJS's multi-framework support:

1. **Reactive data binding**: Vue's reactive system automatically updates the UI when data changes
2. **Scoped styling**: Vue components can include scoped styles that only apply to that component
3. **Template syntax**: Vue's template syntax is clean and easy to read, with directives like v-for and v-if
4. **Transitions and animations**: Vue provides built-in transition elements for smooth animations
5. **Event handling**: Vue's event modifiers and easy event binding work well with AssembleJS events
6. **Computed properties**: Vue's computed properties simplify derived state like totals and quantities

This implementation showcases how AssembleJS can leverage different UI frameworks for different components based on their specific needs. The cart dropdown benefits greatly from Vue's reactive system for handling dynamic cart data and updates.

## Summary and Next Steps

In this tutorial, we've built a functional storefront application using AssembleJS that demonstrates all the key features of the framework. We've created:

1. A project structure using the AssembleJS CLI
2. A home page blueprint with a hero banner and featured products section (using Preact)
3. A reusable product card component with "Add to Cart" functionality
4. A comprehensive products listing page with filtering, sorting, and pagination
5. A responsive navigation component (using HTML templates)
6. Event-based communication between components

Our implementation showcases AssembleJS's key strengths:

1. **Multiple UI frameworks**: Using Preact for dynamic components and HTML for simpler ones
2. **Component composition**: Reusing the product card component across multiple pages
3. **Blueprint structure**: Organizing pages as blueprints that can include shared components
4. **Event system**: Using events for cross-component communication (cart updates)
5. **Responsive design**: Mobile-first approach with responsive layouts
6. **Accessibility**: Proper ARIA attributes, semantic HTML, and keyboard navigation

The resulting application has a clean architecture with:

- **Separation of concerns**: Each component has its own view, client-side behavior, and styling
- **Maintainable codebase**: Modular structure makes it easy to add or modify features
- **Scalable design**: Components can be added or removed without affecting others
- **Cross-framework compatibility**: Easy integration of different UI technologies

To continue developing this storefront application, you might want to:

1. Create a product details page for individual products
2. Implement a full shopping cart component
3. Add a checkout process with forms and validation
4. Implement user authentication
5. Create a product search controller
6. Add a product review component
7. Implement a backend with real product data using controllers and services

Each of these steps would follow the same pattern we've used so far: creating blueprints and components using the AssembleJS generator, customizing them for your needs, and connecting them together through the event system and component composition.

AssembleJS provides a powerful toolkit for building modern, component-based applications with excellent performance, accessibility, and developer experience.
