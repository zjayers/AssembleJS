# Migrating from Angular to AssembleJS

This guide provides a comprehensive approach to migrating your Angular application to AssembleJS. It covers the key differences, migration strategies, and practical examples to help you transition smoothly.

## Key Differences Between Angular and AssembleJS

### Architecture Approach

| Angular | AssembleJS |
|---------|------------|
| Component-based with modules | Component and Blueprint-based |
| Full-framework approach | Lightweight, modular approach |
| TypeScript-first | TypeScript-supported with flexibility |
| Angular-specific patterns | Framework-agnostic component model |
| Template syntax with bindings | Multiple templating options |

### Performance Considerations

| Angular | AssembleJS |
|---------|------------|
| Full-page hydration | Selective component hydration |
| Zone.js change detection | No change detection overhead |
| Angular compiler optimization | Framework-agnostic optimizations |
| Large framework bundle | Minimal runtime JavaScript |
| Module-based lazy loading | Automatic fine-grained code splitting |

### Developer Experience

| Angular | AssembleJS |
|---------|------------|
| Angular CLI tooling | AssembleJS CLI tools |
| Angular-specific decorators | Plain class-based components |
| NgModules for organization | Blueprint-based organization |
| Dependency Injection system | Service-based dependency management |
| RxJS for reactivity | Event system for component communication |

## Migration Planning

### Assessment Phase

1. **Project Audit**
   - Catalog all Angular components and modules
   - Identify services and dependency relationships
   - Review state management patterns
   - Analyze routing configuration
   - Map HTTP/API integration points

2. **Component Classification**
   - Identify standalone components for direct migration
   - List components with complex dependencies
   - Determine which components should be server-rendered
   - Identify client-interactive components

3. **State and Service Analysis**
   - Map Angular services to AssembleJS services
   - Plan data flow and service integration
   - Determine factory data preparation strategy

### Migration Strategy Options

1. **Incremental Migration**
   - Migrate one module or feature at a time
   - Begin with simpler, less-connected components
   - Gradually replace Angular services with AssembleJS services
   - Set up proper interaction between Angular and AssembleJS parts

2. **Parallel Implementation**
   - Create a new AssembleJS application
   - Implement critical features in AssembleJS
   - Use a proxy to route between the two applications
   - Gradually shift traffic from Angular to AssembleJS

3. **Clean Break Approach**
   - Completely rewrite the application in AssembleJS
   - Focus on improved architecture and performance
   - Use the opportunity to modernize UI/UX
   - Maintain API compatibility for backend integration

## Step-by-Step Migration Guide

### 1. Setup AssembleJS Project

```bash
# Create a new AssembleJS project
npx asmgen
# Select "Project" from the list
# Enter your project name
# Follow the prompts
```

### 2. Migrating Angular Components to AssembleJS Components

#### Simple Angular Component

**Angular Component:**

```typescript
// product-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product: Product;
  @Output() addToCart = new EventEmitter<{product: Product, quantity: number}>();
  
  quantity = 1;
  
  increment(): void {
    this.quantity++;
  }
  
  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  handleAddToCart(): void {
    this.addToCart.emit({
      product: this.product,
      quantity: this.quantity
    });
  }
}
```

```html
<!-- product-card.component.html -->
<div class="product-card">
  <img [src]="product.imageUrl" [alt]="product.name" />
  <h3>{{ product.name }}</h3>
  <p class="price">{{ product.price | currency }}</p>
  
  <div class="quantity-control">
    <button (click)="decrement()">-</button>
    <span>{{ quantity }}</span>
    <button (click)="increment()">+</button>
  </div>
  
  <button class="add-to-cart-button" (click)="handleAddToCart()">
    Add to Cart
  </button>
</div>
```

```scss
/* product-card.component.scss */
.product-card {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.price {
  font-weight: bold;
  color: #e63946;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.quantity-control button {
  background: #f1f1f1;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-control span {
  margin: 0 1rem;
}

.add-to-cart-button {
  background: #457b9d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.add-to-cart-button:hover {
  background: #1d3557;
}
```

**AssembleJS Component:**

