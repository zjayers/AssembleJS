# Performance Optimization

This guide covers techniques for optimizing the performance of AssembleJS applications, from server-side rendering to client-side interactivity.

## Core Performance Principles

AssembleJS is built with performance in mind, following these core principles:

1. **Server-First Rendering**: Generate HTML on the server for fast initial load
2. **Selective Hydration**: Only hydrate interactive components
3. **Minimal JavaScript**: Ship only the code that's needed
4. **Efficient Updates**: Optimize component updates for minimal DOM operations
5. **Parallel Processing**: Execute operations in parallel where possible

## Server-Side Optimizations

### Factory Optimizations

Factories are responsible for preparing data before rendering. Optimize them for maximum performance:

```typescript
// Before: Inefficient factory
export class ProductFactory implements ComponentFactory {
  async factory(context) {
    // Fetch everything sequentially
    const product = await this.services.productService.getProduct(context.params.id);
    context.data.set('product', product);
    
    const relatedProducts = await this.services.productService.getRelatedProducts(product.id);
    context.data.set('relatedProducts', relatedProducts);
    
    const reviews = await this.services.reviewService.getReviews(product.id);
    context.data.set('reviews', reviews);
  }
}

// After: Optimized factory
export class ProductFactory implements ComponentFactory {
  async factory(context) {
    const productId = context.params.id;
    
    // Fetch in parallel
    const [product, relatedProducts, reviews] = await Promise.all([
      this.services.productService.getProduct(productId),
      this.services.productService.getRelatedProducts(productId),
      this.services.reviewService.getReviews(productId)
    ]);
    
    // Set all data at once
    context.data.setMany({
      product,
      relatedProducts,
      reviews
    });
  }
}
```

Best practices:
- Use `Promise.all()` for parallel data fetching
- Use `context.data.setMany()` to set multiple values at once
- Only fetch the data you need for the current view
- Implement caching for expensive operations
- Use appropriate timeouts and fallbacks

### Template Optimization

Keep your templates efficient:

```typescript
// Before: Inefficient template
<div>
  {products.map(product => (
    <div key={product.id}>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      {/* Recomputing this for every product */}
      <p>Sale price: {calculateSalePrice(product.price, currentDiscount)}</p>
    </div>
  ))}
</div>

// After: Optimized template
const productItems = products.map(product => {
  // Compute once per product
  const salePrice = calculateSalePrice(product.price, currentDiscount);
  
  return (
    <div key={product.id}>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Sale price: {salePrice}</p>
    </div>
  );
});

<div>{productItems}</div>
```

Best practices:
- Minimize logic in templates
- Pre-compute values before rendering
- Use memoization for expensive calculations
- Avoid deep nesting of components (max 2-3 levels)
- Keep templates focused and small

### Component Structure

Structure your components for optimal rendering:

```typescript
// Before: Monolithic component
export function ProductPage({ product, relatedProducts, reviews }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <div>{product.description}</div>
      
      <h2>Related Products</h2>
      <div>
        {relatedProducts.map(item => (
          <div key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.price}</p>
          </div>
        ))}
      </div>
      
      <h2>Reviews</h2>
      <div>
        {reviews.map(review => (
          <div key={review.id}>
            <h3>{review.title}</h3>
            <p>{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// After: Component composition
export function ProductPage({ product, relatedProducts, reviews }) {
  return (
    <div>
      <ProductHeader product={product} />
      <RelatedProducts products={relatedProducts} />
      <ReviewList reviews={reviews} />
    </div>
  );
}

// Separate components for better rendering optimization
function ProductHeader({ product }) {
  return (
    <>
      <h1>{product.name}</h1>
      <div>{product.description}</div>
    </>
  );
}

function RelatedProducts({ products }) {
  return (
    <>
      <h2>Related Products</h2>
      <div>
        {products.map(item => <ProductItem key={item.id} product={item} />)}
      </div>
    </>
  );
}

function ProductItem({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </div>
  );
}

function ReviewList({ reviews }) {
  return (
    <>
      <h2>Reviews</h2>
      <div>
        {reviews.map(review => <ReviewItem key={review.id} review={review} />)}
      </div>
    </>
  );
}

function ReviewItem({ review }) {
  return (
    <div>
      <h3>{review.title}</h3>
      <p>{review.content}</p>
    </div>
  );
}
```

