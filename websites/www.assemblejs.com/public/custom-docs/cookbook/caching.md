# Caching Strategies

<iframe src="https://placeholder-for-assemblejs-caching-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Caching is essential for performance optimization. This cookbook demonstrates how to implement effective caching strategies in AssembleJS applications, improving load times and reducing server load.

## Prerequisites

- Basic knowledge of AssembleJS components and services
- Understanding of HTTP request/response cycles
- Familiarity with browser storage mechanisms (localStorage, sessionStorage)

## Implementation Steps

### Step 1: Create a Cache Service

First, let's create a versatile caching service:

```bash
mkdir -p src/services
touch src/services/cache.service.ts
```

Implement the caching service:

```typescript
// src/services/cache.service.ts
import { Service } from 'asmbl';

interface CacheOptions {
  defaultTtl?: number;  // Time to live in milliseconds
  namespace?: string;   // For partitioning cache entries
}

interface CacheEntry<T> {
  value: T;
  expiry: number | null;  // Timestamp when entry expires
}

export class CacheService extends Service {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTtl: number;
  private namespace: string;
  
  constructor(options: CacheOptions = {}) {
    super();
    this.defaultTtl = options.defaultTtl || 5 * 60 * 1000; // 5 minutes default
    this.namespace = options.namespace || 'app-cache';
    
    // Load persisted cache from localStorage if in browser
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = ttl !== undefined
      ? Date.now() + ttl
      : (ttl === null ? null : Date.now() + this.defaultTtl);
    
    const cacheKey = this.getCacheKey(key);
    this.cache.set(cacheKey, { value, expiry });
    
    // Persist to localStorage if in browser
    if (typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }
    
    // Check if the entry has expired
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      this.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  /**
   * Get or compute a value
   */
  async getOrCompute<T>(
    key: string, 
    compute: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cachedValue = this.get<T>(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Compute the value
    const computedValue = await compute();
    
    // Store in cache
    this.set(key, computedValue, ttl);
    
    return computedValue;
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): boolean {
    const cacheKey = this.getCacheKey(key);
    const success = this.cache.delete(cacheKey);
    
    // Update localStorage if in browser
    if (success && typeof window !== 'undefined') {
      this.saveToStorage();
    }
    
    return success;
  }

  /**
   * Check if a key exists in the cache and is not expired
   */
  has(key: string): boolean {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return false;
    }
    
    // Check if the entry has expired
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    
    // Clear from localStorage if in browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.namespace);
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry !== null && entry.expiry < now) {
        this.cache.delete(key);
      }
    }
    
    // Update localStorage if in browser
    if (typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    this.clearExpired();
    return this.cache.size;
  }

  /**
   * Internal: Get namespaced cache key
   */
  private getCacheKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  /**
   * Internal: Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem(this.namespace, serialized);
    } catch (error) {
      console.error('Error saving cache to localStorage:', error);
    }
  }

  /**
   * Internal: Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const serialized = localStorage.getItem(this.namespace);
      
      if (serialized) {
        const entries = JSON.parse(serialized);
        this.cache = new Map(entries);
        this.clearExpired(); // Clear any expired entries on load
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
      this.cache = new Map();
    }
  }
}
```

### Step 2: Create a Factory That Uses Caching

Now, let's create a component factory that uses caching for data fetching:

```bash
mkdir -p src/components/products
touch src/components/products/products.factory.ts
```

Implement the factory with caching:

```typescript
// src/components/products/products.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { CacheService } from '../../services/cache.service';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

export class ProductsFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get cache service
    const cacheService = context.services.get('cacheService') as CacheService;
    
    // Get parameters from context
    const category = context.params.get('category') as string || 'all';
    const cacheKey = `products:${category}`;
    
    try {
      // Set initial loading state
      context.data.set('loading', true);
      context.data.set('error', null);
      
      // Get or compute products data
      const products = await cacheService.getOrCompute<Product[]>(
        cacheKey,
        () => this.fetchProducts(category),
        60000 // 1 minute cache
      );
      
      // Update context data
      context.data.set('products', products);
      context.data.set('loading', false);
      context.data.set('category', category);
      context.data.set('lastUpdated', new Date().toISOString());
    } catch (error) {
      console.error('Error fetching products:', error);
      context.data.set('error', 'Failed to load products');
      context.data.set('products', []);
      context.data.set('loading', false);
    }
  }
  
  private async fetchProducts(category: string): Promise<Product[]> {
    console.log(`Fetching products for category: ${category}`);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock products data
    const allProducts: Product[] = [
      {
        id: 1,
        name: 'Blue Shirt',
        price: 29.99,
        description: 'A comfortable blue shirt made from premium cotton',
        image: '/images/blue-shirt.jpg',
      },
      {
        id: 2,
        name: 'Black Jeans',
        price: 49.99,
        description: 'Classic black jeans with a modern fit',
        image: '/images/black-jeans.jpg',
      },
      {
        id: 3,
        name: 'Running Shoes',
        price: 79.99,
        description: 'Lightweight running shoes for maximum performance',
        image: '/images/running-shoes.jpg',
      },
      {
        id: 4,
        name: 'Winter Jacket',
        price: 129.99,
        description: 'Warm winter jacket for cold weather',
        image: '/images/winter-jacket.jpg',
      },
      {
        id: 5,
        name: 'Sunglasses',
        price: 59.99,
        description: 'Stylish sunglasses with UV protection',
        image: '/images/sunglasses.jpg',
      },
    ];
    
    // Filter by category
    if (category !== 'all') {
      // In a real app, you would have category information for each product
      // For this example, we'll just return a subset based on the category parameter
      return allProducts.slice(0, category === 'clothing' ? 2 : 3);
    }
    
    return allProducts;
  }
}
```

### Step 3: Create a Products Component

Let's create a React component that displays the products with cache information:

```bash
touch src/components/products/products.view.tsx
touch src/components/products/products.styles.scss
```

Implement the products view:

```tsx
// src/components/products/products.view.tsx
import React from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface ProductsProps {
  data: {
    products: Product[];
    loading: boolean;
    error: string | null;
    category: string;
    lastUpdated: string;
  };
}

const Products: React.FC<ProductsProps> = ({ data }) => {
  const { products, loading, error, category, lastUpdated } = data;
  
  if (loading) {
    return <div className="products-loading">Loading products...</div>;
  }
  
  if (error) {
    return <div className="products-error">{error}</div>;
  }
  
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString()
    : 'N/A';
  
  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Products {category !== 'all' ? `- ${category}` : ''}</h2>
        <div className="cache-info">
          <span className="cache-label">Last updated:</span>
          <span className="cache-time">{formattedTime}</span>
          <button className="refresh-button" id="refresh-button">
            Refresh
          </button>
        </div>
      </div>
      
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {/* For demo, use a placeholder */}
                <div className="image-placeholder">{product.name[0]}</div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <p className="product-description">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
```

Add styles for the products component:

```scss
// src/components/products/products.styles.scss
.products-container {
  margin: 20px;
  font-family: Arial, sans-serif;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    color: #333;
  }
}

.cache-info {
  font-size: 14px;
  color: #666;
  
  .cache-label {
    margin-right: 6px;
  }
  
  .cache-time {
    font-weight: bold;
  }
}

.refresh-button {
  margin-left: 15px;
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
}

.products-loading,
.products-error {
  padding: 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.products-error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.product-image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  
  .image-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #4a90e2;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: bold;
  }
}

.product-info {
  padding: 15px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
  }
  
  .product-price {
    font-weight: bold;
    color: #4a90e2;
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  .product-description {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  }
}
```

### Step 4: Create a Client-Side Component

Now, let's add client-side interactivity to handle cache refreshing:

```bash
touch src/components/products/products.client.ts
```

Implement the client code:

```typescript
// src/components/products/products.client.ts
import { Blueprint } from 'asmbl';
import { CacheService } from '../../services/cache.service';

export class ProductsClient extends Blueprint {
  private refreshButton: HTMLButtonElement | null = null;
  private cacheService: CacheService | null = null;
  private category: string = 'all';
  
  protected override onMount(): void {
    super.onMount();
    
    // Get DOM elements
    this.refreshButton = this.root.querySelector('#refresh-button') as HTMLButtonElement;
    
    // Get services
    this.cacheService = this.services.get('cacheService') as CacheService;
    
    // Get data from context
    this.category = this.context.get('category') || 'all';
    
    // Add event listeners
    this.refreshButton?.addEventListener('click', this.handleRefresh.bind(this));
  }
  
  private async handleRefresh(): Promise<void> {
    if (!this.refreshButton || !this.cacheService) {
      return;
    }
    
    // Update button state
    this.refreshButton.disabled = true;
    this.refreshButton.textContent = 'Refreshing...';
    
    try {
      // Clear the cache for this category
      const cacheKey = `products:${this.category}`;
      this.cacheService.delete(cacheKey);
      
      // Reload the page to force a refetch
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing cache:', error);
      
      // Reset button state
      this.refreshButton.disabled = false;
      this.refreshButton.textContent = 'Refresh';
    }
  }
}

export default ProductsClient;
```

### Step 5: Register the Cache Service and Component

Update your server.ts file to register everything:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { CacheService } from "./services/cache.service";
import { ProductsFactory } from "./components/products/products.factory";

// Create cache service with a default TTL of 5 minutes
const cacheService = new CacheService({
  defaultTtl: 5 * 60 * 1000,
  namespace: 'product-cache'
});

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'products',
        views: [{
          viewName: 'list',
          templateFile: 'products.view.tsx',
          factory: new ProductsFactory()
        }]
      }
    ],
    services: [
      {
        name: 'cacheService',
        service: cacheService
      }
    ]
  }
});
```

### Step 6: Create a Blueprint to Show Products

Create a blueprint to display the products component:

```bash
mkdir -p src/blueprints/products
mkdir -p src/blueprints/products/main
touch src/blueprints/products/main/main.view.tsx
touch src/blueprints/products/main/main.styles.scss
```

Implement the blueprint view:

```tsx
// src/blueprints/products/main/main.view.tsx
import React from 'react';

const ProductsPage: React.FC = () => {
  return (
    <div className="products-page">
      <header className="header">
        <h1>AssembleJS Caching Example</h1>
        <nav className="category-nav">
          <ul>
            <li><a href="/products">All Products</a></li>
            <li><a href="/products/clothing">Clothing</a></li>
            <li><a href="/products/accessories">Accessories</a></li>
          </ul>
        </nav>
      </header>
      
      <main className="main-content">
        <div className="products-wrapper" data-component="products/list"></div>
      </main>
      
      <footer className="footer">
        <p>AssembleJS Caching Example</p>
        <p className="small">Products are cached for 1 minute. Click "Refresh" to clear the cache.</p>
      </footer>
    </div>
  );
};

export default ProductsPage;
```

Add styles for the blueprint:

```scss
// src/blueprints/products/main/main.styles.scss
.products-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.header {
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    margin-bottom: 15px;
  }
}

.category-nav {
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    li {
      margin: 0;
      
      a {
        display: block;
        padding: 10px 20px;
        color: #333;
        text-decoration: none;
        
        &:hover,
        &.active {
          background-color: #e9ecef;
        }
      }
    }
  }
}

.main-content {
  min-height: 500px;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #666;
  text-align: center;
  
  .small {
    font-size: 12px;
    color: #999;
  }
}
```

### Step 7: Update server.ts to Add Blueprint Routes

Update server.ts to add the blueprint routes:

```typescript
// src/server.ts
// ... existing code ...

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      // ... existing components ...
    ],
    blueprints: [
      {
        path: 'products',
        views: [
          {
            viewName: 'main',
            templateFile: 'main.view.tsx',
            route: '/products'
          },
          {
            viewName: 'main',
            templateFile: 'main.view.tsx',
            route: '/products/:category'
          }
        ]
      }
    ],
    services: [
      // ... existing services ...
    ]
  }
});
```

### Step 8: Add HTTP Cache Headers

Let's enhance our server with HTTP cache headers by creating a cache middleware:

```bash
mkdir -p src/middleware
touch src/middleware/cache.middleware.ts
```

Implement the cache middleware:

```typescript
// src/middleware/cache.middleware.ts
import { BlueprintController } from 'asmbl';

