# Component Lifecycle

This guide explains the lifecycle of components in AssembleJS, from server-side preparation to client-side cleanup. Understanding the component lifecycle is essential for building efficient and maintainable applications.

## Overview

The AssembleJS component lifecycle is divided into two main phases:

1. **Server-Side Lifecycle**: Preparation, rendering, and serialization
2. **Client-Side Lifecycle**: Hydration, interaction, and cleanup

Each phase has specific hooks and events that allow you to control component behavior.

## Server-Side Lifecycle

### 1. Factory Execution

When a request is received, AssembleJS runs factories to prepare data for rendering:

```typescript
// src/factories/product.factory.ts
import { ComponentFactory } from 'assemblejs';

export class ProductFactory implements ComponentFactory {
  priority = 10; // Higher numbers run first
  
  async factory(context) {
    // Fetch product data
    const productId = context.params.id;
    const product = await context.services.productService.getProduct(productId);
    
    // Add to context data
    context.data.set('product', product);
  }
}
```

Lifecycle events:
1. Factory discovery: AssembleJS discovers factories associated with components
2. Priority sorting: Factories are sorted by priority (higher numbers run first)
3. Sequential execution: Factories run in priority order
4. Data preparation: Each factory adds data to the context

Best practices:
- Set appropriate priority levels for factories
- Keep factories focused on data preparation
- Handle errors gracefully
- Use parallel data fetching when possible

### 2. Template Compilation

After data preparation, AssembleJS compiles templates:

```typescript
// src/renderers/preact.renderer.ts (simplified example)
import { ComponentRenderer } from 'assemblejs';
import { renderToString } from 'preact-render-to-string';

export class PreactRenderer implements ComponentRenderer {
  async render(context) {
    const Component = context.template;
    const props = context.data.getAll();
    
    // Compile the template
    const html = renderToString(Component(props));
    
    return html;
  }
}
```

Lifecycle events:
1. Renderer selection: AssembleJS selects the appropriate renderer based on file extension
2. Template loading: The template file is loaded
3. Compilation: The template is compiled with context data
4. HTML generation: The compiled template is converted to HTML

Best practices:
- Choose the appropriate template language for your needs
- Keep templates simple and focused
- Minimize logic in templates
- Separate business logic from presentation

### 3. HTML Rendering

After template compilation, the HTML is assembled and rendered:

```typescript
// src/controllers/product.controller.ts
import { BlueprintController } from 'assemblejs';

export class ProductController extends BlueprintController {
  async handleRequest(request, reply) {
    // Return the view and props
    return {
      view: 'detail', // Refers to the template file
      props: {
        title: 'Product Details'
        // Additional props that will be merged with factory data
      }
    };
  }
}
```

Lifecycle events:
1. Layout selection: AssembleJS determines the layout structure
2. Component assembly: Components are assembled into the layout
3. Final rendering: The complete HTML is generated
4. Serialization: Component state is serialized for client-side hydration

Best practices:
- Use appropriate status codes and headers
- Apply proper error handling
- Implement caching for rendered output
- Set correct content-type headers

## Client-Side Lifecycle

### 1. DOM Attachment

When the browser loads the page, AssembleJS attaches to the DOM:

```typescript
// src/components/product/detail/detail.client.ts
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetail extends Blueprint {
  // Blueprint is the base class for client-side components
  
  // This is called when the component is first initialized
  constructor(element, props) {
    super(element, props);
    // Initialize internal state
    this.state = {
      quantity: 1
    };
  }
  
  // More lifecycle methods below...
}

// Register the component with AssembleJS
BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

Lifecycle events:
1. Script loading: The client-side script is loaded
2. Component registration: Components register with BlueprintClient
3. DOM scanning: AssembleJS scans the DOM for component markers
4. Instance creation: Component instances are created for each DOM element

Best practices:
- Keep client-side code minimal
- Ensure script loading doesn't block rendering
- Use progressive enhancement
- Handle cases where JavaScript might fail to load

### 2. Component Initialization (onInit)

After DOM attachment, components are initialized:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetail extends Blueprint {
  constructor(element, props) {
    super(element, props);
    this.state = { quantity: 1 };
  }
  
  // Called before the component is mounted to the DOM
  protected override onInit(): void {
    // Initialize resources, set up state
    this.product = this.getProperty('product');
    
    // This runs once before the component is mounted
    console.log('Product detail initializing:', this.product.id);
    
    // You can set up state here, but DOM isn't fully available yet
    this.maxQuantity = this.product.stock;
  }
  
  // More lifecycle methods below...
}

BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

During `onInit`:
- Component properties are available
- State can be initialized
- Resources can be prepared
- The DOM is not fully available yet

Best practices:
- Use `onInit` for state preparation
- Don't access DOM elements here
- Set up initial state
- Perform one-time initialization tasks

### 3. Component Mounting (onMount)

After initialization, components are mounted to the DOM:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetail extends Blueprint {
  private quantityInput: HTMLInputElement | null = null;
  private addToCartButton: HTMLButtonElement | null = null;
  
  constructor(element, props) {
    super(element, props);
    this.state = { quantity: 1 };
  }
  
  protected override onInit(): void {
    this.product = this.getProperty('product');
    this.maxQuantity = this.product.stock;
  }
  
  // Called when the component is mounted to the DOM
  protected override onMount(): void {
    // DOM is now available
    this.quantityInput = this.findElement('#quantity-input') as HTMLInputElement;
    this.addToCartButton = this.findElement('#add-to-cart') as HTMLButtonElement;
    
    // Set up event listeners
    if (this.quantityInput) {
      this.quantityInput.addEventListener('change', this.handleQuantityChange.bind(this));
    }
    
    if (this.addToCartButton) {
      this.addToCartButton.addEventListener('click', this.handleAddToCart.bind(this));
    }
    
    // Subscribe to events
    this.subscriptions = [
      EventBus.subscribe('cart.updated', this.handleCartUpdate.bind(this))
    ];
    
    console.log('Product detail mounted:', this.product.id);
  }
  
  private handleQuantityChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    
    // Update state
    this.setState({ quantity: newQuantity });
  }
  
  private handleAddToCart(): void {
    EventBus.publish('cart.add', {
      productId: this.product.id,
      quantity: this.state.quantity
    });
  }
  
  private handleCartUpdate(data): void {
    console.log('Cart updated:', data);
  }
  
  // More lifecycle methods below...
}

BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

During `onMount`:
- The DOM is fully available
- Event listeners can be added
- External subscriptions can be set up
- Initial DOM manipulations can be performed

Best practices:
- Store references to DOM elements
- Set up event listeners
- Subscribe to external events
- Initialize third-party libraries
- Keep references to subscriptions for cleanup

### 4. State Updates (setState)

Components can update their state and react to changes:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetail extends Blueprint {
  constructor(element, props) {
    super(element, props);
    this.state = {
      quantity: 1,
      isInCart: false
    };
  }
  
  // Previous lifecycle methods...
  
  // Update state with new values
  private updateQuantity(newQuantity: number): void {
    // Validate input
    const validQuantity = Math.min(
      Math.max(1, newQuantity), // Minimum 1
      this.maxQuantity // Maximum available stock
    );
    
    // Update state
    this.setState({
      quantity: validQuantity
    });
    
    // DOM will update after setState
  }
  
  // Called when state is updated
  protected override onStateChange(newState, oldState): void {
    // React to state changes
    if (newState.quantity !== oldState.quantity) {
      // Update quantity display
      const quantityDisplay = this.findElement('#quantity-display');
      if (quantityDisplay) {
        quantityDisplay.textContent = newState.quantity.toString();
      }
      
      // Update total price
      const totalPrice = this.product.price * newState.quantity;
      const priceDisplay = this.findElement('#total-price');
      if (priceDisplay) {
        priceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
      }
    }
    
    if (newState.isInCart !== oldState.isInCart) {
      // Update cart button state
      if (this.addToCartButton) {
        this.addToCartButton.disabled = newState.isInCart;
        this.addToCartButton.textContent = newState.isInCart 
          ? 'Added to Cart' 
          : 'Add to Cart';
      }
    }
  }
  
  // More lifecycle methods below...
}

BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

During state updates:
- `setState()` updates the component's internal state
- `onStateChange()` is called after state update
- Components can react to specific state changes
- DOM updates can be performed based on state changes

Best practices:
- Keep state minimal and focused
- Validate state changes
- Compare old and new state for efficiency
- Update only the necessary DOM elements
- Use state to drive UI updates

### 5. Event Handling

Components can respond to DOM events and system events:

```typescript
import { Blueprint, BlueprintClient, EventBus } from 'assemblejs';

class ProductDetail extends Blueprint {
  // Previous code...
  
