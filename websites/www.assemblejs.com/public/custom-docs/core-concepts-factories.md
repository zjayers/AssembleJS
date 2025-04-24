# Factories

Factories are a powerful feature in AssembleJS that prepare data for your components and blueprints. They run on the server before rendering, ensuring that components have all the data they need.

## What are Factories?

In AssembleJS, a factory is:

1. A class that implements the `ComponentFactory` interface
2. Responsible for fetching, transforming, and providing data to components
3. Executed on the server before rendering
4. Part of the data preparation phase in the rendering pipeline

## Factory Structure

A basic factory has this structure:

```typescript
import { ComponentFactory, ServerContext } from 'asmbl';

export class ProductsFactory implements ComponentFactory {
  // Priority determines execution order (higher runs earlier)
  priority = 10;
  
  // Main factory method that runs before rendering
  async factory(context: ServerContext): Promise<void> {
    // Fetch data from an API, database, or other source
    const products = await this.fetchProducts();
    
    // Transform data if needed
    const enhancedProducts = this.enhanceProductData(products);
    
    // Make data available to components via the context
    context.data.set('products', enhancedProducts);
  }
  
  // Helper methods for data fetching and transformation
  private async fetchProducts() {
    // Implementation details...
    return [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }];
  }
  
  private enhanceProductData(products) {
    // Add additional information or transform the data
    return products.map(product => ({
      ...product,
      imageUrl: `/images/products/${product.id}.jpg`,
      url: `/product/${product.id}`
    }));
  }
}
```

## Registering Factories

Factories are automatically discovered and registered based on their location. You can also manually register factories:

```typescript
// Register a factory for a specific component
server.registerFactory('products.list', new ProductsFactory());

// Register a factory for a blueprint
server.registerFactory('catalog', new CatalogFactory());

// Register a global factory
server.registerFactory(new GlobalDataFactory());
```

## Factory Execution Order

Factories execute in order of priority, with higher priority factories running first. This allows you to build dependencies between factories:

```typescript
// Runs first (priority 20)
export class GlobalDataFactory implements ComponentFactory {
  priority = 20;
  
  async factory(context: ServerContext): Promise<void> {
    const config = await loadConfig();
    context.data.set('config', config);
  }
}

// Runs second (priority 10)
export class ProductsFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    // Access data from higher priority factories
    const config = context.data.get('config');
    const apiUrl = config.api.baseUrl + '/products';
    
    const products = await fetch(apiUrl);
    context.data.set('products', products);
  }
}
```

## Factory Context

Factories receive a `ServerContext` object that provides access to:

```typescript
interface ServerContext {
  // Data container for sharing between factories and components
  data: {
    set(key: string, value: any): void;
    get(key: string): any;
    has(key: string): boolean;
  };
  
  // URL parameters from dynamic routes
  params: {
    set(key: string, value: string): void;
    get(key: string): string;
    has(key: string): boolean;
  };
  
  // Request information
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    cookies: Record<string, string>;
  };
  
  // Services container for accessing registered services
  services: ServiceContainer;
  
  // Event bus for server-side events
  events: EventBus;
}
```

## Factory Types

### Global Factories

Global factories run for every request and provide data available to all components:

```typescript
export class GlobalDataFactory implements ComponentFactory {
  priority = 100; // High priority to run first
  
  async factory(context: ServerContext): Promise<void> {
    // Fetch global data like user info, site configuration, etc.
    const user = await this.getCurrentUser(context.request.cookies.sessionId);
    const siteConfig = await this.getSiteConfig();
    
    // Make globally available
    context.data.set('user', user);
    context.data.set('siteConfig', siteConfig);
    context.data.set('isLoggedIn', !!user);
  }
  
  // Implementation details...
}
```

### Component-Specific Factories

Component-specific factories run only for specific components:

```typescript
export class ProductListFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    // Get pagination parameters from query string
    const page = parseInt(context.request.query.page || '1');
    const limit = parseInt(context.request.query.limit || '20');
    
    // Fetch products with pagination
    const products = await this.fetchProducts(page, limit);
    const totalCount = await this.getProductCount();
    
    // Set component data
    context.data.set('products', products);
    context.data.set('pagination', {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1
    });
  }
  
  // Implementation details...
}
```

