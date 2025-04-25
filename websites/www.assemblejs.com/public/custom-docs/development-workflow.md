# Development Workflow

This guide outlines recommended development workflows and best practices for AssembleJS projects. Following these guidelines will help you maintain a clean, efficient development process.

## Development Cycle

A typical development workflow in AssembleJS follows these steps:

1. **Plan your components and blueprints**
2. **Generate component and blueprint scaffolding**
3. **Implement component views and styles**
4. **Develop client-side behavior**
5. **Create factories for data**
6. **Test and refine**
7. **Build and deploy**

## Planning Components

Before writing code, plan your component architecture:

1. **Identify page blueprints:** Determine the main pages (routes) of your application
2. **Break down components:** Identify reusable UI elements
3. **Plan component hierarchy:** Establish parent-child relationships
4. **Define data requirements:** What data each component needs
5. **Choose frameworks:** Decide which UI framework is best for each component

## Using the Generator

AssembleJS provides a generator to create components, blueprints, and other artifacts:

```bash
# Run the generator
npx asmgen
```

When the generator runs, you'll see a menu of options:

```
? What do you want to generate?
  ❯ Blueprint
    Component
    Controller
    Factory
    Service
    Model
```

### Generating Blueprints

To create a new page:

1. Select "Blueprint" from the menu
2. Enter the name of the blueprint (e.g., "product")
3. Enter the view name (e.g., "detail")
4. Choose the UI framework (e.g., "preact")

This will generate:

```
src/blueprints/product/detail/
├── detail.client.ts     # Client-side behavior
├── detail.styles.scss   # Component styling
└── detail.view.tsx      # The view template
```

### Generating Components

To create a reusable component:

1. Select "Component" from the menu
2. Enter the namespace (e.g., "header")
3. Enter the name (e.g., "navigation")
4. Choose the UI framework (e.g., "vue")

This will generate:

```
src/components/header/navigation/
├── navigation.client.ts     # Client-side behavior
├── navigation.styles.scss   # Component styling
└── navigation.view.vue      # The view template
```

### Generating Factories

To create a data factory:

1. Select "Factory" from the menu
2. Enter the name (e.g., "products")
3. Choose where to associate it (blueprint or component)

This will generate:

```
src/factories/products.factory.ts
```

## Local Development

### Running the Development Server

Start the development server with:

```bash
npm run dev
```

This command:
- Starts the AssembleJS server
- Enables hot reloading for file changes
- Shows development-specific logs and information

### Dev Server Features

The AssembleJS development server provides:

1. **Hot module replacement:** Changes are reflected without a full page reload
2. **Development panel:** A UI for debugging and exploring components
3. **Performance metrics:** Real-time feedback on component performance
4. **Error overlays:** Detailed error information displayed in the browser

#### The Development Panel

Access the dev panel by appending `?__dev=true` to any URL. Features include:

- Component explorer
- Performance metrics
- Network requests
- Event logging
- Server-side rendering insights

## Component Development

### View Development

When developing component views:

1. Start with a static UI using HTML/CSS
2. Add component placeholders and dynamic data bindings
3. Break larger components into smaller, reusable pieces
4. Use CSS Grid or Flexbox for layouts
5. Include responsive design considerations

### Style Development

For component styling:

1. Use SCSS for nested styles
2. Keep styles scoped to the component
3. Use CSS variables for theme values
4. Consider style variations through props
5. Create responsive variants

Example SCSS structure:

```scss
.product-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  &__content {
    padding: 1rem;
  }
  
  &__title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  &__price {
    font-size: 1.5rem;
    color: #2b67f8;
    margin-bottom: 1rem;
  }
  
  &__actions {
    display: flex;
    justify-content: space-between;
  }
  
  // Variations
  &--featured {
    border: 2px solid gold;
  }
  
  // Responsive styles
  @media (max-width: 768px) {
    &__image {
      height: 150px;
    }
  }
}
```

### Client-Side Development

For client-side behavior:

