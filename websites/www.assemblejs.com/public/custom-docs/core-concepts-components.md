# Components in AssembleJS

Components are the fundamental building blocks of any AssembleJS application. They represent isolated, reusable UI elements that can be composed together to create complex interfaces.

## Component Philosophy

AssembleJS components follow these key principles:

1. **True Isolation**: Each component has its own code, styles, and templates that don't leak to other components
2. **Framework Agnostic**: Components can be written in Preact, React, Vue, Svelte, or plain HTML/templates
3. **Server-First**: Components render on the server by default, with optional client-side hydration
4. **Explicit Dependencies**: Components declare their dependencies clearly, avoiding hidden coupling

## Component Structure

### File Organization

A typical AssembleJS component consists of three files:

```
src/components/header/main/
├── main.client.ts       # Client-side behavior
├── main.styles.scss     # Component styling
└── main.view.html       # Component template (any supported format)
```

### Component Definition in Manifest

Components are registered in the server manifest when creating a blueprint server:

```typescript
import { createBlueprintServer } from "asmbl";
import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        // Component path - dictates the component's namespace
        path: 'header',
        
        // Component views - different visual representations of this component
        views: [
          {
            // View name - combined with path creates the fully qualified name
            viewName: 'main',
            
            // Template file - relative to the component path
            templateFile: 'main.view.html',
            
            // Optional - make this view available as a blueprint/page
            exposeAsBlueprint: false,
            
            // Optional - route to expose this view at if exposeAsBlueprint is true
            route: '/header'
          }
        ]
      }
    ]
  }
});
```

The `path` property defines the component's namespace, while `viewName` specifies the particular view within that component. Together, they form the fully qualified component name (e.g., `header.main`) used throughout the application.

### The View File

The view file contains the component's template. AssembleJS supports multiple templating formats:

**HTML Template**:
```html
<header class="header-main">
  <div class="header-container">
    <a href="/" class="logo">AssembleJS</a>
    <nav class="main-nav">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/docs">Documentation</a></li>
        <li><a href="/examples">Examples</a></li>
      </ul>
    </nav>
  </div>
  
  <link href="main.styles.scss" rel="stylesheet" />
  <script src="main.client.ts"></script>
</header>
```

**Preact/React Template**:
```tsx
export function Main(context: PreactViewContext) {
  const [menuOpen, setMenuOpen] = preact.useState(false);
  
  return (
    <header className="header-main">
      <div className="header-container">
        <a href="/" className="logo">AssembleJS</a>
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/examples">Examples</a></li>
          </ul>
        </nav>
        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>
      
      <link href="main.styles.scss" rel="stylesheet" />
      <script src="main.client.ts"></script>
    </header>
  );
}
```

**Vue Template**:
```vue
<template>
  <header class="header-main">
    <div class="header-container">
      <a href="/" class="logo">AssembleJS</a>
      <nav :class="['main-nav', { open: menuOpen }]">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/examples">Examples</a></li>
        </ul>
      </nav>
      <button 
        class="menu-toggle" 
        @click="toggleMenu"
        aria-label="Toggle navigation menu"
      >
        {{ menuOpen ? 'Close' : 'Menu' }}
      </button>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      menuOpen: false
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
  }
}
</script>
```

### The Client File

The client file handles component initialization and client-side behavior:

```typescript
import { Blueprint, BlueprintClient, events } from "asmbl";

export class MainClient extends Blueprint {
  private menuButton: HTMLElement | null = null;
  private mainNav: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Find elements
    this.menuButton = document.querySelector('.menu-toggle');
    this.mainNav = document.querySelector('.main-nav');
    
    // Set up event listeners
    if (this.menuButton) {
      this.menuButton.addEventListener('click', this.toggleMenu.bind(this));
    }
    
    // Listen for global events using proper subscribe method
    this.subscribe({ channel: 'app', topic: 'theme.change' }, this.handleThemeChange.bind(this));
    
    // Emit component ready event using proper publish method
    this.toComponents({ componentId: this.context.id }, 'header.ready');
  }
  
  private toggleMenu(): void {
    if (this.mainNav) {
      this.mainNav.classList.toggle('open');
    }
  }
  
  private handleThemeChange(event: any): void {
    // Update component based on theme change
    const { theme } = event.payload; // Use payload, not data
    this.context.element.setAttribute('data-theme', theme);
  }
  
  protected override onDestroy(): void {
    // Clean up event listeners
    if (this.menuButton) {
      this.menuButton.removeEventListener('click', this.toggleMenu.bind(this));
    }
    
    // No need to manually unsubscribe - Blueprint handles this automatically
  }
}

// Export the client class (AssembleJS will handle registration)
export default MainClient;
```