### Blueprint Factories

Blueprint factories prepare data specific to a page or route:

```typescript
export class ProductDetailFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    // Get product ID from route parameters
    const productId = context.params.get('productId');
    
    // Fetch the product details
    const product = await this.fetchProductDetails(productId);
    
    // Handle product not found
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }
    
    // Fetch related data
    const relatedProducts = await this.fetchRelatedProducts(product.category);
    const reviews = await this.fetchProductReviews(productId);
    
    // Set data for the blueprint
    context.data.set('product', product);
    context.data.set('relatedProducts', relatedProducts);
    context.data.set('reviews', reviews);
    
    // Set page metadata for SEO
    context.data.set('pageMetadata', {
      title: `${product.name} | Our Store`,
      description: product.description.substring(0, 160),
      ogImage: product.images[0]?.url
    });
  }
  
  // Implementation details...
}
```

## Error Handling in Factories

Factories should handle errors appropriately:

```typescript
export class ProductsFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    try {
      const products = await this.fetchProducts();
      context.data.set('products', products);
    } catch (error) {
      // Log the error
      console.error('Failed to fetch products:', error);
      
      // Set error state for components to handle
      context.data.set('productsError', {
        message: 'Unable to load products at this time',
        code: error.code || 'UNKNOWN_ERROR'
      });
      
      // Provide fallback data if available
      context.data.set('products', []);
      
      // Optionally rethrow for critical errors
      // if (error.isCritical) throw error;
    }
  }
}
```

## Using Services in Factories

Factories can use registered services:

```typescript
export class ProductsFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    // Get services from the container
    const productService = context.services.get('productService');
    const cacheService = context.services.get('cacheService');
    
    // Try to get cached data first
    const cacheKey = 'products:featured';
    let products = await cacheService.get(cacheKey);
    
    if (!products) {
      // Fetch fresh data if not in cache
      products = await productService.getFeaturedProducts();
      
      // Cache the results
      await cacheService.set(cacheKey, products, { ttl: 3600 }); // 1 hour
    }
    
    context.data.set('featuredProducts', products);
  }
}
```

## Factory Best Practices

### Separation of Concerns

- Keep factories focused on data preparation
- Extract reusable data fetching logic into services
- Use transformers for complex data transformations

### Performance

- Implement caching for expensive operations
- Use Promise.all for parallel data fetching when possible
- Set appropriate factory priorities to optimize execution order

```typescript
async factory(context: ServerContext): Promise<void> {
  // Fetch multiple data sources in parallel
  const [products, categories, promotions] = await Promise.all([
    this.fetchProducts(),
    this.fetchCategories(),
    this.fetchPromotions()
  ]);
  
  // Set all data at once
  context.data.set('products', products);
  context.data.set('categories', categories);
  context.data.set('promotions', promotions);
}
```

### Error Handling

- Always include error handling in factories
- Provide meaningful error messages for debugging
- Set up fallback data when possible

### Data Typing

- Use TypeScript interfaces to define data structures
- Validate data against expected schemas
- Document data shape for component consumers

```typescript
// Define interfaces for your data
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  inStock: boolean;
}

export class ProductsFactory implements ComponentFactory {
  async factory(context: ServerContext): Promise<void> {
    const products: Product[] = await this.fetchProducts();
    context.data.set('products', products);
  }
}
```

## Factory CLI

AssembleJS provides CLI tools to generate factories:

```bash
# Generate a new factory
npx asmgen
```

When prompted:
1. Select "Factory" from the list
2. Set the name (e.g., "products")
3. Choose which component or blueprint to associate it with

## Next Steps

Now that you understand factories, explore these related topics:

- [Event System](core-concepts-event-system.md) - Understand server and client events
- [Renderers](core-concepts-renderers.md) - Learn about the rendering system
- [Advanced Topics](advanced-islands-architecture.md) - Explore advanced AssembleJS features