```tsx
// src/components/product/card/card.view.tsx
import { h } from 'preact';

interface ProductCardProps {
  data: {
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string;
    };
    initialQuantity: number;
  };
}

const ProductCard = ({ data }: ProductCardProps) => {
  const { product, initialQuantity } = data;
  
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
      
      <div className="quantity-control">
        <button className="decrement">-</button>
        <span className="quantity-display">{initialQuantity}</span>
        <button className="increment">+</button>
      </div>
      
      <button className="add-to-cart-button">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
```

```typescript
// src/components/product/card/card.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ProductCardFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get product data from params or fetch from API
    const product = context.params.product || await this.fetchProduct(context.params.productId);
    
    // Set data for the component
    context.data.set('product', product);
    context.data.set('initialQuantity', 1);
  }
  
  private async fetchProduct(productId: string) {
    if (!productId) {
      return null;
    }
    
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    return response.json();
  }
}
```

```typescript
// src/components/product/card/card.client.ts
import { Blueprint } from 'asmbl';

class ProductCardComponent extends Blueprint {
  private quantity: number = 1;
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize from server-rendered state
    const quantityDisplay = this.element.querySelector('.quantity-display');
    if (quantityDisplay) {
      this.quantity = parseInt(quantityDisplay.textContent || '1', 10);
    }
    
    // Get references to elements
    const decrementButton = this.element.querySelector('.decrement');
    const incrementButton = this.element.querySelector('.increment');
    const addToCartButton = this.element.querySelector('.add-to-cart-button');
    
    // Add event listeners
    decrementButton?.addEventListener('click', () => this.decrement());
    incrementButton?.addEventListener('click', () => this.increment());
    addToCartButton?.addEventListener('click', () => this.handleAddToCart());
  }
  
  private increment(): void {
    this.quantity++;
    this.updateDisplay();
  }
  
  private decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateDisplay();
    }
  }
  
  private updateDisplay(): void {
    const quantityDisplay = this.element.querySelector('.quantity-display');
    if (quantityDisplay) {
      quantityDisplay.textContent = this.quantity.toString();
    }
  }
  
  private handleAddToCart(): void {
    const product = this.context.data.product;
    
    // Publish event to replace @Output event emitter
    this.eventBus.publish('cart:add', {
      product,
      quantity: this.quantity
    });
  }
}

export default ProductCardComponent;
```

```scss
// src/components/product/card/card.styles.scss
.product-card {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.price {
  font-weight: bold;
  color: #e63946;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.quantity-control button {
  background: #f1f1f1;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-control span {
  margin: 0 1rem;
}

.add-to-cart-button {
  background: #457b9d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.add-to-cart-button:hover {
  background: #1d3557;
}
```

### 3. Migrating Angular Services

**Angular Service:**

```typescript
// product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';
  private productsCache = new Map<string, Product>();
  
  constructor(private http: HttpClient) {}
  
  getProducts(filters?: any): Observable<Product[]> {
    let url = this.apiUrl;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return this.http.get<Product[]>(url).pipe(
      tap(products => {
        // Update cache
        products.forEach(product => {
          this.productsCache.set(product.id, product);
        });
      }),
      catchError(this.handleError<Product[]>('getProducts', []))
    );
  }
  
  getProduct(id: string): Observable<Product> {
    // Check cache first
    if (this.productsCache.has(id)) {
      return of(this.productsCache.get(id) as Product);
    }
    
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(product => {
        // Update cache
        this.productsCache.set(id, product);
      }),
      catchError(this.handleError<Product>(`getProduct id=${id}`))
    );
  }
  
  searchProducts(term: string): Observable<Product[]> {
    if (!term.trim()) {
      return of([]);
    }
    
    return this.http.get<Product[]>(`${this.apiUrl}?q=${term}`).pipe(
      catchError(this.handleError<Product[]>('searchProducts', []))
    );
  }
  
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
```

**AssembleJS Service:**