### The Styles File

The styles file contains SCSS styling that is scoped to the component:

```scss
.header-main {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    text-decoration: none;
    
    &:hover {
      color: #2563eb;
    }
  }
  
  .main-nav {
    ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    li {
      margin-left: 1.5rem;
    }
    
    a {
      color: #4b5563;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        color: #3b82f6;
      }
    }
  }
  
  .menu-toggle {
    display: none;
  }
  
  // Responsive styling
  @media (max-width: 768px) {
    .main-nav {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      background-color: #ffffff;
      height: 0;
      overflow: hidden;
      transition: height 0.3s ease;
      
      &.open {
        height: calc(100vh - 60px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      ul {
        flex-direction: column;
        padding: 1rem;
      }
      
      li {
        margin: 1rem 0;
      }
    }
    
    .menu-toggle {
      display: block;
      background: none;
      border: none;
      font-size: 1rem;
      color: #4b5563;
      cursor: pointer;
    }
  }
}
```

## Component Registration

Components are registered in the server manifest:

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
        path: 'header',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.html',
        }],
      },
      // Other components...
    ],
  }
});
```

## Using Components

Components can be included in blueprints or other components using the context API:

```tsx
export function Welcome(context: PreactViewContext) {
  return (
    <div className="home-welcome">
      {/* Include the header component */}
      <context.component.header.main />
      
      <main>
        <h1>Welcome to AssembleJS</h1>
      </main>
      
      {/* Include the footer component */}
      <context.component.footer.main />
    </div>
  );
}
```

## Component Data Flow

AssembleJS components can receive data through several mechanisms:

### 1. Factory Data

Data prepared by factories on the server:

```typescript
export class UserDataFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    const userData = await fetchUserData();
    context.data.set('user', userData);
  }
}
```

The component can then access this data:

```tsx
export function Profile(context: PreactViewContext) {
  const user = context.data.user;
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 2. Props from Parent Components

Components can receive props from parent components:

```tsx
<context.component.user.profile 
  user={currentUser}
  showEmail={true}
/>
```

### 3. URL Parameters

Components can access URL parameters:

```tsx
export function ProductDetails(context: PreactViewContext) {
  const productId = context.params.id;
  // ...
}
```

## Component Lifecycle

Components follow a well-defined lifecycle:

1. **Server Initialization**: Component is created on the server
2. **Factory Execution**: Factories run to prepare data
3. **Server Rendering**: Component is rendered to HTML
4. **Client Hydration**: Component is hydrated in the browser
5. **Mount**: `onMount()` is called, setting up event listeners
6. **Update**: Component responds to state changes and events
7. **Destroy**: `onDestroy()` is called, cleaning up resources

## Best Practices

- Keep components focused on a single responsibility
- Use factories for data fetching and preparation
- Leverage the event system for cross-component communication
- Create responsive designs with mobile-first approach
- Consider accessibility from the start
- Test components in isolation before integration

## Cross-Framework Components

One of AssembleJS's most powerful features is the ability to use different UI frameworks for different components:

```tsx
export function Dashboard(context: PreactViewContext) {
  return (
    <div className="dashboard">
      {/* Header component using HTML template */}
      <context.component.header.main />
      
      {/* Sidebar using Vue */}
      <context.component.sidebar.vue />
      
      <main>
        {/* Chart component using React */}
        <context.component.chart.react data={context.data.chartData} />
        
        {/* Data grid using Preact */}
        <context.component.datagrid.preact items={context.data.items} />
      </main>
      
      {/* Footer using HTML template */}
      <context.component.footer.main />
    </div>
  );
}
```

This allows you to choose the best tool for each component while maintaining a cohesive application.

## Next Steps

Now that you understand components, learn about the [Event System](core-concepts-event-system.md) to see how components can communicate with each other without tight coupling.