interface CacheConfig {
  maxAge?: number;          // Cache duration in seconds
  staleWhileRevalidate?: number; // Time in seconds to serve stale content while revalidating
  public?: boolean;         // If true, response can be cached by any cache
  private?: boolean;        // If true, response is for a single user only
  noStore?: boolean;        // If true, disable caching
  routes?: {
    pattern: RegExp;        // Route pattern to match
    config: Omit<CacheConfig, 'routes'>;  // Cache config for matching routes
  }[];
}

export class CacheMiddleware {
  private readonly defaultConfig: CacheConfig;
  
  constructor(config: CacheConfig = {}) {
    this.defaultConfig = {
      maxAge: 60,  // 1 minute by default
      staleWhileRevalidate: 600,  // 10 minutes by default
      public: true,
      ...config
    };
  }
  
  /**
   * Apply cache headers to routes
   */
  public apply(controller: BlueprintController): void {
    controller.hooks.onSend.add((request, reply) => {
      // Skip caching for non-GET requests
      if (request.method !== 'GET') {
        return;
      }
      
      // Find route-specific config if it exists
      let config = { ...this.defaultConfig };
      
      if (this.defaultConfig.routes) {
        for (const routeConfig of this.defaultConfig.routes) {
          if (routeConfig.pattern.test(request.url)) {
            config = { ...config, ...routeConfig.config };
            break;
          }
        }
      }
      
      // Skip caching if noStore is true
      if (config.noStore) {
        reply.header('Cache-Control', 'no-store');
        return;
      }
      
      // Build Cache-Control header
      const cacheControlParts: string[] = [];
      
      if (config.public) {
        cacheControlParts.push('public');
      }
      
      if (config.private) {
        cacheControlParts.push('private');
      }
      
      if (config.maxAge !== undefined) {
        cacheControlParts.push(`max-age=${config.maxAge}`);
      }
      
      if (config.staleWhileRevalidate !== undefined) {
        cacheControlParts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
      }
      
      if (cacheControlParts.length > 0) {
        reply.header('Cache-Control', cacheControlParts.join(', '));
      }
      
      // Add ETag header for efficient caching
      // In a real app, you'd generate a hash based on the content
      const etag = `"${Date.now().toString(36)}"`;
      reply.header('ETag', etag);
      
      // Check If-None-Match header for 304 responses
      const ifNoneMatch = request.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === etag) {
        reply.status(304).send();
      }
    });
  }
}
```

Update server.ts to use the cache middleware:

```typescript
// src/server.ts
// ... existing imports ...
import { CacheMiddleware } from "./middleware/cache.middleware";

// ... existing service instances ...

// Create cache middleware
const cacheMiddleware = new CacheMiddleware({
  routes: [
    {
      // Static assets get longer cache times
      pattern: /\.(js|css|png|jpg|jpeg|gif|ico|svg)$/,
      config: {
        maxAge: 86400,  // 24 hours
        staleWhileRevalidate: 604800  // 1 week
      }
    },
    {
      // API endpoints get shorter cache times
      pattern: /^\/api\//,
      config: {
        maxAge: 30,  // 30 seconds
        staleWhileRevalidate: 300  // 5 minutes
      }
    }
  ]
});

void createBlueprintServer({
  // ... existing config ...
  
  hooks: {
    onReady: (server) => {
      // Apply cache middleware
      cacheMiddleware.apply(server);
    }
  }
});
```

## Advanced Topics

### Implementing a Service Worker Cache

For even more powerful caching, you can implement a service worker. Create a service worker file:

```bash
mkdir -p public
touch public/service-worker.js
```

Implement a basic caching service worker:

```javascript
// public/service-worker.js
const CACHE_NAME = 'assemblejs-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/products',
  '/css/main.css',
  '/js/main.js',
  // Add other static assets
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip for API requests
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Fetch from network
        return fetch(fetchRequest).then((response) => {
          // Check for valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Listen for cache invalidation messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        // Respond to the client
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
      .catch((error) => {
        console.error('Cache clearing failed:', error);
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: false, error: error.message });
        }
      });
  }
});
```

Add a service worker registration script:

```bash
mkdir -p src/utils
touch src/utils/service-worker.ts
```

Implement the service worker utility:

```typescript
// src/utils/service-worker.ts
export const registerServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};

