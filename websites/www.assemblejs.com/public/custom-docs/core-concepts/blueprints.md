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
import { Blueprint, BlueprintClient, events } from "asmbl";

export class WelcomeClient extends Blueprint {
  protected override async onMount(): Promise<void> {
    // Initialize the component
    super.onMount();
    
    // Set up event listeners
    events.on('feature.selected', this.handleFeatureSelected.bind(this));
    
    // Notify other components that the page is ready
    events.emit('welcome.ready', { pageId: this.context.id });
  }
  
  private handleFeatureSelected(event: any): void {
    // Handle feature selection events
    console.log('Feature selected:', event.data);
  }
}

// Register the client-side behavior
BlueprintClient.registerComponentCodeBehind(WelcomeClient);
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

## Registering Blueprints

Blueprints are registered in the server manifest:

```typescript
// server.ts
import { createBlueprintServer } from "asmbl";

void createBlueprintServer({
  serverRoot: import.meta.url,
  manifest: {
    components: [
      {
        path: 'home',
        views: [{
          viewName: 'welcome',
          templateFile: 'welcome.view.tsx',
          exposeAsBlueprint: true, // This makes it accessible as a route
        }],
      },
      // Other components...
    ],
  }
});
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

Now that you understand blueprints, learn about [Components](components.md) to see how to build the individual building blocks that blueprints compose together.