```typescript
// src/services/product.service.ts
import { Service } from 'asmbl';
import { Product } from '../models/product.model';

export class ProductService extends Service {
  private apiUrl = '/api/products';
  private productsCache = new Map<string, Product>();
  
  initialize() {
    // Service initialization if needed
  }
  
  async getProducts(filters?: Record<string, any>): Promise<Product[]> {
    let url = this.apiUrl;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      
      const products: Product[] = await response.json();
      
      // Update cache
      products.forEach(product => {
        this.productsCache.set(product.id, product);
      });
      
      return products;
    } catch (error) {
      console.error(`getProducts failed: ${error.message}`);
      return [];
    }
  }
  
  async getProduct(id: string): Promise<Product | null> {
    // Check cache first
    if (this.productsCache.has(id)) {
      return this.productsCache.get(id) as Product;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      
      const product: Product = await response.json();
      
      // Update cache
      this.productsCache.set(id, product);
      
      return product;
    } catch (error) {
      console.error(`getProduct id=${id} failed: ${error.message}`);
      return null;
    }
  }
  
  async searchProducts(term: string): Promise<Product[]> {
    if (!term.trim()) {
      return [];
    }
    
    try {
      const response = await fetch(`${this.apiUrl}?q=${term}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`searchProducts failed: ${error.message}`);
      return [];
    }
  }
}
```

### 4. Migrating Angular Modules

**Angular Module:**

```typescript
// product.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductFilterComponent } from './product-filter/product-filter.component';
import { ProductSearchComponent } from './product-search/product-search.component';

import { ProductService } from './services/product.service';
import { ProductReviewService } from './services/product-review.service';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    ProductCardComponent,
    ProductFilterComponent,
    ProductSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: 'products', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailComponent }
    ])
  ],
  providers: [
    ProductService,
    ProductReviewService
  ],
  exports: [
    ProductCardComponent,
    ProductSearchComponent
  ]
})
export class ProductModule { }
```

**AssembleJS Blueprint Controllers:**

```typescript
// src/controllers/product-list.controller.ts
import { BlueprintController } from 'asmbl';
import { ProductService } from '../services/product.service';

export class ProductListController extends BlueprintController {
  private productService: ProductService;
  
  constructor() {
    super();
    this.productService = this.getService(ProductService);
  }
  
  async get(request, reply) {
    const { category, sortBy, page = 1 } = request.query;
    
    // Fetch products
    const products = await this.productService.getProducts({
      category,
      sortBy,
      page
    });
    
    return this.renderBlueprint(reply, {
      components: [
        { 
          name: 'product-filter',
          params: { 
            category,
            sortBy
          }
        },
        { 
          name: 'product-list',
          params: { 
            products,
            currentPage: page
          }
        }
      ]
    });
  }
}
```

```typescript
// src/controllers/product-detail.controller.ts
import { BlueprintController } from 'asmbl';
import { ProductService } from '../services/product.service';
import { ProductReviewService } from '../services/product-review.service';

export class ProductDetailController extends BlueprintController {
  private productService: ProductService;
  private reviewService: ProductReviewService;
  
  constructor() {
    super();
    this.productService = this.getService(ProductService);
    this.reviewService = this.getService(ProductReviewService);
  }
  
  async get(request, reply) {
    const { id } = request.params;
    
    // Fetch product and reviews in parallel
    const [product, reviews] = await Promise.all([
      this.productService.getProduct(id),
      this.reviewService.getReviews(id)
    ]);
    
    if (!product) {
      return reply.code(404).send({ error: 'Product not found' });
    }
    
    return this.renderBlueprint(reply, {
      components: [
        { 
          name: 'product-detail',
          params: { product }
        },
        { 
          name: 'product-reviews',
          params: { 
            productId: id,
            reviews
          }
        },
        { 
          name: 'related-products',
          params: { 
            category: product.category,
            currentProductId: id
          }
        }
      ]
    });
  }
}
```

### 5. Migrating Angular Routing

**Angular Routes:**

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { 
    path: 'account', 
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**AssembleJS Controllers and Auth Middleware:**

```typescript
// src/server.ts
import { createBlueprintServer } from 'asmbl';
import { HomeController } from './controllers/home.controller';
import { AboutController } from './controllers/about.controller';
import { ContactController } from './controllers/contact.controller';
import { NotFoundController } from './controllers/not-found.controller';
import { AccountController } from './controllers/account.controller';
import { AdminController } from './controllers/admin.controller';
import { authMiddleware } from './middleware/auth.middleware';
import { roleMiddleware } from './middleware/role.middleware';

