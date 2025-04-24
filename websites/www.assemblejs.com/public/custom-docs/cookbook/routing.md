# Advanced Routing

<iframe src="https://placeholder-for-assemblejs-routing-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Routing is essential for creating multi-page applications with smooth navigation. This cookbook demonstrates how to implement advanced routing patterns in AssembleJS applications, including dynamic routes, nested routes, and route guards.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Understanding of URL patterns and parameters
- Familiarity with client-side navigation concepts

## Implementation Steps

### Step 1: Create a Basic Router Configuration

First, let's create a router configuration file:

1. Use the CLI to generate a router service:

```bash
npx asm
# Select "Service" from the list
# Enter "router" as the name
# Follow the prompts
```

2. Implement the router service:

```typescript
// src/services/router.service.ts
import { Service } from 'asmbl';

export interface Route {
  path: string;
  name: string;
  guard?: (params?: Record<string, string>) => boolean | Promise<boolean>;
  children?: Route[];
}

export class RouterService extends Service {
  private routes: Route[] = [];

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.routes = [
      {
        path: '/',
        name: 'home',
      },
      {
        path: '/products',
        name: 'products',
        children: [
          {
            path: '/:productId',
            name: 'product-detail',
          }
        ]
      },
      {
        path: '/account',
        name: 'account',
        guard: () => this.isAuthenticated(),
        children: [
          {
            path: '/profile',
            name: 'profile',
          },
          {
            path: '/settings',
            name: 'settings',
          }
        ]
      },
      {
        path: '/login',
        name: 'login',
      },
      {
        path: '*',
        name: 'not-found',
      }
    ];
  }

  getRoutes(): Route[] {
    return this.routes;
  }

  getRouteByPath(path: string): Route | null {
    const findRoute = (routes: Route[], targetPath: string): Route | null => {
      for (const route of routes) {
        // Exact match
        if (route.path === targetPath) {
          return route;
        }
        
        // Check dynamic routes
        if (route.path.includes(':') && this.matchDynamicRoute(route.path, targetPath)) {
          return route;
        }
        
        // Check wildcard route
        if (route.path === '*' && targetPath !== '/') {
          return route;
        }
        
        // Check children routes
        if (route.children) {
          // If targetPath starts with route.path (excluding dynamic parts)
          const routeBasePath = route.path.split(':')[0];
          if (targetPath.startsWith(routeBasePath)) {
            const childRoute = findRoute(route.children, targetPath.slice(routeBasePath.length));
            if (childRoute) return childRoute;
          }
        }
      }
      
      return null;
    };
    
    return findRoute(this.routes, path);
  }

  matchDynamicRoute(routePath: string, actualPath: string): boolean {
    // Convert route path pattern to regex
    const pattern = routePath
      .replace(/:[^/]+/g, '([^/]+)') // Replace :param with capturing group
      .replace(/\//g, '\\/'); // Escape slashes
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(actualPath);
  }

  extractParams(routePath: string, actualPath: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    // Split paths into segments
    const routeSegments = routePath.split('/');
    const actualSegments = actualPath.split('/');
    
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      
      // Check if this segment is a parameter
      if (routeSegment.startsWith(':')) {
        const paramName = routeSegment.slice(1); // Remove the colon
        params[paramName] = actualSegments[i];
      }
    }
    
    return params;
  }

  async canActivate(route: Route, params?: Record<string, string>): Promise<boolean> {
    if (!route.guard) return true;
    
    try {
      return await route.guard(params);
    } catch (error) {
      console.error('Route guard error:', error);
      return false;
    }
  }

  // In a real application, this would check authentication state
  private isAuthenticated(): boolean {
    return false; // For demonstration purposes
  }
}
```

### Step 2: Create a Navigation Component

Let's create a navigation component to help users move through our routes:

```bash
npx asm
# Select "Component" from the list
# Enter "navigation/main" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/navigation/main/main.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { RouterService, Route } from '../../../services/router.service';

export class NavigationFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const routerService = context.services.get('routerService') as RouterService;
    
    // Get all top-level routes (not including children)
    const routes = routerService.getRoutes().filter(route => 
      route.path !== '*' && 
      !route.path.includes(':') && 
      !route.path.includes('*')
    );
    
    context.data.set('routes', routes);
    context.data.set('currentPath', context.request.path);
  }
}
```