1. Use the component client to add interactivity
2. Keep logic focused on UI behavior (not business logic)
3. Use the event system for cross-component communication
4. Handle lifecycle events appropriately

Example client file:

```typescript
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('product.card');

client.onReady(() => {
  // Get references to elements
  const addToCartButton = document.querySelector('.add-to-cart-button');
  const quantityInput = document.querySelector('.quantity-input');
  
  // Set up event listeners
  addToCartButton?.addEventListener('click', () => {
    const productId = addToCartButton.getAttribute('data-product-id');
    const quantity = parseInt(quantityInput?.value || '1');
    
    // Publish an event for other components to respond to
    client.events.publish('cart:item-added', {
      productId,
      quantity,
      timestamp: new Date().toISOString()
    });
  });
  
  // Subscribe to events from other components
  client.events.subscribe('cart:updated', (cart) => {
    // Update UI based on cart state
    updateProductAvailability(cart);
  });
});

function updateProductAvailability(cart) {
  // Implementation details...
}

export default client;
```

## Factory Development

When developing factories:

1. Focus on data preparation, not UI logic
2. Use services for reusable data access
3. Implement caching when appropriate
4. Handle errors gracefully
5. Provide fallback data when possible

Example factory:

```typescript
import { ComponentFactory, ServerContext } from 'assemblejs';

export class ProductDetailFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    try {
      // Get product ID from route parameters
      const productId = context.params.get('productId');
      
      // Get services
      const productService = context.services.get('productService');
      const reviewService = context.services.get('reviewService');
      
      // Fetch data in parallel
      const [product, reviews, relatedProducts] = await Promise.all([
        productService.getProduct(productId),
        reviewService.getReviewsForProduct(productId),
        productService.getRelatedProducts(productId)
      ]);
      
      // Handle product not found
      if (!product) {
        context.data.set('notFound', true);
        return;
      }
      
      // Make data available to components
      context.data.set('product', product);
      context.data.set('reviews', reviews);
      context.data.set('relatedProducts', relatedProducts);
      
      // Set page metadata for SEO
      context.data.set('pageMetadata', {
        title: `${product.name} | Our Store`,
        description: product.description.substring(0, 160),
        ogImage: product.images[0]?.url
      });
    } catch (error) {
      // Log the error
      console.error('Error in ProductDetailFactory:', error);
      
      // Set error state
      context.data.set('error', {
        message: 'Failed to load product details',
        code: error.code || 'UNKNOWN_ERROR'
      });
      
      // Provide fallback data
      context.data.set('product', null);
      context.data.set('reviews', []);
      context.data.set('relatedProducts', []);
    }
  }
}
```

## Testing

### Component Testing

Test components in isolation:

```typescript
import { render } from '@testing-library/preact';
import { ProductCard } from '../components/product/card/card.view';

describe('ProductCard', () => {
  it('should render product information correctly', () => {
    const context = {
      data: {
        product: {
          id: '123',
          name: 'Test Product',
          price: 99.99,
          image: '/test-image.jpg'
        }
      }
    };
    
    const { getByText, getByAltText } = render(<ProductCard context={context} />);
    
    expect(getByText('Test Product')).toBeInTheDocument();
    expect(getByText('$99.99')).toBeInTheDocument();
    expect(getByAltText('Test Product')).toHaveAttribute('src', '/test-image.jpg');
  });
});
```

### Factory Testing

Test factories with mocked services:

```typescript
import { ProductDetailFactory } from '../factories/product-detail.factory';

describe('ProductDetailFactory', () => {
  it('should fetch and set product data', async () => {
    // Mock context
    const context = {
      params: {
        get: jest.fn().mockReturnValue('123')
      },
      data: {
        set: jest.fn()
      },
      services: {
        get: jest.fn().mockImplementation((serviceName) => {
          if (serviceName === 'productService') {
            return {
              getProduct: jest.fn().mockResolvedValue({ id: '123', name: 'Test Product' }),
              getRelatedProducts: jest.fn().mockResolvedValue([])
            };
          }
          if (serviceName === 'reviewService') {
            return {
              getReviewsForProduct: jest.fn().mockResolvedValue([])
            };
          }
        })
      }
    };
    
    const factory = new ProductDetailFactory();
    await factory.factory(context);
    
    expect(context.params.get).toHaveBeenCalledWith('productId');
    expect(context.data.set).toHaveBeenCalledWith('product', { id: '123', name: 'Test Product' });
    expect(context.data.set).toHaveBeenCalledWith('reviews', []);
    expect(context.data.set).toHaveBeenCalledWith('relatedProducts', []);
  });
});
```

### Integration Testing

Test complete pages with multiple components:

```typescript
import { createTestServer } from 'assemblejs/testing';

describe('Product Detail Page', () => {
  let server;
  
  beforeAll(async () => {
    server = await createTestServer({
      // Test configuration
    });
  });
  
  afterAll(async () => {
    await server.close();
  });
  
  it('should render product detail page with correct components', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/product/123'
    });
    
    expect(response.statusCode).toBe(200);
    expect(response.payload).toContain('Product Detail');
    expect(response.payload).toContain('Related Products');
    expect(response.payload).toContain('Customer Reviews');
  });
});
```

## Build and Deployment

### Building for Production

Create a production build:

```bash
npm run build
```

This command:
- Compiles TypeScript to JavaScript
- Optimizes assets (minification, tree-shaking)
- Generates a production-ready build

### Environment Configuration

Use environment variables for configuration:

```typescript
// src/config.ts
export const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'assemblejs_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  cache: {
    enabled: process.env.ENABLE_CACHE === 'true',
    ttl: parseInt(process.env.CACHE_TTL || '3600')
  }
};
```

### Deployment Options

AssembleJS supports various deployment targets:

1. **Traditional Node.js hosting**
   - Platforms like Heroku, DigitalOcean, and AWS EC2
   - Deploy the built application and run with Node.js

2. **Containerized deployment**
   - Use Docker to containerize the application
   - Deploy to Kubernetes, AWS ECS, or other container services

3. **Serverless deployment**
   - Deploy to AWS Lambda with API Gateway
   - Use serverless frameworks for deployment

4. **Static hosting with API**
   - Deploy static assets to CDN
   - Deploy API separately to serverless or container service

## Performance Optimization

### Server-Side Performance

1. **Use caching for expensive operations**
2. **Implement database connection pooling**
3. **Use compression middleware**
4. **Optimize factory execution**
5. **Consider Redis for session and cache storage**

### Client-Side Performance

1. **Minimize hydration** - Only hydrate interactive components
2. **Optimize bundle sizes** - Use code splitting and tree shaking
3. **Use lazy loading** for non-critical components
4. **Implement proper caching headers**
5. **Optimize images and assets**

## Best Practices Summary

### General Best Practices

1. **Component-First Development** - Build and test components in isolation
2. **TypeScript for Everything** - Use TypeScript for type safety
3. **Clear Separation of Concerns** - Keep UI logic separate from business logic
4. **Documentation** - Document component APIs and expected props
5. **Performance Monitoring** - Use the dev panel to monitor performance

### Architecture Best Practices

1. **Small, Focused Components** - Keep components small and single-purpose
2. **Smart Data Loading** - Use factories to load data efficiently
3. **Loose Coupling** - Use the event system for component communication
4. **Progressive Enhancement** - Build for server-side rendering first
5. **Accessibility** - Design with accessibility in mind from the start

## Next Steps

Now that you understand the development workflow, explore these resources:

1. [Component Communication Patterns](tutorials/component-communication.md)
2. [Performance Optimization Guide](performance-optimization.md)
3. [Deployment Guide](deployment-guide.md)
4. [Testing Strategies](testing-guide.md)

By following these workflow guidelines, you'll be able to build high-quality, maintainable applications with AssembleJS.