// Create server
createBlueprintServer({
  serverRoot: import.meta.url,
  manifest: {
    controllers: [
      // Public routes
      { path: '/', controller: HomeController },
      { path: '/about', controller: AboutController },
      { path: '/contact', controller: ContactController },
      
      // Protected routes
      { 
        path: '/account', 
        controller: AccountController,
        hooks: {
          preHandler: [authMiddleware]
        }
      },
      { 
        path: '/admin', 
        controller: AdminController,
        hooks: {
          preHandler: [
            authMiddleware,
            (request, reply, done) => roleMiddleware(request, reply, done, ['ADMIN'])
          ]
        }
      },
      
      // 404 fallback
      { path: '*', controller: NotFoundController }
    ]
  }
});
```

```typescript
// src/middleware/auth.middleware.ts
export async function authMiddleware(request, reply) {
  // Check for authentication
  const token = request.cookies.token || request.headers.authorization?.split(' ')[1];
  
  if (!token) {
    // Redirect to login page
    return reply.redirect(`/login?returnUrl=${encodeURIComponent(request.url)}`);
  }
  
  try {
    // Validate token (implementation depends on your auth system)
    const user = await validateToken(token);
    
    // Attach user to request for later use
    request.user = user;
  } catch (error) {
    // Token invalid, redirect to login
    return reply.redirect(`/login?returnUrl=${encodeURIComponent(request.url)}`);
  }
}

async function validateToken(token: string) {
  // Implementation of token validation
  const response = await fetch('/api/auth/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  
  if (!response.ok) {
    throw new Error('Invalid token');
  }
  
  return response.json();
}
```

```typescript
// src/middleware/role.middleware.ts
export function roleMiddleware(request, reply, done, requiredRoles: string[]) {
  // Check if user has required roles
  const user = request.user;
  
  if (!user || !user.roles) {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  
  const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
  
  if (!hasRequiredRole) {
    return reply.code(403).send({ error: 'Forbidden' });
  }
  
  done();
}
```

### 6. Migrating Angular Forms

**Angular Reactive Form:**

```typescript
// contact-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../services/contact.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;
  success = false;
  error = '';
  
  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}
  
  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  get f() {
    return this.contactForm.controls;
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.contactForm.invalid) {
      return;
    }
    
    this.contactService.submitContact(this.contactForm.value)
      .subscribe(
        response => {
          this.success = true;
          this.contactForm.reset();
          this.submitted = false;
        },
        error => {
          this.error = error.message || 'An error occurred. Please try again.';
        }
      );
  }
}
```

```html
<!-- contact-form.component.html -->
<div class="contact-form-container">
  <h2>Contact Us</h2>
  
  <div *ngIf="success" class="alert alert-success">
    Your message has been sent successfully. We'll get back to you soon!
  </div>
  
  <div *ngIf="error" class="alert alert-danger">
    {{ error }}
  </div>
  
  <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" novalidate>
    <div class="form-group">
      <label for="name">Name</label>
      <input
        type="text"
        id="name"
        formControlName="name"
        class="form-control"
        [ngClass]="{ 'is-invalid': submitted && f.name.errors }"
      />
      <div *ngIf="submitted && f.name.errors" class="invalid-feedback">
        <div *ngIf="f.name.errors.required">Name is required</div>
        <div *ngIf="f.name.errors.minlength">Name must be at least 2 characters</div>
      </div>
    </div>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        formControlName="email"
        class="form-control"
        [ngClass]="{ 'is-invalid': submitted && f.email.errors }"
      />
      <div *ngIf="submitted && f.email.errors" class="invalid-feedback">
        <div *ngIf="f.email.errors.required">Email is required</div>
        <div *ngIf="f.email.errors.email">Email must be a valid email address</div>
      </div>
    </div>
    
    <div class="form-group">
      <label for="subject">Subject</label>
      <input
        type="text"
        id="subject"
        formControlName="subject"
        class="form-control"
        [ngClass]="{ 'is-invalid': submitted && f.subject.errors }"
      />
      <div *ngIf="submitted && f.subject.errors" class="invalid-feedback">
        <div *ngIf="f.subject.errors.required">Subject is required</div>
      </div>
    </div>
    
    <div class="form-group">
      <label for="message">Message</label>
      <textarea
        id="message"
        formControlName="message"
        rows="5"
        class="form-control"
        [ngClass]="{ 'is-invalid': submitted && f.message.errors }"
      ></textarea>
      <div *ngIf="submitted && f.message.errors" class="invalid-feedback">
        <div *ngIf="f.message.errors.required">Message is required</div>
        <div *ngIf="f.message.errors.minlength">Message must be at least 10 characters</div>
      </div>
    </div>
    
    <div class="form-group">
      <button type="submit" class="btn btn-primary">Submit</button>
    </div>
  </form>