  protected override onMount(): void {
    // DOM event listeners
    this.addToCartButton.addEventListener('click', this.handleAddToCart.bind(this));
    this.quantityInput.addEventListener('input', this.handleQuantityInput.bind(this));
    
    // System event subscriptions
    this.subscriptions = [
      EventBus.subscribe('cart.updated', this.handleCartUpdate.bind(this)),
      EventBus.subscribe('product.stock.updated', this.handleStockUpdate.bind(this))
    ];
  }
  
  // DOM event handlers
  private handleQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    this.updateQuantity(newQuantity);
  }
  
  private handleAddToCart(event: Event): void {
    event.preventDefault();
    
    // Publish event to system
    EventBus.publish('cart.add', {
      productId: this.product.id,
      quantity: this.state.quantity
    });
    
    this.setState({ isInCart: true });
  }
  
  // System event handlers
  private handleCartUpdate(data): void {
    // Check if this product is in cart
    const isInCart = data.items.some(item => item.productId === this.product.id);
    this.setState({ isInCart });
  }
  
  private handleStockUpdate(data): void {
    // Update max quantity if this product's stock changed
    if (data.productId === this.product.id) {
      this.maxQuantity = data.stock;
      
      // Adjust quantity if current selection exceeds new stock
      if (this.state.quantity > this.maxQuantity) {
        this.updateQuantity(this.maxQuantity);
      }
    }
  }
  
  // More lifecycle methods below...
}

BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

Event handling includes:
- DOM events (click, input, change, etc.)
- System events via EventBus
- Custom component events

Best practices:
- Bind event handlers to preserve `this` context
- Use event delegation for collections
- Keep event handlers small and focused
- Store subscription references for cleanup
- Validate event data before use

### 6. DOM Updates

Components can update the DOM in response to state changes:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetail extends Blueprint {
  // Previous code...
  
  // Update UI based on state
  private updateUI(): void {
    // Update quantity input
    if (this.quantityInput) {
      this.quantityInput.value = this.state.quantity.toString();
    }
    
    // Update total price
    const totalPrice = this.product.price * this.state.quantity;
    const priceDisplay = this.findElement('#total-price');
    if (priceDisplay) {
      priceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
    }
    
    // Update availability message
    const availabilityMessage = this.findElement('#availability');
    if (availabilityMessage) {
      if (this.maxQuantity > 10) {
        availabilityMessage.textContent = 'In Stock';
        availabilityMessage.className = 'in-stock';
      } else if (this.maxQuantity > 0) {
        availabilityMessage.textContent = `Only ${this.maxQuantity} left!`;
        availabilityMessage.className = 'low-stock';
      } else {
        availabilityMessage.textContent = 'Out of Stock';
        availabilityMessage.className = 'out-of-stock';
      }
    }
    
    // Update add to cart button
    if (this.addToCartButton) {
      this.addToCartButton.disabled = this.state.isInCart || this.maxQuantity === 0;
      this.addToCartButton.textContent = this.state.isInCart 
        ? 'Added to Cart' 
        : this.maxQuantity === 0 
          ? 'Out of Stock' 
          : 'Add to Cart';
    }
  }
  
  // Called after state changes
  protected override onStateChange(newState, oldState): void {
    this.updateUI();
  }
  
  // More lifecycle methods below...
}

BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

DOM update patterns:
- Direct DOM manipulation
- State-driven UI updates
- Conditional rendering
- Class and attribute manipulation

Best practices:
- Minimize DOM operations
- Update only what changed
- Batch DOM updates
- Use document fragments for large changes
- Avoid layout thrashing (read properties before writing)

### 7. Component Destruction (onDestroy)

When a component is removed or the page is unloaded, cleanup is performed:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetail extends Blueprint {
  private subscriptions = [];
  
  // Previous lifecycle methods...
  
  // Called when the component is being destroyed
  protected override onDestroy(): void {
    // Clean up event listeners
    if (this.quantityInput) {
      this.quantityInput.removeEventListener('change', this.handleQuantityChange);
    }
    
    if (this.addToCartButton) {
      this.addToCartButton.removeEventListener('click', this.handleAddToCart);
    }
    
    // Unsubscribe from system events
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    
    // Clean up other resources
    this.cleanup3rdPartyLibrary();
    
    console.log('Product detail destroyed:', this.product.id);
  }
  
  private cleanup3rdPartyLibrary(): void {
    // Clean up any third-party libraries
    if (this.lightbox) {
      this.lightbox.destroy();
      this.lightbox = null;
    }
  }
}

BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

