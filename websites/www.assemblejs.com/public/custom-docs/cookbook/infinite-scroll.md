# Infinite Scrolling

This guide demonstrates how to implement infinite scrolling in AssembleJS applications for an enhanced user experience when working with large datasets.

## Overview

Infinite scrolling allows users to continuously load content as they scroll down a page, eliminating the need for traditional pagination. This pattern is especially useful for content-heavy applications like social feeds, search results, and product listings.

## Prerequisites

- AssembleJS project set up
- Basic understanding of AssembleJS components and services
- Familiarity with the Intersection Observer API

## Implementation Steps

### 1. Create an Infinite Scroll Service

First, let's create a service to handle the infinite scrolling logic:

```bash
asm service InfiniteScroll
```

This will generate a basic service file. Now let's implement the service:

```typescript
// src/services/infinite-scroll.service.ts
import { Service } from '@assemblejs/core';

export interface InfiniteScrollOptions {
  threshold?: number;          // Visibility threshold (0-1)
  rootMargin?: string;         // Margin around the root
  fetchMoreItems: () => void;  // Callback to fetch more items
  loadingElement?: HTMLElement; // Element used as sentinel
  root?: HTMLElement;          // Scrolling container (default: viewport)
}

export class InfiniteScrollService extends Service {
  private observer: IntersectionObserver | null = null;
  private options: InfiniteScrollOptions;
  private isLoading = false;

  initialize(options: InfiniteScrollOptions) {
    this.options = {
      threshold: 0.5,
      rootMargin: '100px',
      ...options
    };
    
    this.setupObserver();
    return this;
  }

  private setupObserver() {
    // Clean up any existing observer
    if (this.observer) {
      this.disconnect();
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: this.options.root || null,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );

    if (this.options.loadingElement) {
      this.observe(this.options.loadingElement);
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.isLoading) {
        this.isLoading = true;
        
        // Call the fetch callback
        Promise.resolve(this.options.fetchMoreItems())
          .finally(() => {
            this.isLoading = false;
          });
      }
    });
  }

  observe(element: HTMLElement) {
    if (this.observer && element) {
      this.observer.observe(element);
    }
    return this;
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    return this;
  }

  updateOptions(options: Partial<InfiniteScrollOptions>) {
    this.options = {
      ...this.options,
      ...options
    };
    this.setupObserver();
    return this;
  }
}
```

### 2. Create an Infinite Scroll Product List Component

Let's create a product list component with infinite scrolling:

```bash
asm component product listing
```

Now let's implement the component:

#### View file:

```tsx
// components/product/listing/listing.view.tsx
import { h } from 'preact';
import { useRef, useEffect, useState } from 'preact/hooks';
import { ViewContext } from '@assemblejs/core';
import { InfiniteScrollService } from '../../../services/infinite-scroll.service';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

export default function ProductListing({ context }: { context: ViewContext }) {
  const [products, setProducts] = useState<Product[]>(context.initialProducts || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const infiniteScrollService = context.services.get(InfiniteScrollService);

  // Fetch more products
  const fetchMoreProducts = async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/products?page=${nextPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const newProducts = await response.json();
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error fetching more products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize infinite scroll
  useEffect(() => {
    if (loaderRef.current && infiniteScrollService) {
      infiniteScrollService.initialize({
        fetchMoreItems: fetchMoreProducts,
        loadingElement: loaderRef.current,
        rootMargin: '200px'
      });
    }

    return () => {
      infiniteScrollService?.disconnect();
    };
  }, [loaderRef.current, hasMore]);

  return (
    <div className="product-listing">
      <h2>Our Products</h2>
      
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="description">{product.description}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div ref={loaderRef} className="loading-indicator">
          {isLoading && <div className="spinner"></div>}
        </div>
      )}
      
      {!hasMore && products.length > 0 && (
        <div className="end-message">
          <p>No more products to load</p>
        </div>
      )}
    </div>
  );
}
```

#### Client file:

```typescript
// components/product/listing/listing.client.ts
import { getServices } from '@assemblejs/core';
import { InfiniteScrollService } from '../../../services/infinite-scroll.service';

export default function() {
  // Component is initialized by the view file
  console.log('Product listing client component initialized');
}
```

#### Styles:

```scss
// components/product/listing/listing.styles.scss
.product-listing {
  padding: 20px;
  
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .product-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    h3 {
      margin: 0 0 10px;
      font-size: 18px;
    }
    
    .price {
      font-weight: bold;
      color: #e63946;
      margin: 0 0 10px;
    }
    
    .description {
      font-size: 14px;
      color: #555;
      margin-bottom: 15px;
    }
    
    button {
      width: 100%;
      padding: 8px;
      background-color: #457b9d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: #1d3557;
      }
    }
  }
  
  .loading-indicator {
    text-align: center;
    padding: 20px;
    
    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #457b9d;
      animation: spin 1s ease-in-out infinite;
    }
  }
  
  .end-message {
    text-align: center;
    padding: 20px;
    color: #555;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
```