</div>
```

**AssembleJS Form Component:**

```tsx
// src/components/contact/form/form.view.tsx
import { h } from 'preact';

const ContactForm = ({ data }) => {
  const { success, error } = data;
  
  return (
    <div className="contact-form-container">
      <h2>Contact Us</h2>
      
      {success && (
        <div className="alert alert-success">
          Your message has been sent successfully. We'll get back to you soon!
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <form id="contact-form" noValidate>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
          />
          <div className="invalid-feedback name-error"></div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
          />
          <div className="invalid-feedback email-error"></div>
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="form-control"
          />
          <div className="invalid-feedback subject-error"></div>
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="form-control"
          ></textarea>
          <div className="invalid-feedback message-error"></div>
        </div>
        
        <div className="form-group">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
```

```typescript
// src/components/contact/form/form.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ContactFormFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Set initial form state
    context.data.set('success', false);
    context.data.set('error', '');
  }
}
```

```typescript
// src/components/contact/form/form.client.ts
import { Blueprint } from 'asmbl';
import { ContactService } from '../../../services/contact.service';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

class ContactFormComponent extends Blueprint {
  private contactService: ContactService;
  private form: HTMLFormElement | null = null;
  private submitted: boolean = false;
  
  protected override onMount(): void {
    super.onMount();
    
    // Get service
    this.contactService = this.getService(ContactService);
    
    // Get form element
    this.form = this.element.querySelector('#contact-form');
    
    // Add event listener
    this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  private handleSubmit(e: Event): void {
    e.preventDefault();
    this.submitted = true;
    
    if (!this.form) return;
    
    // Get form values
    const formData = new FormData(this.form);
    const values: FormValues = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string
    };
    
    // Validate form
    const errors = this.validateForm(values);
    
    if (Object.keys(errors).length > 0) {
      this.showValidationErrors(errors);
      return;
    }
    
    // Submit form
    this.submitForm(values);
  }
  
  private validateForm(values: FormValues): Record<string, string> {
    const errors: Record<string, string> = {};
    
    // Name validation
    if (!values.name) {
      errors.name = 'Name is required';
    } else if (values.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email must be a valid email address';
    }
    
    // Subject validation
    if (!values.subject) {
      errors.subject = 'Subject is required';
    }
    
    // Message validation
    if (!values.message) {
      errors.message = 'Message is required';
    } else if (values.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    return errors;
  }
  
  private showValidationErrors(errors: Record<string, string>): void {
    // Reset all validation states
    const inputs = this.form!.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.classList.remove('is-invalid');
    });
    
    const errorElements = this.form!.querySelectorAll('.invalid-feedback');
    errorElements.forEach(element => {
      element.textContent = '';
    });
    
    // Show errors
    Object.entries(errors).forEach(([field, message]) => {
      const input = this.form!.querySelector(`[name="${field}"]`);
      const errorElement = this.form!.querySelector(`.${field}-error`);
      
      if (input && errorElement) {
        input.classList.add('is-invalid');
        errorElement.textContent = message;
      }
    });
  }
  
  private async submitForm(values: FormValues): Promise<void> {
    try {
      await this.contactService.submitContact(values);
      
      // Show success message
      this.showSuccessMessage();
      
      // Reset form
      this.form!.reset();
      this.submitted = false;
      
      // Hide validation errors
      const inputs = this.form!.querySelectorAll('.form-control');
      inputs.forEach(input => {
        input.classList.remove('is-invalid');
      });
    } catch (error) {
      // Show error message
      this.showErrorMessage(error.message || 'An error occurred. Please try again.');
    }
  }
  
  private showSuccessMessage(): void {
    // Find existing success message or create new one
    let successElement = this.element.querySelector('.alert-success');
    
    if (!successElement) {
      successElement = document.createElement('div');
      successElement.className = 'alert alert-success';
      successElement.textContent = 'Your message has been sent successfully. We\'ll get back to you soon!';
      this.element.querySelector('.contact-form-container')?.insertBefore(
        successElement,
        this.form
      );
    } else {
      successElement.classList.remove('hidden');
    }
    
    // Hide any error message
    const errorElement = this.element.querySelector('.alert-danger');
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }
  
  private showErrorMessage(message: string): void {
    // Find existing error message or create new one
    let errorElement = this.element.querySelector('.alert-danger');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'alert alert-danger';
      this.element.querySelector('.contact-form-container')?.insertBefore(
        errorElement,
        this.form
      );
    }
    
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // Hide any success message
    const successElement = this.element.querySelector('.alert-success');
    if (successElement) {
      successElement.classList.add('hidden');
    }
  }
}