Now, implement the view:

```tsx
// src/components/navigation/main/main.view.tsx
import React from 'react';
import { Route } from '../../../services/router.service';

interface NavigationProps {
  data: {
    routes: Route[];
    currentPath: string;
  };
}

const Navigation: React.FC<NavigationProps> = ({ data }) => {
  const { routes, currentPath } = data;
  
  return (
    <nav className="main-navigation">
      <ul className="nav-list">
        {routes.map(route => (
          <li 
            key={route.name} 
            className={`nav-item ${currentPath === route.path ? 'active' : ''}`}
          >
            <a href={route.path} className="nav-link">
              {route.name.charAt(0).toUpperCase() + route.name.slice(1)}
            </a>
            
            {route.children && route.children.length > 0 && (
              <ul className="subnav-list">
                {route.children
                  .filter(child => !child.path.includes(':'))
                  .map(child => (
                    <li key={child.name} className="subnav-item">
                      <a 
                        href={`${route.path}${child.path}`} 
                        className="subnav-link"
                      >
                        {child.name.charAt(0).toUpperCase() + child.name.slice(1)}
                      </a>
                    </li>
                  ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
```

Add some styles for the navigation:

```scss
// src/components/navigation/main/main.styles.scss
.main-navigation {
  background-color: #2c3e50;
  padding: 0;
  margin: 0;
  
  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    
    .nav-item {
      position: relative;
      
      &:hover .subnav-list {
        display: block;
      }
      
      &.active .nav-link {
        background-color: #1a2530;
        
        &:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #3498db;
        }
      }
    }
    
    .nav-link {
      display: block;
      padding: 15px 20px;
      color: white;
      text-decoration: none;
      position: relative;
      
      &:hover {
        background-color: #34495e;
      }
    }
    
    .subnav-list {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background-color: #34495e;
      min-width: 180px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      z-index: 10;
      padding: 0;
      
      .subnav-item {
        display: block;
        
        .subnav-link {
          display: block;
          padding: 12px 20px;
          color: white;
          text-decoration: none;
          
          &:hover {
            background-color: #2c3e50;
          }
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .nav-list {
      flex-direction: column;
      
      .subnav-list {
        position: static;
        display: block;
        box-shadow: none;
        background-color: #2c3e50;
        
        .subnav-item .subnav-link {
          padding-left: 40px;
        }
      }
    }
  }
}
```

### Step 3: Implement Client-Side Navigation

To enhance the user experience, let's add client-side navigation:

```typescript
// src/components/navigation/main/main.client.ts
import { Blueprint } from 'asmbl';

export class NavigationClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Intercept all navigation link clicks
    this.root.querySelectorAll('.nav-link, .subnav-link').forEach(link => {
      link.addEventListener('click', this.handleLinkClick.bind(this));
    });
  }
  
  private handleLinkClick(event: Event): void {
    event.preventDefault();
    
    const link = event.currentTarget as HTMLAnchorElement;
    const url = link.getAttribute('href');
    
    if (!url) return;
    
    // Update URL without full page reload
    window.history.pushState({}, '', url);
    
    // Dispatch a custom event for the router to handle
    const navigationEvent = new CustomEvent('navigation:change', {
      detail: { url }
    });
    document.dispatchEvent(navigationEvent);
  }
}

export default NavigationClient;
```

### Step 4: Create a Router Controller

Now, let's create a controller to handle server-side routing:

```bash
npx asm
# Select "Controller" from the list
# Enter "router" as the name
# Follow the prompts
```

Implement the router controller:

```typescript
// src/controllers/router.controller.ts
import { BlueprintController } from 'asmbl';
import { RouterService } from '../services/router.service';

export class RouterController extends BlueprintController {
  private routerService: RouterService;

  constructor() {
    super();
  }

  override onRegister(): void {
    super.onRegister();
    
    this.routerService = this.services.get('routerService') as RouterService;
    
    // Register not-found handler
    this.server.setNotFoundHandler(this.handleNotFound.bind(this));
    
    // Register route guards for all routes
    this.server.addHook('preHandler', this.routeGuardHook.bind(this));
  }

  private async routeGuardHook(request, reply) {
    const path = request.url.split('?')[0]; // Remove query parameters
    const route = this.routerService.getRouteByPath(path);
    
    if (route && route.guard) {
      const params = this.routerService.extractParams(route.path, path);
      const canActivate = await this.routerService.canActivate(route, params);
      
      if (!canActivate) {
        // Redirect to login if route is protected
        reply.redirect('/login?returnUrl=' + encodeURIComponent(path));
        return reply;
      }
    }
  }

  private async handleNotFound(request, reply) {
    // Check if this is an API request
    if (request.url.startsWith('/api/')) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }
    
    // For page requests, render the not-found blueprint
    return reply.view('not-found/main');
  }
}
```

### Step 5: Create Blueprint Pages

Let's create blueprint pages for our routes:

```bash
# For each blueprint, run:
npx asm
# Select "Blueprint" from the list
# Enter the blueprint name (e.g., "home", "products", etc.)
# Follow the prompts
#
# Repeat for all required blueprints:
# - home
# - products
# - product-detail
# - account
# - login
# - not-found
```

For example, the home blueprint:

```tsx
// src/blueprints/home/main/main.view.tsx
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Advanced Routing Demo</h1>
        <p>Learn how to implement client-side navigation and route guards in AssembleJS</p>
      </div>
      
      <div className="features-section">
        <div className="feature">
          <h2>Dynamic Routes</h2>
          <p>Handle parameterized routes like product details</p>
        </div>
        
        <div className="feature">
          <h2>Protected Routes</h2>
          <p>Create secure areas with authentication checks</p>
        </div>
        
        <div className="feature">
          <h2>Client Navigation</h2>
          <p>Implement fast page transitions without full reload</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
```

The product detail blueprint with route parameters:

```tsx
// src/blueprints/product-detail/main/main.view.tsx
import React from 'react';

interface ProductDetailProps {
  params: {
    productId: string;
  };
}

const ProductDetail: React.FC<ProductDetailProps> = ({ params }) => {
  const { productId } = params;
  
  return (
    <div className="product-detail-page">
      <h1>Product Details</h1>
      <div className="product-card">
        <div className="product-header">
          <h2>Product ID: {productId}</h2>
          <span className="product-badge">In Stock</span>
        </div>
        
        <div className="product-image">
          <img src={`/assets/products/${productId}.jpg`} alt="Product" />
        </div>
        
        <div className="product-info">
          <p className="product-description">
            This is a detailed description of the product with ID {productId}. 
            The product information is being displayed using dynamic route parameters.
          </p>
          
          <div className="product-meta">
            <span className="product-price">$99.99</span>
            <button className="add-to-cart-button">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
```

And the login blueprint with redirect:

```tsx
// src/blueprints/login/main/main.view.tsx
import React from 'react';

interface LoginProps {
  query: {
    returnUrl?: string;
  };
}

const Login: React.FC<LoginProps> = ({ query }) => {
  const { returnUrl } = query;
  
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>
        <p className="login-message">
          {returnUrl 
            ? 'Please log in to access the requested page' 
            : 'Please log in to your account'}
        </p>
        
        <form className="login-form" action="/api/login" method="POST">
          {returnUrl && (
            <input type="hidden" name="returnUrl" value={returnUrl} />
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="login-button">Log In</button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account? <a href="/register">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### Step 6: Implement a Router Blueprint

Create a main layout blueprint to handle client-side routing:

```bash
asm generate blueprint layout
```

Implement the layout:

```tsx
// src/blueprints/layout/main/main.view.tsx
import React from 'react';