### 3. Create an API Controller for Products

Now, let's create a controller to handle product data:

```bash
asm controller Product
```

Implement the controller:

```typescript
// src/controllers/product.controller.ts
import { BlueprintController, http } from '@assemblejs/core';

// Mock product data
const products = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.round(Math.random() * 9995) / 100 + 5,
  image: `https://picsum.photos/seed/product${i + 1}/400/300`,
  description: `This is product ${i + 1}. It's a great product with many features.`
}));

export class ProductController extends BlueprintController {
  initialize() {
    this.registerRoutes();
  }

  private registerRoutes() {
    // Get paginated products
    this.server.route({
      method: 'GET',
      url: '/api/products',
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
          }
        }
      },
      handler: async (request, reply) => {
        const { page = 1, limit = 10 } = request.query as any;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        // Artificial delay to simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get products for the current page
        const paginatedProducts = products.slice(startIndex, endIndex);
        
        return reply.send(paginatedProducts);
      }
    });

    // Get a single product by ID
    this.server.route({
      method: 'GET',
      url: '/api/products/:id',
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer' }
          }
        }
      },
      handler: async (request, reply) => {
        const { id } = request.params as any;
        const product = products.find(p => p.id === parseInt(id));
        
        if (!product) {
          return reply.code(404).send({ 
            error: 'Product not found' 
          });
        }
        
        return reply.send(product);
      }
    });
  }
}
```

### 4. Register the Service and Component in Your Server

Update your server.ts file to register the new service and component:

```typescript
// src/server.ts
import { createBlueprintServer } from '@assemblejs/core';
import { ProductController } from './controllers/product.controller';
import { InfiniteScrollService } from './services/infinite-scroll.service';
import { vaviteHttpServer } from 'vavite/http-server';
import { viteDevServer } from 'vavite/vite-dev-server';

const server = createBlueprintServer({
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  // Register components
  components: [
    {
      name: 'product/listing',
      routes: ['/products']
    }
  ],
  
  // Register controllers
  controllers: [
    ProductController
  ],
  
  // Register services
  services: [
    InfiniteScrollService
  ]
});

// Start the server
server.start();
```

### 5. Create a Blueprint to Display the Products

```bash
asm blueprint products main
```

Implement the blueprint:

```tsx
// blueprints/products/main/main.view.tsx
import { h } from 'preact';
import { ViewContext } from '@assemblejs/core';

export default function ProductsPage({ context }: { context: ViewContext }) {
  return (
    <div className="products-page">
      <header>
        <h1>Product Catalog</h1>
        <p>Browse our extensive collection of products</p>
      </header>
      
      <main>
        {/* The product listing component with infinite scroll will be rendered here */}
        <div data-component="product/listing"></div>
      </main>
    </div>
  );
}
```

## Advanced Topics

### Skeleton Loading States

For a better user experience, implement skeleton loading states:

```tsx
// components/product/listing/listing.view.tsx (updated)
// Add a new skeleton component:

const SkeletonProduct = () => (
  <div className="product-card skeleton">
    <div className="image-skeleton"></div>
    <div className="title-skeleton"></div>
    <div className="price-skeleton"></div>
    <div className="description-skeleton"></div>
    <div className="button-skeleton"></div>
  </div>
);

// Then in your component return:
return (
  <div className="product-listing">
    <h2>Our Products</h2>
    
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          {/* Product card content */}
        </div>
      ))}
      
      {isLoading && Array.from({ length: 4 }).map((_, index) => (
        <SkeletonProduct key={`skeleton-${index}`} />
      ))}
    </div>
    
    {/* Rest of component */}
  </div>
);
```

Add the corresponding styles:

```scss
// Add to listing.styles.scss
.skeleton {
  .image-skeleton,
  .title-skeleton,
  .price-skeleton,
  .description-skeleton,
  .button-skeleton {
    background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4px;
  }
  
  .image-skeleton {
    height: 200px;
    margin-bottom: 10px;
  }
  
  .title-skeleton {
    height: 18px;
    width: 70%;
    margin-bottom: 10px;
  }
  
  .price-skeleton {
    height: 16px;
    width: 40%;
    margin-bottom: 10px;
  }
  
  .description-skeleton {
    height: 14px;
    width: 100%;
    margin-bottom: 15px;
  }
  
  .button-skeleton {
    height: 36px;
    width: 100%;
  }
}