export default ContactFormComponent;
```

### 7. Migrating Angular Directives

**Angular Directive:**

```typescript
// highlight.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input('appHighlight') highlightColor: string = 'yellow';
  @Input() defaultColor: string = 'transparent';
  
  constructor(private el: ElementRef) {
    this.setBackgroundColor(this.defaultColor);
  }
  
  @HostListener('mouseenter') onMouseEnter() {
    this.setBackgroundColor(this.highlightColor);
  }
  
  @HostListener('mouseleave') onMouseLeave() {
    this.setBackgroundColor(this.defaultColor);
  }
  
  private setBackgroundColor(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

**AssembleJS Component with Similar Functionality:**

```typescript
// src/components/common/highlight/highlight.client.ts
import { Blueprint } from 'asmbl';

class HighlightComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Get highlight color
    const highlightColor = this.element.getAttribute('data-highlight-color') || 'yellow';
    const defaultColor = this.element.getAttribute('data-default-color') || 'transparent';
    
    // Set initial background color
    this.element.style.backgroundColor = defaultColor;
    
    // Add event listeners
    this.element.addEventListener('mouseenter', () => {
      this.element.style.backgroundColor = highlightColor;
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.element.style.backgroundColor = defaultColor;
    });
  }
}

export default HighlightComponent;
```

To use this component:

```html
<div data-component="highlight" data-highlight-color="lightblue" data-default-color="white">
  Hover over me
</div>
```

## Advanced Migration Topics

### Handling Angular Dependency Injection

**Angular Service with Dependency Injection:**

```typescript
// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  getCurrentUser(): Observable<User> {
    return this.authService.getToken().pipe(
      map(token => {
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        return this.http.get<User>(`${this.apiUrl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }),
      catchError(error => {
        console.error('Failed to get current user:', error);
        throw error;
      })
    );
  }
  
  updateProfile(data: Partial<User>): Observable<User> {
    return this.authService.getToken().pipe(
      map(token => {
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        return this.http.put<User>(`${this.apiUrl}/me`, data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }),
      catchError(error => {
        console.error('Failed to update profile:', error);
        throw error;
      })
    );
  }
}
```

**AssembleJS Services:**

```typescript
// src/services/auth.service.ts
import { Service } from 'asmbl';

export class AuthService extends Service {
  private token: string | null = null;
  
  initialize() {
    // Check for existing token
    this.token = localStorage.getItem('token');
  }
  
  getToken(): string | null {
    return this.token;
  }
  
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }
  
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.token;
  }
}
```

```typescript
// src/services/user.service.ts
import { Service } from 'asmbl';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

export class UserService extends Service {
  private apiUrl = '/api/users';
  private authService: AuthService;
  
  initialize() {
    // Get auth service
    this.authService = this.getService(AuthService);
  }
  
  async getCurrentUser(): Promise<User> {
    const token = this.authService.getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get current user: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }
  
  async updateProfile(data: Partial<User>): Promise<User> {
    const token = this.authService.getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
}
```

### Handling Angular Change Detection

**Angular Component with ChangeDetection:**

```typescript
// counter.component.ts
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  count = 0;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  increment(): void {
    this.count++;
    this.cdr.markForCheck();
  }
  
