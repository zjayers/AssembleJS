# Blueprints in AssembleJS

Blueprints are a fundamental concept in AssembleJS that serve as the composition layer for organizing and rendering multiple components. Think of blueprints as page templates that define the structure and layout of your application.

## What is a Blueprint?

A blueprint is a special type of component that serves as a container for other components. Unlike regular components, blueprints:

1. Are directly accessible via URL routes
2. Can compose multiple components together
3. Handle page-level data and state
4. Manage the overall layout and structure

## Blueprint Structure

A typical blueprint consists of three files:

```
src/blueprints/home/welcome/
├── welcome.client.ts    # Client-side behavior
├── welcome.styles.scss  # Component styling
└── welcome.view.tsx     # Component template (can be any supported UI framework)
```

### The View File

The view file contains the template for rendering the blueprint. It can use any supported UI framework (Preact, React, Vue, Svelte) or template language (HTML, EJS, Markdown):

```tsx
// Using Preact as an example
export function Welcome(context: PreactViewContext) {
  return (
    <div className="home-welcome">
      <h1>Welcome to AssembleJS</h1>
      
      {/* Include other components */}
      <context.component.navigation.main />
      
      <main>
        <context.component.hero.banner 
          title="Build Amazing Web Applications" 
          subtitle="Flexible, powerful, and easy to use"
        />
        
        <context.component.feature.list features={context.data.featuredItems} />
      </main>
      
      <context.component.footer.main />
      
      {/* Include stylesheet and client script */}
      <link href="welcome.styles.scss" rel="stylesheet" />
      <script src="welcome.client.ts"></script>
    </div>
  );
}
```

### The Client File

The client file handles the client-side logic for the blueprint:

```typescript
import { Blueprint } from "asmbl";

export class WelcomeClient extends Blueprint {
  protected override onMount(): void {
    // Initialize the component
    super.onMount();
    
    // Set up event listeners using the proper event addressing format
    this.subscribe({ channel: 'feature', topic: 'selected' }, this.handleFeatureSelected.bind(this));
    
    // Notify other components that the page is ready
    this.toAll({ pageId: this.context.id }, 'welcome.ready');
  }
  
  private handleFeatureSelected(event: any): void {
    // Handle feature selection events
    console.log('Feature selected:', event.payload);
  }
}

export default WelcomeClient;
```

### The Styles File

The styles file contains the SCSS styling for the blueprint:

```scss
.home-welcome {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  // Add responsive styling
  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }
  }
}
```

## Registering Blueprints and Routes

Blueprints are registered in the server manifest in one of two ways:

### Method 1: Using `exposeAsBlueprint` on Component Views

You can expose any component view as a blueprint by setting `exposeAsBlueprint: true`:

```typescript
// server.ts
import { createBlueprintServer } from "asmbl";
import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';

void createBlueprintServer({
  serverRoot: import.meta.url,
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  manifest: {
    components: [
      {
        path: 'home',
        views: [{
          viewName: 'welcome',
          templateFile: 'welcome.view.tsx',
          exposeAsBlueprint: true, // This makes it accessible as a route
          route: '/', // Optional explicit route path (defaults to /{path}/{viewName})
        }],
      },
      // Other components...
    ],
  }
});
```

### Method 2: Using Dedicated Blueprints Entry

For more clarity, you can use a dedicated `blueprints` entry in the manifest:

```typescript
// server.ts
import { createBlueprintServer } from "asmbl";
import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';

void createBlueprintServer({
  serverRoot: import.meta.url,
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  manifest: {
    // Regular components
    components: [
      // Component definitions...
    ],
    
    // Blueprints (page-level components with routes)
    blueprints: [
      {
        path: 'home',
        views: [{
          viewName: 'welcome',
          templateFile: 'welcome.view.tsx',
          route: '/', // The URL route to access this blueprint
        }]
      },
      {
        path: 'product',
        views: [{
          viewName: 'details',
          templateFile: 'details.view.tsx',
          route: '/product/:id', // Dynamic route with parameters
        }]
      }
    ],
  }
});
```

### Route Parameters

Routes can include parameters that are made available to your blueprint:

```typescript
{
  path: 'user',
  views: [{
    viewName: 'profile',
    templateFile: 'profile.view.tsx',
    route: '/user/:userId', // :userId becomes available as context.params.userId
  }]
}
```
```

## Accessing Data in Blueprints

Blueprints can access data from multiple sources:

1. **Factory Data**: Data prepared by factories on the server
2. **URL Parameters**: Parameters from the URL route
3. **Component Context**: Shared context from parent components

```tsx
export function ProductDetails(context: PreactViewContext) {
  // Access product data prepared by a factory
  const product = context.data.product;
  
  // Access URL parameters
  const productId = context.params.id;
  
  return (
    <div className="product-details">
      <h1>{product.name}</h1>
      <p>Product ID: {productId}</p>
      {/* Rest of the template */}
    </div>
  );
}
```

## Blueprint Lifecycle

Blueprints follow a specific lifecycle:

1. **Server-Side**:
   - URL route is matched to a blueprint
   - Factories run to prepare data
   - Blueprint is rendered on the server
   - HTML is sent to the client

2. **Client-Side**:
   - Blueprint is hydrated in the browser
   - `onMount()` lifecycle method is called
   - Event listeners are registered
   - Client-side interactions begin

3. **Cleanup**:
   - When navigating away, `onDestroy()` is called
   - Event listeners are unregistered
   - Resources are cleaned up

## Creating Reusable Layouts

Blueprints can use composition to create reusable layouts:

```tsx
export function Dashboard(context: PreactViewContext) {
  return (
    <div className="dashboard-layout">
      <context.component.navigation.main />
      
      <div className="dashboard-content">
        <context.component.sidebar.main />
        
        <main>
          {/* This is where page-specific content goes */}
          {context.children || (
            <context.component.dashboard.overview data={context.data.dashboardStats} />
          )}
        </main>
      </div>
      
      <context.component.footer.main />
    </div>
  );
}
```

## Best Practices

- Keep blueprint templates focused on structure and layout
- Use components for reusable UI elements
- Use factories for data fetching and preparation
- Leverage the event system for cross-component communication
- Create reusable layout blueprints for consistent user experiences

## Next Steps

Now that you understand blueprints, learn about [Components](core-concepts-components.md) to see how to build the individual building blocks that blueprints compose together.