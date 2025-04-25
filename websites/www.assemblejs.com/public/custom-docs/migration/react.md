# Migrating from React to AssembleJS

This guide provides a comprehensive approach to migrating your React application to AssembleJS. It covers the key differences, migration strategies, and practical examples to help you transition smoothly.

## Key Differences Between React and AssembleJS

### Architecture Approach

| React | AssembleJS |
|-------|------------|
| Component-based | Component and Blueprint-based |
| Virtual DOM diffing | Islands Architecture with selective hydration |
| Single framework | Multi-framework support |
| Client-side focus with SSR options | Server-first with selective client hydration |
| Global state management via context or libraries | Built-in event system for cross-component communication |

### Performance Considerations

| React | AssembleJS |
|-------|------------|
| Full application hydration | Selective component hydration |
| Component-level code splitting | Automatic fine-grained code splitting |
| React-specific optimizations | Framework-agnostic optimizations |
| Manual memoization | Automatic DOM updates optimization |
| Large JavaScript payload | Minimal JavaScript payload |

### Developer Experience

| React | AssembleJS |
|-------|------------|
| React-specific hooks and patterns | Framework-agnostic component model |
| JSX templates | Multiple templating options (JSX, HTML, etc.) |
| Component composition | Component and Blueprint composition |
| React component lifecycle | AssembleJS component lifecycle |
| React-specific libraries | Framework-agnostic libraries or adapters |

## Migration Planning

### Assessment Phase

1. **Project Audit**
   - Identify all components and their responsibilities
   - Analyze component dependencies and relationships
   - Review state management patterns
   - List third-party dependencies
   - Measure bundle sizes and performance metrics

2. **Component Classification**
   - Identify stateless components suitable for direct migration
   - List stateful components needing refactoring
   - Determine which components should be server-rendered
   - Identify client-interactive components for selective hydration

3. **State Management Analysis**
   - Map React state management to AssembleJS patterns
   - Plan event-based communication between components
   - Determine factory data preparation strategy

### Migration Strategy Options

1. **Incremental Migration**
   - Migrate one component or feature at a time
   - Use React as a rendering option within AssembleJS
   - Gradually transition to AssembleJS's server-first approach
   - Incrementally adopt the event system

2. **Parallel Implementation**
   - Create a new AssembleJS application
   - Implement key features in AssembleJS
   - Run both applications in parallel
   - Gradually shift traffic from React to AssembleJS

3. **Component Wrapper Approach**
   - Create AssembleJS wrappers around existing React components
   - Migrate the data flow to factories and events
   - Replace React components with native AssembleJS components over time

## Step-by-Step Migration Guide

### 1. Setup AssembleJS Project

```bash
# Create a new AssembleJS project
npx asmgen
# Select "Project" from the list
# Enter your project name
# Follow the prompts
```

### 2. Migrating React Components to AssembleJS Components

React components can be migrated to AssembleJS components in several ways:

#### Simple Stateless Components

**React Component:**

```jsx
// Header.jsx
import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <header className="site-header">
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
```

**AssembleJS Component:**

```tsx
// src/components/common/header/header.view.tsx
import { h } from 'preact';

const Header = ({ data }) => {
  const { title, subtitle } = data;
  
  return (
    <header className="site-header">
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
```

```typescript
// src/components/common/header/header.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class HeaderFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Add data to the component context
    context.data.set('title', context.params.title || 'Default Title');
    context.data.set('subtitle', context.params.subtitle);
  }
}
```

#### Stateful Components

**React Component:**

```jsx
// Counter.jsx
import React, { useState } from 'react';

const Counter = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);
  
  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };
  
  const decrement = () => {
    setCount(prevCount => Math.max(0, prevCount - 1));
  };
  
  return (
    <div className="counter">
      <p>Count: {count}</p>
      <div className="counter-controls">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
};

export default Counter;
```

**AssembleJS Component:**

```tsx
// src/components/common/counter/counter.view.tsx
import { h } from 'preact';

const Counter = ({ data }) => {
  const { initialCount } = data;
  
  return (
    <div className="counter">
      <p>Count: <span className="count-display">{initialCount}</span></p>
      <div className="counter-controls">
        <button className="decrement">-</button>
        <button className="increment">+</button>
      </div>
    </div>
  );
};

export default Counter;
```

```typescript
// src/components/common/counter/counter.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class CounterFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Add data to the component context
    context.data.set('initialCount', context.params.initialCount || 0);
  }
}
```

