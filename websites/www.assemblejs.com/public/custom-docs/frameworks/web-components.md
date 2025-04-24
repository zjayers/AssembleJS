# Web Components Integration

AssembleJS provides robust support for Web Components, allowing you to create framework-agnostic, reusable components using the browser's native custom element capabilities. This integration enables you to build components that work with any framework while taking advantage of AssembleJS's server-side rendering, component isolation, and event system.

## Getting Started with Web Components in AssembleJS

### Prerequisites

Web Components don't require any additional libraries as they're natively supported by modern browsers. However, for broader compatibility, you might want to include polyfills:

```bash
npm install @webcomponents/webcomponentsjs
```

### Creating a Web Component

When you generate a component using `asmgen`, you can select Web Components as the framework:

```bash
npx asmgen
# Select "Component" from the list
# Enter your component name
# Select "Web Component" as the UI framework
```

### Folder Structure

For a Web Component named "product-card" in the "catalog" directory:

```
components/
└── catalog/
    └── product-card/
        ├── product-card.client.ts  # Client-side initialization
        ├── product-card.styles.scss # Component styles
        └── product-card.view.wc.js  # Web Component definition
```

## Writing Web Components in AssembleJS

### Basic Component Structure

```javascript
// product-card.view.wc.js
class ProductCard extends HTMLElement {
  // Define observed attributes
  static get observedAttributes() {
    return ['product-id', 'product-name', 'product-price', 'product-image'];
  }
  
  // Shadow DOM template
  get template() {
    return `
      <style>
        :host {
          display: block;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .product-card__price {
          font-weight: bold;
          color: #e63946;
        }
        
        .product-card__quantity {
          display: flex;
          align-items: center;
          margin: 1rem 0;
        }
        
        .product-card__quantity button {
          background: #f1f1f1;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .product-card__quantity span {
          margin: 0 1rem;
        }
        
        .product-card__button {
          background: #457b9d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .product-card__button:hover {
          background: #1d3557;
        }
      </style>
      
      <div class="product-card">
        <img src="" alt="" class="product-card__image">
        <h3 class="product-card__name"></h3>
        <p class="product-card__price"></p>
        
        <div class="product-card__quantity">
          <button class="product-card__decrement">-</button>
          <span class="product-card__quantity-display">1</span>
          <button class="product-card__increment">+</button>
        </div>
        
        <button class="product-card__button">
          Add to Cart
        </button>
      </div>
    `;
  }
  
  constructor() {
    super();
    // Create a shadow root
    this.attachShadow({ mode: 'open' });
    // Append the template
    this.shadowRoot.innerHTML = this.template;
    
    // State
    this._quantity = 1;
    
    // Bind methods
    this._increment = this._increment.bind(this);
    this._decrement = this._decrement.bind(this);
    this._addToCart = this._addToCart.bind(this);
  }
  
  // Lifecycle callbacks
  connectedCallback() {
    // Update the UI with attribute values
    this._updateUI();
    
    // Add event listeners
    this.shadowRoot
      .querySelector('.product-card__increment')
      .addEventListener('click', this._increment);
      
    this.shadowRoot
      .querySelector('.product-card__decrement')
      .addEventListener('click', this._decrement);
      
    this.shadowRoot
      .querySelector('.product-card__button')
      .addEventListener('click', this._addToCart);
  }
  
  disconnectedCallback() {
    // Remove event listeners
    this.shadowRoot
      .querySelector('.product-card__increment')
      .removeEventListener('click', this._increment);
      
    this.shadowRoot
      .querySelector('.product-card__decrement')
      .removeEventListener('click', this._decrement);
      
    this.shadowRoot
      .querySelector('.product-card__button')
      .removeEventListener('click', this._addToCart);
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._updateUI();
    }
  }
  
  // Property getters/setters
  get quantity() {
    return this._quantity;
  }
  
  set quantity(value) {
    this._quantity = value;
    // Update the UI
    if (this.shadowRoot) {
      this.shadowRoot.querySelector('.product-card__quantity-display').textContent = value;
    }
  }
  
  // Private methods
  _updateUI() {
    if (!this.shadowRoot) return;
    
    const image = this.shadowRoot.querySelector('.product-card__image');
    const name = this.shadowRoot.querySelector('.product-card__name');
    const price = this.shadowRoot.querySelector('.product-card__price');
    
    image.src = this.getAttribute('product-image') || '';
    image.alt = this.getAttribute('product-name') || '';
    name.textContent = this.getAttribute('product-name') || '';
    
    const priceValue = this.getAttribute('product-price');
    if (priceValue) {
      price.textContent = `$${parseFloat(priceValue).toFixed(2)}`;
    }
  }
  
  _increment() {
    this.quantity = this.quantity + 1;
  }
  
  _decrement() {
    if (this.quantity > 1) {
      this.quantity = this.quantity - 1;
    }
  }
  
  _addToCart() {
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      composed: true,
      detail: {
        productId: this.getAttribute('product-id'),
        quantity: this.quantity
      }
    });
    
    this.dispatchEvent(event);
  }
}

// Define the custom element
customElements.define('product-card', ProductCard);
```

### Accessing Component Data

Web Components in AssembleJS receive data from their factory through HTML attributes:

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

The server-side renderer automatically sets the attributes based on the factory data:

```html
<!-- Server-rendered output -->
<product-card 
  product-id="12345"
  product-name="Modern Office Chair"
  product-price="199.99"
  product-image="/images/chair.jpg"
></product-card>
```

### Client-Side Behavior

To add client-side interactivity to your Web Component, you can use the client file to bridge between AssembleJS's event system and the Web Component's custom events:

```typescript
// product-card.client.ts
import { Blueprint } from 'asmbl';

class ProductCardComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for custom events from the Web Component
    this.root.addEventListener('add-to-cart', (event: CustomEvent) => {
      // Forward to AssembleJS event bus
      this.toComponents({
        productId: event.detail.productId,
        quantity: event.detail.quantity
      }, 'add');
    });
  }
}

// Register the component
export default ProductCardComponent;
```

## Advanced Web Component Features

### Using Shadow DOM

Web Components in AssembleJS can use Shadow DOM to encapsulate styles and DOM structure:

```javascript
// encapsulated-component.view.wc.js
class EncapsulatedComponent extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow root with closed mode for stronger encapsulation
    this.attachShadow({ mode: 'closed' });
    
    // Define template
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        /* These styles won't affect the rest of the page */
        :host {
          display: block;
          padding: 20px;
          background: #f9f9f9;
        }
        
        .title {
          color: #1d3557;
          font-size: 1.5rem;
        }
        
        .content {
          margin-top: 10px;
        }
      </style>
      
      <div>
        <h2 class="title">Encapsulated Component</h2>
        <div class="content">
          <slot>Default content</slot>
        </div>
      </div>
    `;
    
    // Clone and attach template
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('encapsulated-component', EncapsulatedComponent);
```

### Using Slots for Content Projection

Web Components can use slots to project content from their consumers:

```javascript
// card-container.view.wc.js
class CardContainer extends HTMLElement {
  constructor() {
    super();
    
    this.attachShadow({ mode: 'open' });
    
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .card-header {
          background: #f5f5f5;
          padding: 15px;
          border-bottom: 1px solid #ddd;
        }
        
        .card-body {
          padding: 15px;
        }
        
        .card-footer {
          background: #f5f5f5;
          padding: 15px;
          border-top: 1px solid #ddd;
        }
      </style>
      
      <div class="card">
        <div class="card-header">
          <slot name="header">
            <h3>Default Header</h3>
          </slot>
        </div>
        
        <div class="card-body">
          <slot>
            <!-- Default content -->
            <p>Card content goes here</p>
          </slot>
        </div>
        
        <div class="card-footer">
          <slot name="footer">
            <p>Default Footer</p>
          </slot>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('card-container', CardContainer);
```

Using the component with slots:

```html
<card-container>
  <h2 slot="header">Custom Header</h2>
  <div>
    <p>This is custom content for the card body.</p>
    <button>Click Me</button>
  </div>
  <div slot="footer">
    <button>Save</button>
    <button>Cancel</button>
  </div>
</card-container>
```

### Lifecycle Methods

Web Components have several lifecycle methods that you can use to control behavior:

```javascript
// lifecycle-component.view.wc.js
class LifecycleComponent extends HTMLElement {
  static get observedAttributes() {
    return ['status', 'user-id'];
  }
  
  constructor() {
    super();
    console.log('Constructor: Element created');
    
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <div>
        <h2>Lifecycle Component</h2>
        <p>Status: <span id="status"></span></p>
        <p>User ID: <span id="user-id"></span></p>
      </div>
    `;
  }
  
  connectedCallback() {
    console.log('Connected: Element added to the DOM');
    this._updateUI();
    
    // Set up event listeners
    document.addEventListener('app-event', this._handleAppEvent);
  }
  
  disconnectedCallback() {
    console.log('Disconnected: Element removed from the DOM');
    
    // Clean up event listeners
    document.removeEventListener('app-event', this._handleAppEvent);
  }
  
  adoptedCallback() {
    console.log('Adopted: Element moved to a new document');
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute changed: ${name} from ${oldValue} to ${newValue}`);
    this._updateUI();
  }
  
  _updateUI() {
    if (!this.shadowRoot) return;
    
    const statusElement = this.shadowRoot.getElementById('status');
    const userIdElement = this.shadowRoot.getElementById('user-id');
    
    if (statusElement) {
      statusElement.textContent = this.getAttribute('status') || 'unknown';
    }
    
    if (userIdElement) {
      userIdElement.textContent = this.getAttribute('user-id') || 'not set';
    }
  }
  
  _handleAppEvent = (event) => {
    console.log('App event received:', event.detail);
  }
}

customElements.define('lifecycle-component', LifecycleComponent);
```

## TypeScript Support for Web Components

For better type safety, you can use TypeScript to define your Web Components:

```typescript
// product-card.view.wc.ts
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

class ProductCard extends HTMLElement {
  // Private properties
  private _quantity: number = 1;
  private _product?: Product;
  
  // Define observed attributes
  static get observedAttributes(): string[] {
    return ['product-id', 'product-name', 'product-price', 'product-image'];
  }
  
  // Shadow DOM template
  private get template(): string {
    return `
      <style>
        /* Component styles */
      </style>
      
      <div class="product-card">
        <!-- Component structure -->
      </div>
    `;
  }
  
  constructor() {
    super();
    // Create a shadow root
    this.attachShadow({ mode: 'open' });
    // Append the template
    this.shadowRoot!.innerHTML = this.template;
    
    // Bind methods
    this._increment = this._increment.bind(this);
    this._decrement = this._decrement.bind(this);
    this._addToCart = this._addToCart.bind(this);
  }
  
  // Lifecycle callbacks
  connectedCallback(): void {
    // Implementation
  }
  
  disconnectedCallback(): void {
    // Implementation
  }
  
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    // Implementation
  }
  
  // Property getters/setters
  get quantity(): number {
    return this._quantity;
  }
  
  set quantity(value: number) {
    // Implementation
  }
  
  // Private methods
  private _updateUI(): void {
    // Implementation
  }
  
  private _increment(): void {
    // Implementation
  }
  
  private _decrement(): void {
    // Implementation
  }
  
  private _addToCart(): void {
    // Implementation
  }
}

// Define the custom element
customElements.define('product-card', ProductCard);
```

## Web Components with HTML Templates

For better performance and organization, you can use HTML templates:

```html
<!-- Include this in your HTML -->
<template id="product-card-template">
  <style>
    /* Component styles */
  </style>
  
  <div class="product-card">
    <img src="" alt="" class="product-card__image">
    <h3 class="product-card__name"></h3>
    <p class="product-card__price"></p>
    
    <div class="product-card__quantity">
      <button class="product-card__decrement">-</button>
      <span class="product-card__quantity-display">1</span>
      <button class="product-card__increment">+</button>
    </div>
    
    <button class="product-card__button">
      Add to Cart
    </button>
  </div>
</template>
```

```javascript
// product-card.view.wc.js
class ProductCard extends HTMLElement {
  constructor() {
    super();
    
    // Get the template
    const template = document.getElementById('product-card-template');
    
    // Create a shadow root
    this.attachShadow({ mode: 'open' });
    
    // Clone the template content and append it to the shadow root
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Rest of the implementation
  }
  
  // Rest of the class implementation
}

customElements.define('product-card', ProductCard);
```

## Interacting with the AssembleJS Event System

Web Components can interact with the AssembleJS event system through custom events:

```javascript
// interactive-component.view.wc.js
class InteractiveComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <div>
        <button id="action-button">Perform Action</button>
        <div id="result"></div>
      </div>
    `;
    
    this._setupEventListeners();
  }
  
  _setupEventListeners() {
    const button = this.shadowRoot.getElementById('action-button');
    
    button.addEventListener('click', () => {
      // Dispatch a custom event that bubbles up through the Shadow DOM boundary
      const event = new CustomEvent('component-action', {
        bubbles: true,
        composed: true, // Important: allows the event to cross the Shadow DOM boundary
        detail: {
          action: 'performAction',
          timestamp: Date.now()
        }
      });
      
      this.dispatchEvent(event);
    });
  }
  
  // Method that can be called from outside
  displayResult(result) {
    const resultElement = this.shadowRoot.getElementById('result');
    resultElement.textContent = result;
    resultElement.style.display = 'block';
  }
}

customElements.define('interactive-component', InteractiveComponent);
```

In your AssembleJS client file:

```typescript
// interactive-component.client.ts
import { Blueprint } from 'asmbl';

class InteractiveComponentClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for the custom event from the Web Component
    this.root.addEventListener('component-action', (event: CustomEvent) => {
      const { action, timestamp } = event.detail;
      
      // Process the action
      this.processAction(action, timestamp);
    });
  }
  
  private processAction(action: string, timestamp: number): void {
    // Handle the action
    console.log(`Processing action: ${action} at ${new Date(timestamp).toLocaleString()}`);
    
    // Call a method on the Web Component
    const result = `Action processed at ${new Date().toLocaleString()}`;
    (this.root as any).displayResult(result);
    
    // Publish an event to the AssembleJS event bus
    this.toComponents({
      action,
      result,
      timestamp
    }, 'action-processed');
  }
}

export default InteractiveComponentClient;
```

## Best Practices

1. **Prefer Shadow DOM**: Use Shadow DOM to encapsulate your component's styles and structure
2. **Custom Element Names**: Always use hyphenated names for custom elements (e.g., `product-card` not `productCard`)
3. **Attribute Naming**: Use kebab-case for attributes (e.g., `product-id` not `productId`)
4. **Use Slots for Flexibility**: Leverage slots to allow consumers to customize your component
5. **Clean Up After Yourself**: Remove event listeners and clear intervals in `disconnectedCallback`
6. **Custom Events**: Use custom events with `bubbles: true` and `composed: true` to communicate with parent components
7. **Keep Components Focused**: Create small, focused components that do one thing well
8. **Type Safety**: Use TypeScript for better type checking and developer experience
9. **Performance Considerations**: Be mindful of performance, especially in lifecycle methods
10. **Accessibility**: Ensure your Web Components are accessible with proper ARIA attributes

## Next Steps

- [Core Concepts - Components](../core-concepts-components.md) - Learn more about the component model
- [Core Concepts - Factories](../core-concepts-factories.md) - Understand how to prepare data for your components
- [Advanced Islands Architecture](../advanced-islands-architecture.md) - Learn about selective hydration
- [Cross-Framework State](../advanced-cross-framework-state.md) - Share state between Web Components and other frameworks