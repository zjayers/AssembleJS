# React Integration

AssembleJS provides first-class support for React, allowing you to use React components within your AssembleJS application. This integration leverages React's powerful component model while taking advantage of AssembleJS's server-side rendering, component isolation, and event system.

## Getting Started with React in AssembleJS

AssembleJS provides built-in support for React components, handling both server-side rendering and client-side hydration automatically.

### Prerequisites

Before using React with AssembleJS, ensure you have the following dependencies installed:

```bash
npm install react react-dom
```

### Creating a React Component

When you generate a component using `asmgen`, you can select React as the framework:

```bash
npx asmgen
# Select "Component" from the list
# Enter your component name
# Select "React" as the UI framework
```

### Folder Structure

For a React component named "product-card" in the "catalog" directory:

```
components/
└── catalog/
    └── product-card/
        ├── product-card.client.ts  # Client-side initialization
        ├── product-card.styles.scss # Component styles
        └── product-card.view.jsx    # React component
```

## Writing React Components in AssembleJS

### Basic Component Structure

```jsx
// product-card.view.jsx
import React from 'react';

const ProductCard = ({ data }) => {
  const { product } = data;
  
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="description">{product.description}</p>
      <button className="add-to-cart-button">Add to Cart</button>
    </div>
  );
};

export default ProductCard;
```

### Accessing Component Data

React components in AssembleJS receive data from their factory through the `data` prop:

```typescript
// product-card.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ProductCardFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Fetch a product from an API or database
    const product = await fetchProduct(context.params.productId);
    
    // Add the product to the component's context data
    context.data.set('product', product);
  }
}
```

### Client-Side Behavior

To add client-side interactivity to your React component, you can use the client file:

```typescript
// product-card.client.ts
import { Blueprint } from 'asmbl';

class ProductCardComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Get a reference to the Add to Cart button
    const addToCartButton = this.element.querySelector('.add-to-cart-button');
    
    // Add event listener
    addToCartButton?.addEventListener('click', () => {
      const productId = this.context.data.product.id;
      
      // Publish an event to notify other components
      this.eventBus.publish('cart:add', { productId });
    });
  }
}

// Register the component
export default ProductCardComponent;
```

## Using React Hooks and State

React components in AssembleJS can use all standard React features, including hooks:

```jsx
// product-card.view.jsx
import React, { useState, useEffect } from 'react';

const ProductCard = ({ data }) => {
  const { product } = data;
  const [quantity, setQuantity] = useState(1);
  const [inStock, setInStock] = useState(true);
  
  useEffect(() => {
    // Check if the product is in stock
    checkInventory(product.id).then(stock => {
      setInStock(stock > 0);
    });
  }, [product.id]);
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };
  
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="description">{product.description}</p>
      
      <div className="quantity-control">
        <button onClick={decrementQuantity}>-</button>
        <span>{quantity}</span>
        <button onClick={incrementQuantity}>+</button>
      </div>
      
      <button 
        className="add-to-cart-button"
        disabled={!inStock}
      >
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
};

export default ProductCard;
```

## React Component Props

AssembleJS passes several props to your React components:

| Prop | Description |
|------|-------------|
| `data` | The data object populated by the component's factory |
| `context` | The component context with additional utilities |
| `params` | URL and route parameters |
| `children` | Child components or content |

```jsx
// container.view.jsx
import React from 'react';

const Container = ({ data, context, params, children }) => {
  return (
    <div className={`container ${data.size}`}>
      <h2>{data.title}</h2>
      <div className="container-content">
        {children}
      </div>
      <div className="debug-info">
        <p>Route: {params.route}</p>
        <p>Component ID: {context.id}</p>
      </div>
    </div>
  );
};

export default Container;
```

## Interacting with the AssembleJS Event System

React components can interact with the AssembleJS event system through the client file:

```typescript
// notification.client.ts
import { Blueprint } from 'asmbl';

class NotificationComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for cart events
    this.eventBus.subscribe('cart:add', (data) => {
      // Get the React component instance
      const reactRoot = this.element.querySelector('[data-react-root]');
      if (!reactRoot) return;
      
      // Call a method on the React component
      const showNotification = (reactRoot as any).__reactShowNotification;
      if (typeof showNotification === 'function') {
        showNotification(`Added product ${data.productId} to cart`);
      }
    });
  }
}

export default NotificationComponent;
```

In your React component, expose methods to the client file:

```jsx
// notification.view.jsx
import React, { useState, useEffect, useRef } from 'react';

const Notification = ({ data }) => {
  const [notifications, setNotifications] = useState([]);
  const rootRef = useRef(null);
  
  const showNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  // Expose the method to the client file
  useEffect(() => {
    if (rootRef.current) {
      (rootRef.current as any).__reactShowNotification = showNotification;
    }
  }, []);
  
  return (
    <div className="notification-container" ref={rootRef} data-react-root>
      {notifications.map(note => (
        <div key={note.id} className="notification">
          {note.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
```

## Server-Side Rendering and Hydration

AssembleJS handles server-side rendering and hydration of React components automatically:

1. On the server, AssembleJS renders your React component to HTML
2. The HTML is sent to the client along with the necessary data
3. On the client, React hydrates the component, making it interactive
4. The component retains its state and event handlers

This process is transparent to the developer - you don't need to write special code to handle SSR and hydration.

## TypeScript Support

AssembleJS fully supports TypeScript with React:

```tsx
// product-card.view.tsx
import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface ProductCardProps {
  data: {
    product: Product;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const { product } = data;
  const [quantity, setQuantity] = useState(1);
  
  // Component implementation...
};

export default ProductCard;
```

## Context Providers

You can use React Context to share state between nested React components:

```jsx
// app-layout.view.jsx
import React, { createContext, useState } from 'react';

// Create a context
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

const AppLayout = ({ data, children }) => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-layout theme-${theme}`}>
        <header>
          <h1>{data.title}</h1>
          <button onClick={toggleTheme}>
            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </header>
        <main>
          {children}
        </main>
        <footer>
          &copy; {new Date().getFullYear()} {data.companyName}
        </footer>
      </div>
    </ThemeContext.Provider>
  );
};

export default AppLayout;
```

Child components can consume this context:

```jsx
// user-profile.view.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../app-layout/app-layout.view.jsx';

const UserProfile = ({ data }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`user-profile ${theme}-theme`}>
      <h2>{data.user.name}</h2>
      <p>Email: {data.user.email}</p>
    </div>
  );
};

export default UserProfile;
```

## Using React Libraries and Hooks

You can use any React library with AssembleJS. For example, using React Router for client-side routing:

```jsx
// app.view.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home';
import About from './routes/about';
import Products from './routes/products';

const App = ({ data }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home initialData={data.homeData} />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products initialProducts={data.products} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

## Best Practices

1. **Keep Components Focused** - Create small, focused React components that do one thing well
2. **Use Factory for Data Fetching** - Fetch data in the factory, not in the React component
3. **Leverage SSR** - Take advantage of AssembleJS's server-side rendering for faster initial load
4. **Type Your Props** - Use TypeScript to define prop types for better development experience
5. **Manage State Carefully** - Keep state as local as possible to avoid unnecessary re-renders
6. **Optimize Component Composition** - Structure your components for optimal re-use and performance
7. **Use AssembleJS Events for Cross-Component Communication** - Rather than prop drilling
8. **Maintain Clean Boundaries** - Keep a clear separation between AssembleJS and React code

## Next Steps

- [Core Concepts - Components](../core-concepts-components.md) - Learn more about the component model
- [Core Concepts - Factories](../core-concepts-factories.md) - Understand how to prepare data for your components
- [Advanced Islands Architecture](../advanced-islands-architecture.md) - Learn about selective hydration
- [Cross-Framework State](../advanced-cross-framework-state.md) - Share state between React and other frameworks