@keyframes skeleton-loading {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Maintaining Scroll Position

When navigating back to a page with infinite scroll, maintaining the scroll position can be crucial:

```typescript
// Add to the infinite-scroll.service.ts
export class InfiniteScrollService extends Service {
  // Add to the existing service
  private scrollPosition = 0;
  private pageData: Map<string, any> = new Map();
  
  saveState(pageId: string, data: any) {
    this.scrollPosition = window.scrollY;
    this.pageData.set(pageId, {
      scrollPosition: this.scrollPosition,
      data
    });
    return this;
  }
  
  restoreState(pageId: string) {
    const savedState = this.pageData.get(pageId);
    if (savedState) {
      setTimeout(() => {
        window.scrollTo(0, savedState.scrollPosition);
      }, 0);
      return savedState.data;
    }
    return null;
  }
  
  hasState(pageId: string) {
    return this.pageData.has(pageId);
  }
  
  clearState(pageId?: string) {
    if (pageId) {
      this.pageData.delete(pageId);
    } else {
      this.pageData.clear();
    }
    return this;
  }
}
```

Then use this functionality in your component:

```tsx
// In listing.view.tsx
useEffect(() => {
  // Try to restore state when component mounts
  const pageId = 'products-listing';
  const savedData = infiniteScrollService.hasState(pageId) 
    ? infiniteScrollService.restoreState(pageId)
    : null;
    
  if (savedData) {
    setProducts(savedData.products);
    setPage(savedData.page);
    setHasMore(savedData.hasMore);
  } else {
    fetchMoreProducts(); // Initial load if no saved state
  }
  
  // Save state when component unmounts
  return () => {
    infiniteScrollService.saveState(pageId, {
      products,
      page,
      hasMore
    });
  };
}, []);
```

### Error Handling and Retry Logic

Implement robust error handling and retry logic:

```typescript
// Add to InfiniteScrollService
export class InfiniteScrollService extends Service {
  // Add these properties
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 2000;
  
  // Update handleIntersection method
  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.isLoading) {
        this.isLoading = true;
        
        // Call the fetch callback with retry logic
        Promise.resolve(this.options.fetchMoreItems())
          .catch(error => {
            console.error('Error in infinite scroll:', error);
            
            if (this.retryCount < this.maxRetries) {
              this.retryCount++;
              console.log(`Retrying (${this.retryCount}/${this.maxRetries}) after ${this.retryDelay}ms`);
              
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve(this.options.fetchMoreItems());
                }, this.retryDelay);
              });
            }
            
            // Notify application of failure after max retries
            if (this.options.onError) {
              this.options.onError(error);
            }
            
            throw error;
          })
          .finally(() => {
            this.isLoading = false;
            
            // Reset retry count on success
            if (this.retryCount > 0) {
              this.retryCount = 0;
            }
          });
      }
    });
  }
  
  // Add to InfiniteScrollOptions interface
  // onError?: (error: any) => void;
}
```

### Accessibility Considerations

Make your infinite scroll component accessible:

```tsx
// In listing.view.tsx
return (
  <div className="product-listing" aria-live="polite">
    <h2 id="product-heading">Our Products</h2>
    
    <div 
      className="product-grid" 
      role="feed" 
      aria-busy={isLoading}
      aria-labelledby="product-heading"
    >
      {products.map(product => (
        <article 
          key={product.id} 
          className="product-card"
          aria-label={product.name}
        >
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p className="price">${product.price.toFixed(2)}</p>
          <p className="description">{product.description}</p>
          <button aria-label={`Add ${product.name} to cart`}>
            Add to Cart
          </button>
        </article>
      ))}
    </div>
    
    {hasMore && (
      <div 
        ref={loaderRef} 
        className="loading-indicator"
        aria-live="assertive"
      >
        {isLoading ? (
          <div className="spinner" aria-label="Loading more products"></div>
        ) : (
          <div className="visually-hidden">Scroll to load more products</div>
        )}
      </div>
    )}
    
    {!hasMore && products.length > 0 && (
      <div className="end-message" aria-live="assertive">
        <p>End of product list. No more products to load.</p>
      </div>
    )}
  </div>
);
```

Add this to your styles:

```scss
// Add to your styles
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

## Conclusion

Implementing infinite scrolling in AssembleJS offers a seamless way to load large datasets while maintaining performance. This pattern enhances the user experience by eliminating traditional pagination and allowing continuous content consumption.

The implementation we've covered includes:

- A reusable InfiniteScrollService that leverages the Intersection Observer API
- Product listing component with infinite scrolling capability
- Server-side controller for data pagination
- Advanced features like skeleton loading, scroll position restoration, and error handling
- Accessibility considerations for users of assistive technologies

By following this pattern, you can implement infinite scrolling in various parts of your application, from product catalogs to social feeds, news articles, and more.

For more information on performance optimization in AssembleJS, refer to the [Performance Optimization](../performance-optimization) guide.