Best practices:
- Break large components into smaller, focused ones
- Use composition to build complex UIs
- Keep component responsibilities clear and single-purpose
- Use proper keys for list items

### Server Caching

Implement caching strategies for server-rendered content:

```typescript
import { BlueprintController } from 'assemblejs';
import NodeCache from 'node-cache';

// Simple in-memory cache
const pageCache = new NodeCache({ stdTTL: 60 }); // 60 seconds TTL

export class ProductController extends BlueprintController {
  async handleRequest(request, reply) {
    const cacheKey = `product:${request.params.id}`;
    
    // Check cache first
    const cachedResponse = pageCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch data and render
    const product = await this.services.productService.getProduct(request.params.id);
    
    const response = {
      view: 'detail',
      props: { product }
    };
    
    // Cache the response
    pageCache.set(cacheKey, response);
    
    return response;
  }
}
```

For more sophisticated caching:
- Use Redis for distributed caching
- Implement cache invalidation strategies
- Add cache headers for HTTP-level caching
- Use stale-while-revalidate patterns

## Client-Side Optimizations

### Selective Hydration

AssembleJS's Islands Architecture allows for selective hydration of interactive components:

```typescript
// src/components/product/add-to-cart/add-to-cart.client.ts
import { Blueprint, BlueprintClient } from 'assemblejs';

class AddToCartButton extends Blueprint {
  // Only this component will be hydrated, not the entire page
  protected override onMount(): void {
    const button = this.findElement('button');
    
    button.addEventListener('click', () => {
      const productId = this.getProperty('productId');
      this.addToCart(productId);
    });
  }
  
  private addToCart(productId: string): void {
    // Add to cart logic
  }
}

// Register the component for hydration
BlueprintClient.registerComponentCodeBehind(AddToCartButton);
```

Best practices:
- Only hydrate components that need interactivity
- Keep client-side code minimal and focused
- Use event delegation where appropriate
- Implement progressive enhancement

### Event System Optimization

Use the event system efficiently:

```typescript
// Before: Inefficient event usage
class ProductPage extends Blueprint {
  protected override onMount(): void {
    // Individual event subscriptions
    EventBus.subscribe('cart.updated', this.handleCartUpdate.bind(this));
    EventBus.subscribe('product.viewed', this.handleProductView.bind(this));
    EventBus.subscribe('user.loggedIn', this.handleUserLogin.bind(this));
    
    // Frequent updates
    setInterval(() => {
      EventBus.publish('product.view.time', { 
        productId: this.getProperty('productId'),
        time: Date.now()
      });
    }, 1000); // Every second
  }
}

// After: Optimized event usage
class ProductPage extends Blueprint {
  private subscriptions = [];
  
  protected override onMount(): void {
    // Batch subscriptions
    this.subscriptions = [
      EventBus.subscribe('cart.updated', this.handleCartUpdate.bind(this)),
      EventBus.subscribe('product.viewed', this.handleProductView.bind(this)),
      EventBus.subscribe('user.loggedIn', this.handleUserLogin.bind(this))
    ];
    
    // Throttled updates
    this.startViewTimeTracking();
  }
  
  private startViewTimeTracking(): void {
    const productId = this.getProperty('productId');
    let lastPublish = Date.now();
    
    // Only publish at most once every 10 seconds
    setInterval(() => {
      const now = Date.now();
      if (now - lastPublish >= 10000) {
        EventBus.publish('product.view.time', { 
          productId,
          time: now
        });
        lastPublish = now;
      }
    }, 10000);
  }
  
  protected override onDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

Best practices:
- Store subscription references for cleanup
- Properly unsubscribe when components are destroyed
- Use throttling and debouncing for frequent events
- Batch event operations where possible
- Use targeted event addresses

### Lazy Loading

Implement lazy loading for non-critical components:

```typescript
// src/server.ts
import { createBlueprintServer } from 'assemblejs';