  decrement(): void {
    if (this.count > 0) {
      this.count--;
      this.cdr.markForCheck();
    }
  }
  
  reset(): void {
    this.count = 0;
    this.cdr.markForCheck();
  }
  
  // Simulated async operation
  incrementAsync(): void {
    setTimeout(() => {
      this.count++;
      this.cdr.markForCheck();
    }, 1000);
  }
}
```

**AssembleJS Component:**

```typescript
// src/components/common/counter/counter.client.ts
import { Blueprint } from 'asmbl';

class CounterComponent extends Blueprint {
  private count: number = 0;
  
  protected override onMount(): void {
    super.onMount();
    
    // Initialize count
    const countDisplay = this.element.querySelector('.count-display');
    if (countDisplay) {
      this.count = parseInt(countDisplay.textContent || '0', 10);
    }
    
    // Get button elements
    const incrementButton = this.element.querySelector('.increment-button');
    const decrementButton = this.element.querySelector('.decrement-button');
    const resetButton = this.element.querySelector('.reset-button');
    const incrementAsyncButton = this.element.querySelector('.increment-async-button');
    
    // Add event listeners
    incrementButton?.addEventListener('click', () => this.increment());
    decrementButton?.addEventListener('click', () => this.decrement());
    resetButton?.addEventListener('click', () => this.reset());
    incrementAsyncButton?.addEventListener('click', () => this.incrementAsync());
  }
  
  private increment(): void {
    this.count++;
    this.updateUI();
  }
  
  private decrement(): void {
    if (this.count > 0) {
      this.count--;
      this.updateUI();
    }
  }
  
  private reset(): void {
    this.count = 0;
    this.updateUI();
  }
  
  private incrementAsync(): void {
    // Update button state
    const button = this.element.querySelector('.increment-async-button');
    if (button) {
      button.setAttribute('disabled', 'true');
      button.textContent = 'Processing...';
    }
    
    setTimeout(() => {
      this.count++;
      this.updateUI();
      
      // Reset button state
      if (button) {
        button.removeAttribute('disabled');
        button.textContent = 'Increment Async';
      }
    }, 1000);
  }
  
  private updateUI(): void {
    const countDisplay = this.element.querySelector('.count-display');
    if (countDisplay) {
      countDisplay.textContent = this.count.toString();
    }
  }
}

export default CounterComponent;
```

## Testing Your Migration

1. **Unit Testing**: Update your tests to match the new component structure
2. **Integration Testing**: Test the interaction between components
3. **End-to-End Testing**: Verify the complete user flows
4. **Performance Testing**: Compare performance metrics before and after migration
5. **Browser Compatibility Testing**: Ensure the application works across browsers

## Common Challenges and Solutions

### Challenge: Angular-Specific Features

Angular has many framework-specific features that may not have direct equivalents in AssembleJS.

**Solution:**
- Identify the core functionality and implement it using AssembleJS patterns
- Create utility functions for common Angular behaviors
- Use the flexibility of AssembleJS to create custom solutions

### Challenge: RxJS Dependencies

Angular heavily uses RxJS for reactive programming.

**Solution:**
- Replace RxJS Observables with Promise-based approaches
- Use the AssembleJS event system for reactive patterns
- Implement simple stream-like patterns where needed

### Challenge: NgModules Organization

Angular's NgModules organization doesn't directly map to AssembleJS.

**Solution:**
- Organize components by feature in the directory structure
- Use Blueprint Controllers to manage routing and composition
- Create service registrations in the server configuration

## Conclusion

Migrating from Angular to AssembleJS requires thoughtful planning and execution, but offers significant benefits in terms of performance, flexibility, and reduced complexity. By following this guide, you can leverage the strengths of AssembleJS while maintaining the core functionality and user experience of your Angular application.

Remember to:
- Start with a thorough assessment of your Angular application
- Choose an appropriate migration strategy
- Migrate components and services systematically
- Test thoroughly at each step
- Train your team on the new patterns and practices

With AssembleJS's server-first approach and selective hydration, your application will benefit from improved performance, smaller bundle sizes, and a more flexible architecture.