export const clearServiceWorkerCache = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Create a MessageChannel for response
    const messageChannel = new MessageChannel();
    
    // Create a promise to wait for response
    const clearPromise = new Promise<boolean>((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.success) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
    });

    // Send message to service worker
    registration.active?.postMessage(
      { type: 'CLEAR_CACHE' },
      [messageChannel.port2]
    );

    return await clearPromise;
  } catch (error) {
    console.error('Failed to clear service worker cache:', error);
    return false;
  }
};
```

### Redis Integration for Distributed Caching

For server-side distributed caching with Redis:

```bash
npm install redis
touch src/services/redis-cache.service.ts
```

Implement the Redis cache service:

```typescript
// src/services/redis-cache.service.ts
import { Service } from 'asmbl';
import { createClient, RedisClientType } from 'redis';

interface RedisCacheOptions {
  url: string;
  defaultTtl?: number;  // Time to live in seconds
  prefix?: string;      // Key prefix
}

export class RedisCacheService extends Service {
  private client: RedisClientType;
  private defaultTtl: number;
  private prefix: string;
  private isConnected: boolean = false;
  
  constructor(options: RedisCacheOptions) {
    super();
    this.client = createClient({ url: options.url });
    this.defaultTtl = options.defaultTtl || 300; // 5 minutes default
    this.prefix = options.prefix || 'cache:';
    
    // Connect to Redis when service is initialized
    this.connect();
  }
  
  private async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('Successfully connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Get full key with prefix
   */
  private getFullKey(key: string): string {
    return this.prefix + key;
  }

  /**
   * Set a value in Redis
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.connect();
    
    const fullKey = this.getFullKey(key);
    const serialized = JSON.stringify(value);
    
    if (ttl !== undefined) {
      await this.client.setEx(fullKey, ttl, serialized);
    } else if (ttl === null) {
      await this.client.set(fullKey, serialized);
    } else {
      await this.client.setEx(fullKey, this.defaultTtl, serialized);
    }
  }

  /**
   * Get a value from Redis
   */
  async get<T>(key: string): Promise<T | null> {
    await this.connect();
    
    const fullKey = this.getFullKey(key);
    const value = await this.client.get(fullKey);
    
    if (!value) {
      return null;
    }
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing Redis cache value:', error);
      return null;
    }
  }

  /**
   * Get or compute a value
   */
  async getOrCompute<T>(
    key: string, 
    compute: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cachedValue = await this.get<T>(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Compute the value
    const computedValue = await compute();
    
    // Store in cache
    await this.set(key, computedValue, ttl);
    
    return computedValue;
  }

  /**
   * Delete a cache entry
   */
  async delete(key: string): Promise<boolean> {
    await this.connect();
    
    const fullKey = this.getFullKey(key);
    const deleted = await this.client.del(fullKey);
    return deleted > 0;
  }

  /**
   * Check if a key exists in Redis
   */
  async has(key: string): Promise<boolean> {
    await this.connect();
    
    const fullKey = this.getFullKey(key);
    const exists = await this.client.exists(fullKey);
    return exists === 1;
  }

  /**
   * Clear cache entries by pattern
   */
  async clearPattern(pattern: string): Promise<number> {
    await this.connect();
    
    const fullPattern = this.getFullKey(pattern + '*');
    const keys = await this.client.keys(fullPattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    const deleted = await this.client.del(keys);
    return deleted;
  }

  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}
```

## Conclusion

This cookbook has demonstrated how to implement comprehensive caching strategies in AssembleJS applications. We've covered:

1. Creating a versatile in-memory cache service that persists to localStorage
2. Implementing component factories that leverage caching for data fetching
3. Building UI components that display and refresh cached data
4. Using HTTP cache headers for browser-level caching
5. Implementing service worker caching for offline support
6. Creating a Redis-based distributed cache for server-side caching in clustered environments

By adopting these caching strategies, you can dramatically improve your application's performance, reduce server load, and provide a better user experience, even under poor network conditions.

Remember that effective caching requires careful consideration of your data's freshness requirements and your users' needs. Always provide mechanisms to refresh stale data when necessary, and design your cache invalidation strategy to match your application's specific requirements.