```typescript
// src/components/common/counter/counter.client.ts
import { Blueprint } from 'asmbl';

class CounterComponent extends Blueprint {
  private count: number;
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize count from server-rendered value
    const countDisplay = this.element.querySelector('.count-display');
    this.count = parseInt(countDisplay?.textContent || '0', 10);
    
    // Get references to buttons
    const decrementButton = this.element.querySelector('.decrement');
    const incrementButton = this.element.querySelector('.increment');
    
    // Add event listeners
    decrementButton?.addEventListener('click', () => this.decrement());
    incrementButton?.addEventListener('click', () => this.increment());
  }
  
  private increment(): void {
    this.count++;
    this.updateDisplay();
  }
  
  private decrement(): void {
    this.count = Math.max(0, this.count - 1);
    this.updateDisplay();
  }
  
  private updateDisplay(): void {
    const countDisplay = this.element.querySelector('.count-display');
    if (countDisplay) {
      countDisplay.textContent = this.count.toString();
    }
  }
}

export default CounterComponent;
```

### 3. Migrating Complex Components with Children

**React Component:**

```jsx
// Card.jsx
import React from 'react';

const Card = ({ title, children, footer }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
```

**AssembleJS Component:**

```tsx
// src/components/common/card/card.view.tsx
import { h } from 'preact';

const Card = ({ data, children }) => {
  const { title, footer } = data;
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer" dangerouslySetInnerHTML={{ __html: footer }} />
      )}
    </div>
  );
};

export default Card;
```

```typescript
// src/components/common/card/card.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class CardFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Add data to the component context
    context.data.set('title', context.params.title || '');
    context.data.set('footer', context.params.footer || null);
  }
}
```

### 4. Migrating State Management

#### React Context API

**React Context:**

```jsx
// ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

**AssembleJS Event System:**

```typescript
// src/components/theme/switcher/switcher.client.ts
import { Blueprint } from 'asmbl';

class ThemeSwitcherComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Initialize theme from server or localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    
    // Get reference to toggle button
    const toggleButton = this.element.querySelector('.theme-toggle');
    
    // Add event listener
    toggleButton?.addEventListener('click', () => {
      const oldTheme = document.body.getAttribute('data-theme');
      const newTheme = oldTheme === 'light' ? 'dark' : 'light';
      
      // Update theme
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Publish event to notify other components
      this.eventBus.publish('theme:changed', { theme: newTheme });
    });
    
    // Subscribe to theme change events from other components
    this.eventBus.subscribe('theme:changed', (data) => {
      document.body.setAttribute('data-theme', data.theme);
      localStorage.setItem('theme', data.theme);
    });
  }
}

export default ThemeSwitcherComponent;
```

#### Redux State Management

**React Redux:**

```jsx
// counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: state => {
      state.value += 1;
    },
    decrement: state => {
      state.value = Math.max(0, state.value - 1);
    }
  }
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
```

**AssembleJS Event-Based Approach:**

```typescript
// src/components/counter/complex/complex.client.ts
import { Blueprint } from 'asmbl';

class ComplexCounterComponent extends Blueprint {
  private count: number;
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize count from server-rendered value
    const countDisplay = this.element.querySelector('.count-display');
    this.count = parseInt(countDisplay?.textContent || '0', 10);
    
    // Get references to buttons
    const decrementButton = this.element.querySelector('.decrement');
    const incrementButton = this.element.querySelector('.increment');
    
    // Add event listeners
    decrementButton?.addEventListener('click', () => {
      this.count = Math.max(0, this.count - 1);
      this.updateDisplay();
      
      // Publish event for other components
      this.eventBus.publish('counter:changed', { value: this.count });
    });
    
    incrementButton?.addEventListener('click', () => {
      this.count++;
      this.updateDisplay();
      
      // Publish event for other components
      this.eventBus.publish('counter:changed', { value: this.count });
    });
    
    // Subscribe to counter change events from other components
    this.eventBus.subscribe('counter:changed', (data) => {
      this.count = data.value;
      this.updateDisplay();
    });
  }
  
  private updateDisplay(): void {
    const countDisplay = this.element.querySelector('.count-display');
    if (countDisplay) {
      countDisplay.textContent = this.count.toString();
    }
  }
}

export default ComplexCounterComponent;
```

### 5. Migrating React Hooks

#### useState and useEffect

**React Component with Hooks:**

```jsx
// ProductDetails.jsx
import React, { useState, useEffect } from 'react';

