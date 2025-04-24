# Preact Integration

AssembleJS provides seamless integration with Preact, allowing you to use this lightweight alternative to React for your components. This integration gives you the benefits of Preact's small footprint and high performance while enjoying AssembleJS's server-side rendering and component isolation.

## Getting Started with Preact in AssembleJS

### Prerequisites

Before using Preact with AssembleJS, ensure you have the following dependencies installed:

```bash
npm install preact
```

AssembleJS has built-in support for Preact without requiring additional configuration.

### Creating a Preact Component

When you generate a component using `asmgen`, you can select Preact as the framework:

```bash
npx asmgen
# Select "Component" from the list
# Enter your component name
# Select "Preact" as the UI framework
```

### Folder Structure

For a Preact component named "product-card" in the "catalog" directory:

```
components/
└── catalog/
    └── product-card/
        ├── product-card.client.ts  # Client-side initialization
        ├── product-card.styles.scss # Component styles
        └── product-card.view.tsx    # Preact component
```

## Writing Preact Components in AssembleJS

### Basic Component Structure

```tsx
// product-card.view.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';

const ProductCard = ({ data }) => {
  const { product } = data;
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
      
      <div className="quantity-control">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>
      
      <button className="add-to-cart-button">
        Add to Cart ({quantity})
      </button>
    </div>
  );
};

export default ProductCard;
```

### Accessing Component Data

Preact components in AssembleJS receive data from their factory through the `data` prop:

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

To add client-side interactivity to your Preact component, you can use the client file:

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
      const quantity = this.element.querySelector('.quantity-control span')?.textContent;
      
      // Publish an event to notify other components
      this.eventBus.publish('cart:add', { 
        productId,
        quantity: parseInt(quantity || '1', 10)
      });
    });
  }
}

// Register the component
export default ProductCardComponent;
```

## Using Preact Hooks

Preact components in AssembleJS can use all standard Preact hooks:

```tsx
// product-details.view.tsx
import { h } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

const ProductDetails = ({ data }) => {
  const { product } = data;
  const [selectedImage, setSelectedImage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageRef = useRef(null);
  
  // Similar to React's useEffect
  useEffect(() => {
    // Track product view
    trackProductView(product.id);
    
    return () => {
      // Cleanup code
    };
  }, [product.id]);
  
  // useCallback works the same as in React
  const handleImageClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
  return (
    <div className="product-details">
      <div className="gallery">
        <img 
          ref={imageRef}
          src={product.images[selectedImage]} 
          alt={product.name}
          onClick={handleImageClick}
          className={isExpanded ? 'expanded' : ''}
        />
        <div className="thumbnails">
          {product.images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              className={idx === selectedImage ? 'selected' : ''}
              onClick={() => setSelectedImage(idx)}
              alt={`${product.name} - view ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="info">
        <h2>{product.name}</h2>
        <p className="price">${product.price.toFixed(2)}</p>
        <p className="description">{product.description}</p>
      </div>
    </div>
  );
};

export default ProductDetails;
```

## Preact Component Props

AssembleJS passes several props to your Preact components:

| Prop | Description |
|------|-------------|
| `data` | The data object populated by the component's factory |
| `context` | The component context with additional utilities |
| `params` | URL and route parameters |
| `children` | Child components or content |

```tsx
// container.view.tsx
import { h } from 'preact';

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

## TypeScript Support

AssembleJS fully supports TypeScript with Preact:

```tsx
// product-card.view.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';

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
  context: any;
  params: Record<string, string>;
}

const ProductCard = ({ data, context, params }: ProductCardProps) => {
  const { product } = data;
  const [quantity, setQuantity] = useState(1);
  
  // Component implementation...
  return (
    <div className="product-card">
      {/* Component content */}
    </div>
  );
};

export default ProductCard;
```

## Interacting with the AssembleJS Event System

Preact components can interact with the AssembleJS event system through the client file:

```typescript
// notification.client.ts
import { Blueprint } from 'asmbl';

class NotificationComponent extends Blueprint {
  private notificationQueue: Array<{id: number, message: string}> = [];
  private showNotificationFn: ((message: string) => void) | null = null;
  
  protected override onMount(): void {
    super.onMount();
    
    // Store reference to the Preact component's function
    this.element.addEventListener('notificationReady', (e: any) => {
      this.showNotificationFn = e.detail.showNotification;
      
      // Process any queued notifications
      this.notificationQueue.forEach(note => {
        if (this.showNotificationFn) {
          this.showNotificationFn(note.message);
        }
      });
      this.notificationQueue = [];
    });
    
    // Listen for cart events
    this.eventBus.subscribe('cart:add', (data) => {
      this.showNotification(`Added ${data.quantity} item(s) to cart`);
    });
  }
  
  private showNotification(message: string): void {
    if (this.showNotificationFn) {
      this.showNotificationFn(message);
    } else {
      // Queue the notification if the Preact component isn't ready
      this.notificationQueue.push({
        id: Date.now(),
        message
      });
    }
  }
}

export default NotificationComponent;
```

In your Preact component, expose methods to the client file:

```tsx
// notification.view.tsx
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  
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
    // Create a custom event to pass the function to the client file
    const event = new CustomEvent('notificationReady', {
      detail: { showNotification }
    });
    document.currentScript?.parentElement?.dispatchEvent(event);
  }, []);
  
  return (
    <div className="notification-container">
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

AssembleJS handles server-side rendering and hydration of Preact components automatically:

1. On the server, AssembleJS renders your Preact component to HTML
2. The HTML is sent to the client along with the necessary data
3. On the client, Preact hydrates the component, making it interactive
4. The component retains its state and event handlers

This process is transparent to the developer - you don't need to write special code to handle SSR and hydration.

## Preact Context

You can use Preact's Context API to share state between nested Preact components:

```tsx
// app-layout.view.tsx
import { h, createContext } from 'preact';
import { useState } from 'preact/hooks';

// Create a context
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
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

```tsx
// user-profile.view.tsx
import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { ThemeContext } from '../app-layout/app-layout.view.tsx';

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

## Performance Benefits of Preact

Using Preact with AssembleJS offers several performance advantages:

1. **Smaller Bundle Size**: Preact is just 3KB in size (gzipped), significantly smaller than React
2. **Faster Initial Render**: Lighter JavaScript means faster parsing and execution
3. **Memory Efficiency**: Preact uses less memory than React
4. **Compatible API**: Preact maintains compatibility with React's API
5. **AssembleJS Optimizations**: AssembleJS's selective hydration works well with Preact's lightweight nature

## Best Practices

1. **Keep Components Focused**: Create small, focused Preact components that do one thing well
2. **Use Factory for Data Fetching**: Fetch data in the factory, not in the Preact component
3. **Leverage SSR**: Take advantage of AssembleJS's server-side rendering for faster initial load
4. **Type Your Props**: Use TypeScript to define prop types for better development experience
5. **Manage State Carefully**: Keep state as local as possible to avoid unnecessary re-renders
6. **Optimize Component Composition**: Structure your components for optimal re-use and performance
7. **Use AssembleJS Events for Cross-Component Communication**: Rather than prop drilling
8. **Use Preact's Hooks API**: Take advantage of Preact's hooks for state management and side effects

## Next Steps

- [Core Concepts - Components](../core-concepts-components.md) - Learn more about the component model
- [Core Concepts - Factories](../core-concepts-factories.md) - Understand how to prepare data for your components
- [Advanced Islands Architecture](../advanced-islands-architecture.md) - Learn about selective hydration
- [Cross-Framework State](../advanced-cross-framework-state.md) - Share state between Preact and other frameworks