During `onDestroy`:
- Event listeners should be removed
- System event subscriptions should be unsubscribed
- Third-party libraries should be cleaned up
- References should be nullified
- Timers should be cleared

Best practices:
- Always clean up everything you set up
- Keep track of what needs cleanup
- Test destruction paths
- Avoid memory leaks by removing all references
- Clear timers and intervals

## Special Lifecycle Scenarios

### Server-Side Rendering with Client Hydration

When using server-side rendering with client hydration:

```typescript
// Server-side controller
export class ProductController extends BlueprintController {
  async handleRequest(request, reply) {
    const product = await this.services.productService.getProduct(request.params.id);
    
    return {
      view: 'detail',
      props: { product },
      // Enable client-side hydration
      hydrate: true
    };
  }
}

// Client-side component
import { Blueprint, BlueprintClient } from 'assemblejs';

class ProductDetail extends Blueprint {
  // This is a special lifecycle hook for hydration
  protected override onHydrate(): void {
    // Called after state is restored from server but before mounting
    console.log('Hydrating from server state');
    
    // You can modify the hydrated state if needed
    const serverProduct = this.getProperty('product');
    this.localCopy = { ...serverProduct };
  }
  
  // Normal lifecycle continues
  protected override onMount(): void {
    // Component is now hydrated with server data
    super.onMount();
    
    // Set up client-specific behavior
    this.setupInteractivity();
  }
}

BlueprintClient.registerComponentCodeBehind(ProductDetail);
```

Hydration sequence:
1. Server renders HTML with state
2. Client loads initial HTML
3. Client scripts load and execute
4. Component instances are created
5. State is hydrated from server
6. `onHydrate()` is called
7. `onMount()` is called
8. Component becomes interactive

Best practices:
- Keep server and client state in sync
- Use hydration for interactive components only
- Handle cases where hydration might fail
- Test both hydration and non-hydration paths

### Dynamic Component Creation

Creating components dynamically in the client:

```typescript
import { Blueprint, BlueprintClient } from 'assemblejs';

class DynamicComponentCreator extends Blueprint {
  protected override onMount(): void {
    const container = this.findElement('#dynamic-container');
    const createButton = this.findElement('#create-component');
    
    createButton.addEventListener('click', () => {
      this.createDynamicComponent(container);
    });
  }
  
  private async createDynamicComponent(container): Promise<void> {
    // Create a container element
    const componentElement = document.createElement('div');
    componentElement.className = 'dynamic-component';
    container.appendChild(componentElement);
    
    // Create component instance
    const { DynamicComponent } = await import('./dynamic-component.client.js');
    const instance = new DynamicComponent(componentElement, {
      id: `dynamic-${Date.now()}`,
      title: 'Dynamic Component',
      onClose: () => {
        this.removeDynamicComponent(componentElement, instance);
      }
    });
    
    // Initialize the component
    instance.initialize();
  }
  
  private removeDynamicComponent(element, instance): void {
    // Clean up the component
    instance.destroy();
    
    // Remove from DOM
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

BlueprintClient.registerComponentCodeBehind(DynamicComponentCreator);
```

Dynamic component lifecycle:
1. Container element is created
2. Component class is loaded (potentially lazy-loaded)
3. Component instance is created
4. Component is initialized and mounted
5. When no longer needed, component is destroyed
6. Element is removed from DOM

Best practices:
- Properly initialize dynamic components
- Ensure cleanup when removing components
- Consider using a component registry
- Implement lazy loading for better performance
- Track component instances for management

## Complete Lifecycle Example

Here's a comprehensive example of a component implementing the full lifecycle:

```typescript
import { Blueprint, BlueprintClient, EventBus } from 'assemblejs';

class ProductGallery extends Blueprint {
  // Properties
  private carousel: any = null;
  private images: HTMLImageElement[] = [];
  private currentIndex: number = 0;
  private subscriptions: any[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private updateTimer: number | null = null;
  
  // Constructor
  constructor(element, props) {
    super(element, props);
    
    // Initialize state
    this.state = {
      isVisible: false,
      isLoaded: false,
      activeIndex: 0
    };
    
    // Bind methods
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleThumbnailClick = this.handleThumbnailClick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }
  
  // LIFECYCLE: Initialization
  protected override onInit(): void {
    console.log('Gallery initializing');
    
    // Get properties from server
    this.product = this.getProperty('product');
    this.initialIndex = this.getProperty('initialIndex') || 0;
    
    // Set up initial state
    this.setState({
      activeIndex: this.initialIndex
    });
  }
  
  // LIFECYCLE: Hydration (for SSR)
  protected override onHydrate(): void {
    console.log('Gallery hydrating');
    
    // Adjust hydrated state if needed
    this.setState({
      isVisible: false, // Will be determined by IntersectionObserver
      isLoaded: false   // Will be set when all images are loaded
    });
  }
  
  // LIFECYCLE: Mounting
  protected override onMount(): void {
    console.log('Gallery mounting');
    
    // Get DOM elements
    this.gallery = this.findElement('.product-gallery');
    this.mainImage = this.findElement('.main-image');
    this.thumbnails = this.findElements('.thumbnail');
    this.nextButton = this.findElement('.next-button');
    this.prevButton = this.findElement('.prev-button');
    
    // Set up event listeners
    if (this.nextButton) {
      this.nextButton.addEventListener('click', this.handleNext);
    }
    
    if (this.prevButton) {
      this.prevButton.addEventListener('click', this.handlePrev);
    }
    
    // Set up thumbnail clicks
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => this.handleThumbnailClick(index));
    });
    
    // Set up intersection observer to detect visibility
    this.setupIntersectionObserver();
    
    // Set up resize observer
    this.setupResizeObserver();
    
    // Subscribe to system events
    this.subscriptions = [
      EventBus.subscribe('product.gallery.update', this.handleGalleryUpdate.bind(this)),
      EventBus.subscribe('theme.change', this.handleThemeChange.bind(this))
    ];
    
    // Initialize third-party carousel library
    this.initializeCarousel();
    
    // Set initial state
    this.updateButtonStates();
  }
  
  // LIFECYCLE: State Change
  protected override onStateChange(newState, oldState): void {
    console.log('Gallery state changed', newState, oldState);
    
    // Handle active index change
    if (newState.activeIndex !== oldState.activeIndex) {
      this.updateActiveImage(newState.activeIndex);
      this.updateButtonStates();
      
      // Update carousel if exists
      if (this.carousel) {
        this.carousel.goToSlide(newState.activeIndex);
      }
    }
    
    // Handle visibility change
    if (newState.isVisible !== oldState.isVisible) {
      if (newState.isVisible) {
        this.loadImages();
      }
    }
    
    // Handle loaded state change
    if (newState.isLoaded !== oldState.isLoaded) {
      if (newState.isLoaded) {
        this.initializeCarousel();
      }
    }
  }
  
  // LIFECYCLE: Destruction
  protected override onDestroy(): void {
    console.log('Gallery destroying');
    
    // Remove event listeners
    if (this.nextButton) {
      this.nextButton.removeEventListener('click', this.handleNext);
    }
    
    if (this.prevButton) {
      this.prevButton.removeEventListener('click', this.handlePrev);
    }
    
    // Remove thumbnail listeners
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.removeEventListener('click', () => this.handleThumbnailClick(index));
    });
    
    // Unsubscribe from system events
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Disconnect observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Clear timers
    if (this.updateTimer !== null) {
      window.clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    
    // Destroy third-party carousel
    if (this.carousel) {
      this.carousel.destroy();
      this.carousel = null;
    }
    
    // Clear references
    this.gallery = null;
    this.mainImage = null;
    this.thumbnails = [];
    this.nextButton = null;
    this.prevButton = null;
    this.images = [];
  }
  
  // EVENT HANDLERS
  
  // Handle next button click
  private handleNext(): void {
    const nextIndex = this.state.activeIndex + 1;
    if (nextIndex < this.thumbnails.length) {
      this.setState({ activeIndex: nextIndex });
    }
  }
  
  // Handle previous button click
  private handlePrev(): void {
    const prevIndex = this.state.activeIndex - 1;
    if (prevIndex >= 0) {
      this.setState({ activeIndex: prevIndex });
    }
  }
  
  // Handle thumbnail clicks
  private handleThumbnailClick(index: number): void {
    this.setState({ activeIndex: index });
  }
  
  // Handle gallery update events
  private handleGalleryUpdate(data): void {
    if (data.productId === this.product.id) {
      // Update images
      // Implementation depends on how updates are structured
    }
  }
  
  // Handle theme changes
  private handleThemeChange(data): void {
    // Update styling based on theme
    if (this.gallery) {
      this.gallery.dataset.theme = data.theme;
    }
  }
  
  // Handle visibility changes
  private handleVisibilityChange(entries): void {
    const isVisible = entries.some(entry => entry.isIntersecting);
    
    if (isVisible !== this.state.isVisible) {
      this.setState({ isVisible });
    }
  }
  
  // Handle resize events
  private handleResize(entries): void {
    // Debounce resize handling
    if (this.updateTimer !== null) {
      window.clearTimeout(this.updateTimer);
    }
    
    this.updateTimer = window.setTimeout(() => {
      // Update layout based on new size
      this.updateGalleryLayout();
      this.updateTimer = null;
    }, 200);
  }
  
  // UTILITY METHODS
  
  // Set up intersection observer
  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      this.handleVisibilityChange,
      { threshold: 0.1 }
    );
    
    if (this.gallery) {
      this.intersectionObserver.observe(this.gallery);
    }
  }
  
  // Set up resize observer
  private setupResizeObserver(): void {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      
      if (this.gallery) {
        this.resizeObserver.observe(this.gallery);
      }
    }
  }
  
  // Initialize third-party carousel
  private initializeCarousel(): void {
    if (!this.carousel && this.state.isLoaded && this.gallery) {
      // Example using a hypothetical carousel library
      import('carousel-library').then(({ Carousel }) => {
        this.carousel = new Carousel(this.gallery, {
          initialSlide: this.state.activeIndex,
          speed: 300,
          autoplay: false,
          loop: false,
          onSlideChange: (index) => {
            this.setState({ activeIndex: index });
          }
        });
      });
    }
  }
  
  // Load images
  private loadImages(): void {
    const imageUrls = this.product.images;
    let loadedCount = 0;
    
    // Load all images
    imageUrls.forEach(url => {
      const img = new Image();
      
      img.onload = () => {
        loadedCount++;
        
        // Check if all images are loaded
        if (loadedCount === imageUrls.length) {
          this.setState({ isLoaded: true });
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        console.error(`Failed to load image: ${url}`);
        
        // Still proceed if all images attempted to load
        if (loadedCount === imageUrls.length) {
          this.setState({ isLoaded: true });
        }
      };
      
      img.src = url;
      this.images.push(img);
    });
  }
  
  // Update active image
  private updateActiveImage(index: number): void {
    // Remove active class from all thumbnails
    this.thumbnails.forEach(thumbnail => {
      thumbnail.classList.remove('active');
    });
    
    // Add active class to current thumbnail
    if (this.thumbnails[index]) {
      this.thumbnails[index].classList.add('active');
    }
    
    // Update main image
    if (this.mainImage) {
      this.mainImage.src = this.product.images[index];
      this.mainImage.alt = `${this.product.name} - Image ${index + 1}`;
    }
  }
  
  // Update button states
  private updateButtonStates(): void {
    if (this.prevButton) {
      this.prevButton.disabled = this.state.activeIndex === 0;
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = this.state.activeIndex === this.thumbnails.length - 1;
    }
  }
  
  // Update gallery layout
  private updateGalleryLayout(): void {
    // Adjust layout based on container size
    if (this.gallery) {
      const width = this.gallery.clientWidth;
      
      if (width < 600) {
        this.gallery.classList.add('compact');
      } else {
        this.gallery.classList.remove('compact');
      }
      
      // If using a carousel, update it
      if (this.carousel) {
        this.carousel.update();
      }
    }
  }
}

// Register the component
BlueprintClient.registerComponentCodeBehind(ProductGallery);
```

## Best Practices for Component Lifecycle

### Performance Optimization

- Initialize resources only when needed
- Load assets only when components are visible
- Use lazy loading for non-critical components
- Batch DOM updates
- Use debouncing and throttling for frequent events
- Implement efficient cleanup to prevent memory leaks

### Error Handling

- Implement error boundaries for component failures
- Handle errors gracefully during each lifecycle phase
- Provide fallback content for failed components
- Log errors for debugging
- Recover where possible

### Testing

- Unit test each lifecycle method
- Test component initialization with various props
- Test state changes and updates
- Test event handling
- Test component destruction and cleanup
- Test error scenarios

### Common Pitfalls

- Forgetting to clean up event listeners
- Not unsubscribing from event bus
- Accessing DOM elements before they're available
- Adding event listeners multiple times
- Missing error handling
- Over-reliance on lifecycle hooks for logic
- Not properly cleaning up third-party libraries

## Related Topics

- [Core Concepts: Components](core-concepts-components)
- [Event System](core-concepts-event-system)
- [Server-Side Rendering](advanced-server-side-rendering)
- [Cross-Framework State](advanced-cross-framework-state)
- [Performance Optimization](performance-optimization)