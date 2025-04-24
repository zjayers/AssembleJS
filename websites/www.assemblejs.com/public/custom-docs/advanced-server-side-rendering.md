# Server-Side Rendering

AssembleJS uses server-side rendering (SSR) as a foundational technique to improve performance, SEO, and user experience. This document explains how SSR works in AssembleJS and how to optimize your applications for it.

## What is Server-Side Rendering?

Server-side rendering is the process of generating HTML on the server and sending fully formed pages to the client. In AssembleJS, this means:

1. Components are rendered to HTML on the server
2. Fully formed HTML is sent to the browser
3. The page displays immediately with all content visible
4. Client-side JavaScript is loaded for interactivity
5. Interactive components are hydrated when needed

## Benefits of Server-Side Rendering

### Performance Improvements

Server-side rendering offers significant performance benefits:

- **Faster First Contentful Paint (FCP)**: Users see content immediately
- **Reduced Time to Interactive (TTI)**: Basic content is usable before JavaScript loads
- **Lower JavaScript payload**: Only interactive components need client-side code
- **Better Core Web Vitals**: Improves LCP, FID, and CLS metrics

### SEO Advantages

Search engines can better index SSR content:

- **Complete content availability**: Search engines see the fully rendered page
- **Faster indexing**: No need to wait for JavaScript execution
- **Better metadata**: Page metadata is immediately available
- **Improved accessibility**: Content works without JavaScript

### User Experience Benefits

SSR improves user experience, especially on:

- **Slow connections**: Content appears quickly even on slow networks
- **Low-powered devices**: Less client-side processing required
- **Progressive enhancement**: Core functionality works even if JavaScript fails
- **Reduced layout shifts**: Content doesn't suddenly appear after JavaScript loads

## How AssembleJS Implements SSR

### The Rendering Pipeline

AssembleJS follows this process for server-side rendering:

1. **Route matching**: Determine which blueprint handles the request
2. **Controller execution**: The matching controller prepares the response
3. **Factory execution**: Factories prepare data for rendering
4. **Template resolution**: AssembleJS identifies the components to render
5. **Server rendering**: Components are rendered to HTML on the server
6. **HTML delivery**: Complete HTML is sent to the client
7. **Hydration**: Client-side JavaScript enhances interactive components

### Rendering Different Component Types

AssembleJS can server-render components of various types:

```typescript
// Preact/React components
export function PreactComponent(context) {
  return (
    <div className="preact-component">
      <h2>{context.data.title}</h2>
      <p>{context.data.content}</p>
    </div>
  );
}

// Vue components (in .vue files)
<template>
  <div class="vue-component">
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
  </div>
</template>

// Svelte components (in .svelte files)
<script>
  export let context;
</script>
<div class="svelte-component">
  <h2>{context.data.title}</h2>
  <p>{context.data.content}</p>
</div>
```

### Streaming Server-Side Rendering

For large pages, AssembleJS supports streaming SSR:

```typescript
export class ProductListingController extends BlueprintController {
  async get(request, reply) {
    // Start sending the response immediately
    reply.raw.writeHead(200, { 'Content-Type': 'text/html' });
    
    // Send the initial HTML (header, navigation, etc.)
    reply.raw.write(await this.renderPageHeader());
    
    // Stream each product as it's ready
    const products = await this.productService.getProducts();
    for (const product of products) {
      reply.raw.write(await this.renderProductCard(product));
    }
    
    // Send the final HTML (footer, scripts, etc.)
    reply.raw.write(await this.renderPageFooter());
    reply.raw.end();
  }
}
```

## Optimizing Server-Side Rendering

### Data Fetching Strategies

Optimize data fetching for SSR:

```typescript
export class ProductsFactory implements ComponentFactory {
  async factory(context: ServerContext): Promise<void> {
    // Parallel data fetching for better performance
    const [products, categories, recommendations] = await Promise.all([
      this.fetchProducts(),
      this.fetchCategories(),
      this.fetchRecommendations()
    ]);
    
    // Make data available to components
    context.data.set('products', products);
    context.data.set('categories', categories);
    context.data.set('recommendations', recommendations);
  }
}
```

### Template Caching

Cache rendered templates when possible:

```typescript
export class CachedTemplateRenderer implements Renderer {
  private cache = new Map<string, Function>();
  
  async render(template: string, context: any): Promise<string> {
    // Generate cache key based on template content
    const cacheKey = this.generateCacheKey(template);
    
    // Check if template is cached
    if (!this.cache.has(cacheKey)) {
      // Compile and cache the template function
      const renderFunction = this.compileTemplate(template);
      this.cache.set(cacheKey, renderFunction);
    }
    
    // Use the cached render function
    const renderFunction = this.cache.get(cacheKey);
    return renderFunction(context);
  }
}
```

### Partial Hydration

Implement partial hydration for better performance:

```typescript
// Component with partial hydration
export function ProductListing(context) {
  return (
    <div className="product-listing">
      <h1>{context.data.categoryName}</h1>
      
      {/* Static filter sidebar */}
      <div className="filters">
        {/* ... static filters ... */}
      </div>
      
      {/* Interactive product grid */}
      <div className="product-grid" data-hydrate="true">
        {context.data.products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        <script src="product-grid.client.ts"></script>
      </div>
    </div>
  );
}
```

### Above-the-Fold Prioritization

Prioritize rendering content visible in the initial viewport:

```typescript
// Controller with fold awareness
export class HomePageController extends BlueprintController {
  async get(request, reply) {
    // Fetch above-the-fold data first
    const heroData = await this.fetchHeroData();
    const featuredProducts = await this.fetchFeaturedProducts();
    
    // Start sending HTML to the client
    await reply.view('home', {
      heroData,
      featuredProducts,
      // Add a placeholder for below-the-fold content
      belowFold: '<div id="below-fold"></div>'
    });
    
    // After sending the initial response, fetch additional data
    // This will be filled in via client-side JavaScript
    const additionalData = await this.fetchAdditionalData();
    await this.storeForClientRetrieval(additionalData);
  }
}
```

## Handling Special Cases

### Managing State During Hydration

Preserve state during hydration:

```typescript
// Server-side component with state serialization
export function StatefulCounter(context) {
  const initialCount = context.data.initialCount || 0;
  
  return (
    <div className="counter">
      <p>Count: <span className="count">{initialCount}</span></p>
      <button className="decrement">-</button>
      <button className="increment">+</button>
      
      {/* Serialize initial state for hydration */}
      <script type="application/json" id="counter-state">
        {JSON.stringify({ count: initialCount })}
      </script>
      
      <script src="counter.client.ts"></script>
    </div>
  );
}

// Client-side hydration with state restoration
client.onReady(() => {
  // Get the element
  const counter = document.querySelector('.counter');
  
  // Restore initial state
  const stateElement = counter.querySelector('#counter-state');
  const initialState = JSON.parse(stateElement.textContent);
  let count = initialState.count;
  
  // Set up interactivity
  // ...
});
```

### Handling Forms and User Input

Ensure forms work both with and without JavaScript:

```typescript
// Server-renderable form with progressive enhancement
export function ContactForm(context) {
  return (
    <form 
      action="/api/contact" 
      method="post" 
      className="contact-form"
    >
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <textarea name="message" required></textarea>
      
      <button type="submit">Send Message</button>
      
      {/* Enhance with client-side validation and AJAX submission */}
      <script src="contact-form.client.ts"></script>
    </form>
  );
}
```

### API Requests and Authentication

Handle authentication during SSR:

```typescript
// Factory that handles authentication
export class AuthenticatedDataFactory implements ComponentFactory {
  async factory(context: ServerContext): Promise<void> {
    // Check for auth token in cookies
    const authToken = context.request.cookies.authToken;
    
    if (authToken) {
      try {
        // Verify token and get user
        const user = await this.authService.verifyToken(authToken);
        
        // Make user data available to components
        context.data.set('user', user);
        context.data.set('isAuthenticated', true);
        
        // Fetch user-specific data
        const userData = await this.userService.getUserData(user.id);
        context.data.set('userData', userData);
      } catch (error) {
        // Token invalid, clear it
        context.data.set('clearAuthToken', true);
        context.data.set('isAuthenticated', false);
      }
    } else {
      // No authentication
      context.data.set('isAuthenticated', false);
    }
  }
}
```

## Performance Monitoring

Monitor SSR performance:

```typescript
// SSR Performance hook
export function registerSSRPerformanceHook(server) {
  server.addHook('preHandler', async (request, reply) => {
    // Start timing
    const startTime = performance.now();
    
    // Add timing to the request object
    request.ssrTiming = {
      start: startTime,
      dataFetchStart: 0,
      dataFetchEnd: 0,
      renderStart: 0,
      renderEnd: 0
    };
  });
  
  server.addHook('onSend', async (request, reply, payload) => {
    // End timing
    const endTime = performance.now();
    const totalTime = endTime - request.ssrTiming.start;
    
    // Log performance metrics
    request.log.info({
      msg: 'SSR Performance',
      path: request.url,
      totalTime: `${totalTime.toFixed(2)}ms`,
      dataFetchTime: `${(request.ssrTiming.dataFetchEnd - request.ssrTiming.dataFetchStart).toFixed(2)}ms`,
      renderTime: `${(request.ssrTiming.renderEnd - request.ssrTiming.renderStart).toFixed(2)}ms`
    });
    
    return payload;
  });
}
```

## Common Challenges and Solutions

### Handling Third-Party Scripts

Defer non-essential third-party scripts:

```typescript
// Layout component with proper script loading
export function MainLayout(context) {
  return (
    <html>
      <head>
        <title>{context.data.pageTitle}</title>
        {/* Critical CSS */}
        <link href="critical.css" rel="stylesheet" />
      </head>
      <body>
        {/* Main content */}
        <main>{context.children}</main>
        
        {/* Essential scripts */}
        <script src="bundle.js"></script>
        
        {/* Defer non-critical third-party scripts */}
        <script dangerouslySetInnerHTML={{__html: `
          window.addEventListener('load', function() {
            // Analytics
            const analytics = document.createElement('script');
            analytics.src = 'https://analytics.example.com/script.js';
            document.body.appendChild(analytics);
            
            // Chat widget
            const chat = document.createElement('script');
            chat.src = 'https://chat.example.com/widget.js';
            document.body.appendChild(chat);
          });
        `}} />
      </body>
    </html>
  );
}
```

### Environment Differences

Handle environment differences between server and client:

```typescript
// Environment-aware component
export function GeolocatedContent(context) {
  return (
    <div className="geo-content">
      {/* Server-rendered fallback content */}
      <div className="server-content">
        <h2>Welcome to our site!</h2>
        <p>We'll personalize your experience once the page loads.</p>
      </div>
      
      {/* Client-side enhanced with geolocation */}
      <div className="client-content" style={{ display: 'none' }}>
        {/* Will be populated by client-side script */}
      </div>
      
      <script src="geo-content.client.ts"></script>
    </div>
  );
}

// Client-side script
client.onReady(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      // Show location-based content
      document.querySelector('.server-content').style.display = 'none';
      
      const clientContent = document.querySelector('.client-content');
      clientContent.innerHTML = `<h2>Welcome from ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}!</h2>`;
      clientContent.style.display = 'block';
    });
  }
});
```

### Window and Document References

Safely handle browser-only objects:

```typescript
// Safe browser API usage
export function MediaQueryComponent(context) {
  // Server-side default
  const defaultLayout = 'desktop';
  
  return (
    <div className={`layout layout-${defaultLayout}`}>
      {/* Content */}
      <div className="content">{context.data.content}</div>
      
      <script src="media-query.client.ts"></script>
    </div>
  );
}

// Client-side script
client.onReady(() => {
  // Safe to use window/document here
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  
  function updateLayout(isMobile) {
    const layout = document.querySelector('.layout');
    layout.className = `layout layout-${isMobile ? 'mobile' : 'desktop'}`;
  }
  
  // Initial check
  updateLayout(mobileQuery.matches);
  
  // Listen for changes
  mobileQuery.addEventListener('change', e => updateLayout(e.matches));
});
```

## Next Steps

Now that you understand server-side rendering in AssembleJS, explore these related topics:

- [Component Lifecycle](advanced-component-lifecycle.md) to learn about the full component lifecycle
- [Islands Architecture](advanced-islands-architecture.md) to understand how SSR works with islands
- [Performance Optimization](performance-optimization.md) for additional performance techniques
- [Security Best Practices](advanced-security.md) to ensure your SSR applications are secure