const Layout: React.FC = () => {
  return (
    <div className="app-layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <a href="/">AssembleJS Routing</a>
          </div>
          <div className="navigation-container" data-component="navigation/main"></div>
        </div>
      </header>
      
      <main className="main-content" id="router-outlet">
        <!-- Content will be rendered here -->
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2023 AssembleJS Routing Demo</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
```

Add a client-side router implementation:

```typescript
// src/blueprints/layout/main/main.client.ts
import { Blueprint } from 'asmbl';

export class LayoutClient extends Blueprint {
  private routerOutlet: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get router outlet element
    this.routerOutlet = document.getElementById('router-outlet');
    
    // Set up navigation event listeners
    document.addEventListener('navigation:change', this.handleNavigation.bind(this));
    
    // Handle back/forward browser buttons
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }
  
  private async handleNavigation(event: CustomEvent): Promise<void> {
    const { url } = event.detail;
    await this.navigateTo(url);
  }
  
  private async handlePopState(): Promise<void> {
    await this.navigateTo(window.location.pathname);
  }
  
  private async navigateTo(url: string): Promise<void> {
    if (!this.routerOutlet) return;
    
    try {
      // Show loading state
      this.routerOutlet.innerHTML = '<div class="loading-indicator">Loading...</div>';
      
      // Fetch page content
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.redirected) {
        // Handle redirects (like from route guards)
        window.location.href = response.url;
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Navigation failed: ${response.status} ${response.statusText}`);
      }
      
      // Get content HTML
      const html = await response.text();
      
      // Update content and scroll to top
      this.routerOutlet.innerHTML = html;
      window.scrollTo(0, 0);
      
      // Update active navigation
      this.updateActiveNavigation(url);
      
      // Execute scripts in the new content
      this.executeScripts();
    } catch (error) {
      console.error('Navigation error:', error);
      this.routerOutlet.innerHTML = '<div class="error-message">Navigation failed. Please try again.</div>';
    }
  }
  
  private updateActiveNavigation(url: string): void {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Find and mark the active nav item
    document.querySelectorAll('.nav-link, .subnav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === url) {
        const navItem = (link as HTMLElement).closest('.nav-item');
        if (navItem) navItem.classList.add('active');
      }
    });
  }
  
  private executeScripts(): void {
    if (!this.routerOutlet) return;
    
    // Find all script tags in the new content
    const scripts = this.routerOutlet.querySelectorAll('script');
    
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      
      // Copy all attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy content
      newScript.textContent = oldScript.textContent;
      
      // Replace old script with new one to execute it
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }
}

export default LayoutClient;
```

### Step 7: Register Components, Blueprints, and Services

Update your server.ts to include all the new components, blueprints, and services:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { RouterService } from "./services/router.service";
import { NavigationFactory } from "./components/navigation/main/main.factory";
import { RouterController } from "./controllers/router.controller";

// Create router service
const routerService = new RouterService();

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'navigation/main',
        views: [{
          viewName: 'default',
          templateFile: 'main.view.tsx',
          factory: new NavigationFactory()
        }]
      }
    ],
    blueprints: [
      {
        path: 'layout',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/*'
        }]
      },
      {
        path: 'home',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/'
        }]
      },
      {
        path: 'products',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/products'
        }]
      },
      {
        path: 'product-detail',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/products/:productId'
        }]
      },
      {
        path: 'account',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/account'
        }]
      },
      {
        path: 'login',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/login'
        }]
      },
      {
        path: 'not-found',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '*'
        }]
      }
    ],
    services: [
      {
        name: 'routerService',
        service: routerService
      }
    ],
    controllers: [
      new RouterController()
    ]
  }
});
```

## Advanced Topics

### Code Splitting for Routes

To optimize performance, you can implement code splitting for routes:

```typescript
// src/services/lazy-loader.service.ts
import { Service } from 'asmbl';

export class LazyLoaderService extends Service {
  private loadedModules: Record<string, any> = {};

  async loadModule(modulePath: string): Promise<any> {
    // Check if module is already loaded
    if (this.loadedModules[modulePath]) {
      return this.loadedModules[modulePath];
    }

    try {
      // Dynamic import for code splitting
      const module = await import(/* webpackChunkName: "[request]" */ `../modules/${modulePath}`);
      this.loadedModules[modulePath] = module.default || module;
      return this.loadedModules[modulePath];
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }
}
```

### Route Transition Animations

Enhance user experience with route transition animations:

```typescript
// Add to src/blueprints/layout/main/main.client.ts
private async navigateTo(url: string): Promise<void> {
  if (!this.routerOutlet) return;
  
  try {
    // Start exit animation
    this.routerOutlet.classList.add('page-exit');
    
    // Wait for exit animation to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Show loading state
    this.routerOutlet.innerHTML = '<div class="loading-indicator">Loading...</div>';
    
    // Fetch page content
    const response = await fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    // ... rest of the navigation logic
    
    // Prepare for entrance animation
    this.routerOutlet.classList.remove('page-exit');
    this.routerOutlet.classList.add('page-enter');
    
    // Update content and scroll to top
    this.routerOutlet.innerHTML = html;
    window.scrollTo(0, 0);
    
    // Trigger entrance animation
    setTimeout(() => {
      this.routerOutlet?.classList.remove('page-enter');
    }, 50);
    
    // ... rest of the method
  } catch (error) {
    // ... error handling
  }
}
```

Add the corresponding CSS:

```css
/* Add to src/blueprints/layout/main/main.styles.scss */
.main-content {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-exit {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter {
  opacity: 0;
  transform: translateY(-10px);
}
```

### Route-Based Meta Data and SEO

Implement a system for route-specific meta data:

```typescript
// Add to src/services/router.service.ts
export interface RouteMeta {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export interface Route {
  path: string;
  name: string;
  guard?: (params?: Record<string, string>) => boolean | Promise<boolean>;
  children?: Route[];
  meta?: RouteMeta;
}

// Update initializeRoutes method:
private initializeRoutes(): void {
  this.routes = [
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'AssembleJS Routing - Home',
        description: 'Learn about advanced routing in AssembleJS applications',
        keywords: 'assemblejs, routing, SPA, navigation'
      }
    },
    {
      path: '/products',
      name: 'products',
      meta: {
        title: 'Product Catalog - AssembleJS Routing',
        description: 'Browse our product catalog',
        keywords: 'products, catalog, assemblejs'
      },
      children: [
        {
          path: '/:productId',
          name: 'product-detail',
          // Meta will be dynamically generated for product details
        }
      ]
    },
    // ... other routes
  ];
}

// Add method to get meta data:
getRouteMetaData(path: string, params?: Record<string, string>): RouteMeta {
  const route = this.getRouteByPath(path);
  
  if (!route) {
    return {
      title: 'Page Not Found - AssembleJS Routing',
      description: 'The requested page could not be found'
    };
  }
  
  // For dynamic routes, we might want to customize meta data:
  if (route.name === 'product-detail' && params?.productId) {
    return {
      title: `Product ${params.productId} - AssembleJS Routing`,
      description: `Details for product ${params.productId}`,
      keywords: `product ${params.productId}, details, specifications`
    };
  }
  
  return route.meta || {
    title: 'AssembleJS Routing'
  };
}
```

Then update your layout client to set meta tags:

```typescript
// Add to src/blueprints/layout/main/main.client.ts
private updateMetaTags(url: string): void {
  const routerService = this.services.get('routerService');
  if (!routerService) return;
  
  const params = {}; // Extract params from URL
  const meta = routerService.getRouteMetaData(url, params);
  
  // Update document title
  document.title = meta.title;
  
  // Update meta tags
  this.updateMetaTag('description', meta.description || '');
  this.updateMetaTag('keywords', meta.keywords || '');
  
  // Update Open Graph tags
  this.updateMetaTag('og:title', meta.title);
  this.updateMetaTag('og:description', meta.description || '');
  if (meta.ogImage) {
    this.updateMetaTag('og:image', meta.ogImage);
  }
}

private updateMetaTag(name: string, content: string): void {
  // Find existing meta tag
  let metaTag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  if (metaTag) {
    // Update existing tag
    metaTag.setAttribute('content', content);
  } else {
    // Create new tag
    metaTag = document.createElement('meta');
    const isProperty = name.startsWith('og:');
    
    if (isProperty) {
      metaTag.setAttribute('property', name);
    } else {
      metaTag.setAttribute('name', name);
    }
    
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
  }
}
```

## Conclusion

This cookbook has demonstrated how to implement advanced routing patterns in AssembleJS. We've covered creating a router service, implementing client-side navigation, handling dynamic routes with parameters, protecting routes with guards, and enhancing the user experience with transitions and optimizations.

By following these patterns, you can build complex, multi-page applications with smooth navigation experiences. The advanced topics covered code splitting, animations, and SEO optimizations to further improve your routes.

Routing is a fundamental aspect of modern web applications, and proper implementation ensures users can navigate your application efficiently while maintaining good performance and user experience.