const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return null;
  
  return (
    <div className="product-details">
      <h2>{product.name}</h2>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="description">{product.description}</p>
      {/* More product details */}
    </div>
  );
};

export default ProductDetails;
```

**AssembleJS Component:**

```typescript
// src/components/product/details/details.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ProductDetailsFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    try {
      // Fetch product data on the server
      const productId = context.params.productId;
      const product = await this.fetchProduct(productId);
      
      // Add data to the component context
      context.data.set('product', product);
      context.data.set('error', null);
    } catch (error) {
      // Handle error
      context.data.set('product', null);
      context.data.set('error', error.message);
    }
  }
  
  private async fetchProduct(productId) {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  }
}
```

```tsx
// src/components/product/details/details.view.tsx
import { h } from 'preact';

const ProductDetails = ({ data }) => {
  const { product, error } = data;
  
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return null;
  
  return (
    <div className="product-details">
      <h2>{product.name}</h2>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="description">{product.description}</p>
      {/* More product details */}
    </div>
  );
};

export default ProductDetails;
```

```typescript
// src/components/product/details/details.client.ts
import { Blueprint } from 'asmbl';

class ProductDetailsComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Add client-side interactivity if needed
    // For example, handling product variant selection
    const variantSelectors = this.element.querySelectorAll('.variant-selector');
    
    variantSelectors.forEach(selector => {
      selector.addEventListener('change', (event) => {
        const variantId = (event.target as HTMLSelectElement).value;
        this.updateProductVariant(variantId);
      });
    });
  }
  
  private updateProductVariant(variantId: string): void {
    // Implementation
  }
}

export default ProductDetailsComponent;
```

#### useRef and useMemo

**React Component with useRef and useMemo:**

```jsx
// DataTable.jsx
import React, { useState, useRef, useMemo } from 'react';

