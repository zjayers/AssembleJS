# Architecture Overview

## The AssembleJS Architecture

AssembleJS is a modern micro-frontend framework that enables developers to build modular, maintainable, and high-performance web applications using multiple UI technologies. The architecture is designed around several key principles:

- **Component Isolation**: Each component is self-contained with its own view, styling, and client-side behavior.
- **Framework-Agnostic**: Support for multiple UI frameworks (React, Preact, Vue, Svelte, Web Components) and template engines (HTML, EJS, Markdown, etc.).
- **Islands Architecture**: JavaScript is only loaded for interactive components, improving performance.
- **Event-Driven Communication**: Components communicate through a standardized event system.

## Core Architecture Components

### Blueprints

Blueprints are top-level components that serve as pages or route endpoints in your application. They can contain multiple child components and define the overall structure of a page.

```
/blueprints
  /home
    /welcome
      - welcome.client.ts    # Client-side behavior
      - welcome.styles.scss  # Component styling
      - welcome.view.tsx     # Component template (Preact)
```

### Components

Components are reusable UI elements that can be included in blueprints or other components. Each component is composed of three parts:

- **View File**: Defines the markup and structure (e.g., .tsx, .vue, .md)
- **Client File**: Contains client-side behavior and lifecycle hooks
- **Styles File**: Controls the component's appearance using SCSS

```
/components
  /product
    /card
      - card.client.ts       # Client-side behavior
      - card.styles.scss     # Component styling
      - card.view.tsx        # Component template (Preact)
```

### Controllers

Controllers handle server-side logic such as routing, data fetching, and API endpoints. They process requests, prepare data for components, and manage server-side operations.

```typescript
export class ProductController extends BlueprintController {
  // Handle requests for product data
  public async getProducts(request, reply) {
    const products = await this.productService.getAllProducts();
    return reply.send(products);
  }
  
  // Handle a specific product request
  public async getProductById(request, reply) {
    const { id } = request.params;
    const product = await this.productService.getProductById(id);
    return reply.send(product);
  }
}
```

### Services

Services are reusable modules that handle business logic, data processing, and external integrations. They are injectable dependencies used by controllers and other services.

```typescript
export class ProductService extends Service {
  private database: Database;
  
  constructor() {
    super();
    this.database = new Database('products');
  }
  
  public async getAllProducts() {
    return this.database.find({});
  }
  
  public async getProductById(id: string) {
    return this.database.findOne({ id });
  }
}
```

### Factories

Factories are responsible for transforming data between different formats, such as converting database records to component-ready data structures.

```typescript
export class ProductFactory {
  // Transform raw product data into component-friendly format
  public static createProductViewModel(rawProduct) {
    return {
      id: rawProduct._id,
      title: rawProduct.name,
      price: rawProduct.price,
      imageUrl: rawProduct.images[0],
      description: rawProduct.description,
      inStock: rawProduct.inventory > 0
    };
  }
}
```

### Event Bus

The Event Bus enables communication between components through a publish-subscribe pattern. Components can emit and listen for events without direct dependencies.

```typescript
// In a component that adds items to cart
events.emit('cart.add', { 
  productId: product.id,
  quantity: 1
});

// In the cart component
events.on('cart.add', (data) => {
  // Handle adding item to cart
});
```

## Application Flow

1. **Server Initialization**: The server is created using `createBlueprintServer()` with configured components, controllers, and services.
2. **Request Handling**: When a request arrives, the appropriate controller processes it.
3. **Component Rendering**: Blueprints and their child components are rendered on the server.
4. **Client Hydration**: Interactive components are hydrated on the client, using a minimal JavaScript footprint.
5. **Event-Based Interaction**: Components communicate via events, maintaining isolation while enabling coordination.

## File Structure

A typical AssembleJS application follows this structure:

```
/src
  /blueprints          # Page-level components
  /components          # Reusable UI components
  /controllers         # Server-side request handlers
  /services            # Business logic and data access
  /factories           # Data transformation utilities
  /models              # Data models and types
  /utils               # Shared utility functions
  server.ts            # Server initialization
```

This architecture enables developers to create highly modular, maintainable, and performant applications while allowing different teams to work with their preferred UI frameworks within the same project.