const server = createBlueprintServer({
  // ...
  routes: [
    // Lazy-loaded controller
    {
      method: 'GET',
      path: '/admin',
      // Will only be loaded when this route is accessed
      controller: () => import('./controllers/admin.controller').then(m => m.AdminController)
    }
  ]
});
```

For client-side lazy loading:

```typescript
// src/components/product/details/details.client.ts
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetails extends Blueprint {
  protected override onMount(): void {
    // Lazy load additional components when needed
    const showReviewsButton = this.findElement('#show-reviews');
    
    showReviewsButton.addEventListener('click', async () => {
      const reviewsContainer = this.findElement('#reviews-container');
      
      // Dynamically import the reviews component
      const { ProductReviews } = await import('../reviews/reviews.client.js');
      
      // Initialize it
      const productId = this.getProperty('productId');
      new ProductReviews(reviewsContainer, { productId });
    });
  }
}

BlueprintClient.registerComponentCodeBehind(ProductDetails);
```

Best practices:
- Lazy load heavy components
- Use dynamic imports for code splitting
- Implement loading indicators
- Prioritize above-the-fold content
- Consider using Intersection Observer for visibility-based loading

## Asset Optimization

### CSS Optimization

Keep your styles efficient:

```scss
// Before: Inefficient CSS
.product {
  display: flex;
  flex-direction: column;
  margin: 20px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.product-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-description {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 15px;
}

// After: Optimized CSS
.product {
  display: flex;
  flex-direction: column;
  margin: 20px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  
  &-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  &-description {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 15px;
  }
}
```

Best practices:
- Use CSS nesting for related styles
- Minimize selector complexity
- Avoid universal selectors
- Use CSS variables for consistency
- Keep styles component-specific
- Implement critical CSS inlining

### Image Optimization

Optimize images for faster loading:

```html
<!-- Before: Unoptimized image -->
<img src="/images/product.jpg" alt="Product" />

<!-- After: Optimized with responsive images -->
<img 
  src="/images/product-small.jpg"
  srcset="
    /images/product-small.jpg 400w,
    /images/product-medium.jpg 800w,
    /images/product-large.jpg 1200w
  "
  sizes="
    (max-width: 600px) 400px,
    (max-width: 1200px) 800px,
    1200px
  "
  loading="lazy"
  alt="Product"
/>
```

Best practices:
- Use responsive images with srcset and sizes
- Implement lazy loading for below-the-fold images
- Use modern image formats (WebP, AVIF)
- Optimize image quality and dimensions
- Consider using an image CDN

## Measuring Performance

### Server-Side Metrics

Monitor server performance:

```typescript
import { BlueprintController } from 'assemblejs';
import { performance } from 'perf_hooks';

export class ProductController extends BlueprintController {
  async handleRequest(request, reply) {
    const start = performance.now();
    
    try {
      // Process request
      const product = await this.services.productService.getProduct(request.params.id);
      
      const result = {
        view: 'detail',
        props: { product }
      };
      
      // Log performance
      const duration = performance.now() - start;
      console.log(`Rendered product ${request.params.id} in ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      // Handle error
      console.error(`Error rendering product: ${error.message}`);
      throw error;
    }
  }
}
```

For more detailed metrics:
- Use the AssembleJS profiler
- Implement distributed tracing
- Create performance dashboards
- Set up alerts for performance regressions

### Client-Side Metrics

Measure client-side performance:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class PerformanceMonitor extends Blueprint {
  protected override onMount(): void {
    // Report Core Web Vitals
    this.reportWebVitals();
    
    // Measure component render time
    this.measureComponentPerformance();
  }
  
  private reportWebVitals(): void {
    if ('web-vitals' in window) {
      // @ts-ignore
      import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
        getCLS(this.sendToAnalytics);
        getFID(this.sendToAnalytics);
        getLCP(this.sendToAnalytics);
      });
    }
  }
  
  private sendToAnalytics(metric): void {
    // Send to your analytics platform
    console.log(metric);
  }
  
  private measureComponentPerformance(): void {
    const components = document.querySelectorAll('[data-component-id]');
    
    components.forEach(component => {
      const id = component.getAttribute('data-component-id');
      const hydrationStart = performance.now();
      
      // After hydration is complete
      setTimeout(() => {
        const hydrationTime = performance.now() - hydrationStart;
        console.log(`Component ${id} hydrated in ${hydrationTime.toFixed(2)}ms`);
      }, 0);
    });
  }
}

BlueprintClient.registerComponentCodeBehind(PerformanceMonitor);
```

Best practices:
- Monitor real user metrics (RUM)
- Track Core Web Vitals
- Measure interaction responsiveness
- Set performance budgets
- A/B test performance improvements

## Advanced Techniques

### HTTP/2 Server Push

Configure HTTP/2 server push for critical resources:

```typescript
import { createBlueprintServer } from 'assemblejs';
import fastify from 'fastify';

const app = fastify({
  http2: true
});

const server = createBlueprintServer({
  server: app,
  // ...other options
});

// Push critical resources
server.addHook('onRequest', (request, reply, done) => {
  if (reply.raw.push) {
    // Push critical CSS
    const cssStream = reply.raw.push('/styles/critical.css', {
      response: {
        'content-type': 'text/css'
      }
    });
    
    cssStream.end();
    
    // Push critical JS
    const jsStream = reply.raw.push('/scripts/core.js', {
      response: {
        'content-type': 'application/javascript'
      }
    });
    
    jsStream.end();
  }
  
  done();
});
```

### Memory Management

Implement proper memory management:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class GalleryViewer extends Blueprint {
  private images = [];
  private observer = null;
  private subscriptions = [];
  
  protected override onMount(): void {
    // Create intersection observer
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
    
    // Observe all gallery images
    const imageElements = this.findElements('.gallery-image');
    imageElements.forEach(img => {
      this.observer.observe(img);
      this.images.push(img);
    });
    
    // Subscribe to events
    this.subscriptions.push(
      EventBus.subscribe('gallery.update', this.handleGalleryUpdate.bind(this))
    );
  }
  
  private handleIntersection(entries): void {
    // Handle intersection logic
  }
  
  private handleGalleryUpdate(data): void {
    // Handle gallery updates
  }
  
  protected override onDestroy(): void {
    // Clean up observer
    if (this.observer) {
      this.images.forEach(img => this.observer.unobserve(img));
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Clean up event subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Clear references
    this.images = [];
  }
}

BlueprintClient.registerComponentCodeBehind(GalleryViewer);
```

Best practices:
- Clean up event listeners
- Dispose of large objects when not needed
- Unsubscribe from events
- Clear references to DOM elements
- Disconnect observers when not needed

## Integration with Performance Tools

### Lighthouse Integration

Add Lighthouse CI to your workflow:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      
      # Start the application server
      - run: npm run start & npx wait-on http://localhost:3000
      
      # Run Lighthouse CI
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/products
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Web Vitals Monitoring

Set up continuous monitoring:

```typescript
// src/monitors/web-vitals.ts
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ name, delta, id }),
    headers: { 'Content-Type': 'application/json' }
  });
}

export function monitorWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

## Performance Checklist

Use this checklist to ensure your AssembleJS application is optimized:

### Server-Side
- [ ] Implement parallel data fetching in factories
- [ ] Apply appropriate caching strategies
- [ ] Optimize template rendering
- [ ] Minimize component nesting (max 2-3 levels)
- [ ] Use server timing headers
- [ ] Configure HTTP/2 or HTTP/3
- [ ] Set correct cache headers

### Client-Side
- [ ] Apply selective hydration for interactive components
- [ ] Lazy load non-critical components
- [ ] Optimize event subscriptions and cleanup
- [ ] Implement code splitting
- [ ] Use efficient DOM operations
- [ ] Apply resource hints (preload, prefetch)
- [ ] Properly manage memory and resources

### Assets
- [ ] Optimize CSS (minimize, critical CSS)
- [ ] Optimize JavaScript (tree-shaking, minification)
- [ ] Optimize images (size, format, lazy loading)
- [ ] Implement font optimization
- [ ] Use a CDN for static assets
- [ ] Configure service worker caching
- [ ] Apply responsive resource loading

### Measurement
- [ ] Monitor Core Web Vitals
- [ ] Track server-side metrics
- [ ] Implement real user monitoring
- [ ] Set performance budgets
- [ ] Use Lighthouse for auditing
- [ ] Profile rendering performance
- [ ] Monitor memory usage

## Related Topics

- [Islands Architecture](advanced-islands-architecture)
- [Server-Side Rendering](advanced-server-side-rendering)
- [Component Lifecycle](advanced-component-lifecycle)
- [Event System](core-concepts-event-system)