const DataTable = ({ data, searchable = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  
  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const focusSearch = () => {
    searchInputRef.current.focus();
  };
  
  return (
    <div className="data-table-container">
      {searchable && (
        <div className="search-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={focusSearch}>Focus Search</button>
        </div>
      )}
      
      <table className="data-table">
        <thead>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map(key => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              {Object.values(item).map((value, valueIndex) => (
                <td key={valueIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
```

**AssembleJS Component:**

```tsx
// src/components/common/data-table/data-table.view.tsx
import { h } from 'preact';

const DataTable = ({ data }) => {
  const { tableData, searchable } = data;
  
  // Render the initial state
  return (
    <div className="data-table-container">
      {searchable && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <button className="focus-search">Focus Search</button>
        </div>
      )}
      
      <table className="data-table">
        <thead>
          <tr>
            {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {tableData.map((item, index) => (
            <tr key={index}>
              {Object.values(item).map((value, valueIndex) => (
                <td key={valueIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
```

```typescript
// src/components/common/data-table/data-table.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class DataTableFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Add data to the component context
    context.data.set('tableData', context.params.data || []);
    context.data.set('searchable', context.params.searchable !== false);
  }
}
```

```typescript
// src/components/common/data-table/data-table.client.ts
import { Blueprint } from 'asmbl';

class DataTableComponent extends Blueprint {
  private tableData: any[] = [];
  private searchInput: HTMLInputElement | null = null;
  private tableBody: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Store the original data
    this.tableData = Array.from(this.context.data.tableData || []);
    
    // Get references
    this.searchInput = this.element.querySelector('.search-input');
    this.tableBody = this.element.querySelector('.table-body');
    const focusButton = this.element.querySelector('.focus-search');
    
    // Add event listeners
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.handleSearch());
    }
    
    if (focusButton) {
      focusButton.addEventListener('click', () => this.focusSearch());
    }
  }
  
  private handleSearch(): void {
    if (!this.searchInput || !this.tableBody) return;
    
    const searchTerm = this.searchInput.value.toLowerCase();
    
    // Filter the data
    const filteredData = searchTerm === '' 
      ? this.tableData 
      : this.tableData.filter(item => 
          Object.values(item).some(value => 
            String(value).toLowerCase().includes(searchTerm)
          )
        );
    
    // Update the table
    this.renderTableRows(filteredData);
  }
  
  private renderTableRows(data: any[]): void {
    if (!this.tableBody) return;
    
    // Clear the table
    this.tableBody.innerHTML = '';
    
    // Create new rows
    data.forEach((item, index) => {
      const tr = document.createElement('tr');
      
      Object.values(item).forEach((value, valueIndex) => {
        const td = document.createElement('td');
        td.textContent = String(value);
        tr.appendChild(td);
      });
      
      this.tableBody!.appendChild(tr);
    });
  }
  
  private focusSearch(): void {
    this.searchInput?.focus();
  }
}

export default DataTableComponent;
```

### 6. Migrating React Router

**React Router:**

```jsx
// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**AssembleJS Controllers:**

```typescript
// src/controllers/home.controller.ts
import { BlueprintController } from 'asmbl';

export class HomeController extends BlueprintController {
  async get(request, reply) {
    return this.renderBlueprint(reply, {
      components: [
        { name: 'home-hero' },
        { name: 'home-features' },
        // Other components for the home page
      ]
    });
  }
}
```

```typescript
// src/controllers/about.controller.ts
import { BlueprintController } from 'asmbl';

export class AboutController extends BlueprintController {
  async get(request, reply) {
    return this.renderBlueprint(reply, {
      components: [
        { name: 'about-content' },
        { name: 'about-team' },
        // Other components for the about page
      ]
    });
  }
}
```

```typescript
// src/controllers/product-list.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductListController extends BlueprintController {
  async get(request, reply) {
    return this.renderBlueprint(reply, {
      components: [
        { name: 'product-filter' },
        { name: 'product-grid' },
        // Other components for the product list page
      ]
    });
  }
}
```

```typescript
// src/controllers/product-detail.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductDetailController extends BlueprintController {
  async get(request, reply) {
    const { id } = request.params;
    
    return this.renderBlueprint(reply, {
      components: [
        { 
          name: 'product-details',
          params: { productId: id }
        },
        { 
          name: 'related-products',
          params: { productId: id }
        },
        // Other components for the product detail page
      ]
    });
  }
}
```

For client-side navigation in AssembleJS:

```typescript
// src/components/navigation/main/main.client.ts
import { Blueprint } from 'asmbl';

class NavigationComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Set up client-side navigation
    const links = this.element.querySelectorAll('a[data-client-nav]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (!href) return;
        
        // Update browser history
        window.history.pushState({}, '', href);
        
        // Publish a navigation event
        this.eventBus.publish('navigation:changed', { path: href });
      });
    });
    
    // Listen for browser back/forward
    window.addEventListener('popstate', () => {
      this.eventBus.publish('navigation:changed', { path: window.location.pathname });
    });
  }
}

export default NavigationComponent;
```

## Advanced Migration Topics

### Handling React Portals

**React Portal:**

```jsx
// Modal.jsx
import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>Close</button>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
```

**AssembleJS Approach:**

```tsx
// src/components/common/modal/modal.view.tsx
import { h } from 'preact';

const Modal = ({ data }) => {
  const { isOpen, content } = data;
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-container">
      <div className="modal">
        <button className="close-button">Close</button>
        <div className="modal-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default Modal;
```

```typescript
// src/components/common/modal/modal.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ModalFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    context.data.set('isOpen', context.params.isOpen || false);
    context.data.set('content', context.params.content || '');
  }
}
```

```typescript
// src/components/common/modal/modal.client.ts
import { Blueprint } from 'asmbl';

class ModalComponent extends Blueprint {
  private modalContainer: HTMLElement | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get references
    this.modalContainer = this.element.querySelector('.modal-container');
    const closeButton = this.element.querySelector('.close-button');
    
    // Add event listeners
    closeButton?.addEventListener('click', () => this.closeModal());
    
    // Move modal to body for portal-like behavior
    if (this.modalContainer) {
      document.body.appendChild(this.modalContainer);
    }
    
    // Listen for modal open/close events
    this.eventBus.subscribe('modal:open', (data) => this.openModal(data.content));
    this.eventBus.subscribe('modal:close', () => this.closeModal());
  }
  
  protected override onDestroy(): void {
    super.onDestroy();
    
    // Clean up the appended modal
    if (this.modalContainer && document.body.contains(this.modalContainer)) {
      document.body.removeChild(this.modalContainer);
    }
  }
  
  private openModal(content: string): void {
    if (!this.modalContainer) return;
    
    // Update content
    const contentEl = this.modalContainer.querySelector('.modal-content');
    if (contentEl) {
      contentEl.innerHTML = content;
    }
    
    // Show modal
    this.modalContainer.style.display = 'block';
  }
  
  private closeModal(): void {
    if (!this.modalContainer) return;
    
    // Hide modal
    this.modalContainer.style.display = 'none';
    
    // Notify other components
    this.eventBus.publish('modal:closed', {});
  }
}

export default ModalComponent;
```

### Handling React Context and HOCs

**React Context and HOC:**

```jsx
// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for user on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  };
  
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// HOC for protected routes
export const withAuth = (Component) => {
  return (props) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please log in to access this page</div>;
    
    return <Component {...props} user={user} />;
  };
};
```

**AssembleJS Approach:**

```typescript
// src/services/auth.service.ts
import { Service } from 'asmbl';

export class AuthService extends Service {
  async checkAuth(request) {
    // Check authentication
    const token = this.getTokenFromRequest(request);
    
    if (!token) {
      return { isAuthenticated: false };
    }
    
    try {
      const user = await this.validateToken(token);
      return { isAuthenticated: true, user };
    } catch (error) {
      return { isAuthenticated: false, error: error.message };
    }
  }
  
  private getTokenFromRequest(request) {
    // Get token from cookies or headers
    return request.cookies.token || request.headers.authorization?.split(' ')[1];
  }
  
  private async validateToken(token) {
    // Validate token and return user
    const response = await fetch('/api/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      throw new Error('Invalid token');
    }
    
    const data = await response.json();
    return data.user;
  }
  
  async login(credentials) {
    // Implementation
  }
  
  async logout() {
    // Implementation
  }
}
```

```typescript
// src/controllers/protected.controller.ts
import { BlueprintController } from 'asmbl';
import { AuthService } from '../services/auth.service';

export class ProtectedController extends BlueprintController {
  private authService: AuthService;
  
  constructor() {
    super();
    this.authService = this.getService(AuthService);
  }
  
  async get(request, reply) {
    // Check authentication
    const { isAuthenticated, user, error } = await this.authService.checkAuth(request);
    
    if (!isAuthenticated) {
      // Redirect to login
      return reply.redirect('/login?returnUrl=' + encodeURIComponent(request.url));
    }
    
    // Render protected page
    return this.renderBlueprint(reply, {
      components: [
        // Protected components
        {
          name: 'user-dashboard',
          params: { user }
        }
      ]
    });
  }
}
```

```typescript
// src/components/auth/user-info/user-info.client.ts
import { Blueprint } from 'asmbl';

class UserInfoComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Subscribe to auth events
    this.eventBus.subscribe('auth:login', (data) => this.updateUserInfo(data.user));
    this.eventBus.subscribe('auth:logout', () => this.handleLogout());
    
    // Set up logout button
    const logoutButton = this.element.querySelector('.logout-button');
    logoutButton?.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        this.eventBus.publish('auth:logout', {});
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }
  
  private updateUserInfo(user) {
    // Update user info UI
    const nameElement = this.element.querySelector('.user-name');
    if (nameElement) {
      nameElement.textContent = user.name;
    }
  }
  
  private handleLogout() {
    // Redirect to login page
    window.location.href = '/login';
  }
}

export default UserInfoComponent;
```

## Testing Your Migration

1. **Unit Tests**: Update your unit tests to match the new component structure
2. **Integration Tests**: Test the interaction between components and the event system
3. **End-to-End Tests**: Verify the complete user flows
4. **Performance Testing**: Compare performance metrics before and after migration
5. **Visual Regression Testing**: Ensure the UI remains consistent

## Common Challenges and Solutions

### Challenge: React Ecosystem Dependencies

React has a large ecosystem of libraries that may not directly work with AssembleJS.

**Solution:**
- Look for framework-agnostic alternatives
- Create adapter components
- Use the React renderer in AssembleJS for critical components

### Challenge: Team Familiarity with React

Your team may be more familiar with React patterns and concepts.

**Solution:**
- Provide training on AssembleJS concepts
- Document migration patterns for common React patterns
- Migrate incrementally to allow gradual learning

### Challenge: Complex React Component Logic

Some React components may have complex logic that's hard to migrate.

**Solution:**
- Break down complex components into smaller, more focused components
- Move business logic to factories and services
- Use the event system for complex interactions

## Conclusion

Migrating from React to AssembleJS requires thoughtful planning and execution, but offers significant benefits in terms of performance, flexibility, and framework independence. By following this guide, you can leverage the strengths of AssembleJS while maintaining the core functionality and user experience of your React application.

Remember to:
- Start with a thorough assessment
- Choose the appropriate migration strategy
- Migrate components in logical groupings
- Test thoroughly at each step
- Update documentation for your team

With AssembleJS's server-first approach and selective hydration, your application will be more performant and provide a better user experience.