# Migrating from Next.js to AssembleJS

This guide provides a comprehensive pathway for migrating your Next.js application to AssembleJS. It covers the key differences between the frameworks, migration strategies, and practical examples to help you transition smoothly.

## Key Differences Between Next.js and AssembleJS

### Architecture Approach

| Next.js | AssembleJS |
|---------|------------|
| Pages-based or App Router | Component and Blueprint-based |
| React-only | Multi-framework support (React, Preact, Vue, Svelte, etc.) |
| Monolithic rendering | Islands Architecture with selective hydration |
| Directory-based routing | Controller-based routing |
| React Server Components | Server-rendered components with selective hydration |

### Performance Considerations

| Next.js | AssembleJS |
|---------|------------|
| Full-page hydration (Pages Router) | Selective component hydration |
| React Server Components (App Router) | Blueprint-based server composition |
| Route-based code splitting | Component-based code splitting |
| Large JavaScript payload | Minimal JavaScript payload |
| Framework overhead | Framework-agnostic optimizations |

### Developer Experience

| Next.js | AssembleJS |
|---------|------------|
| React-specific APIs | Framework-agnostic APIs |
| Configuration through next.config.js | Configuration through Blueprint manifests |
| API Routes | Controller-based API endpoints |
| Image and Font optimization | Asset optimization through factories |
| Middleware-based customization | Hook-based customization |

## Migration Planning

### Assessment Phase

1. **Project Audit**
   - Identify all pages and components
   - Analyze data fetching patterns
   - Review routing and navigation
   - List third-party dependencies
   - Measure bundle sizes and performance metrics

2. **Component Classification**
   - Identify components that can be directly migrated
   - List components that need refactoring
   - Determine which components should be server-rendered
   - Identify client-interactive components for selective hydration

3. **Data Fetching Strategy**
   - Map Next.js data fetching (`getServerSideProps`, `getStaticProps`, etc.) to AssembleJS Factories
   - Determine API endpoint migration plan

### Migration Strategy Options

1. **Incremental Migration**
   - Migrate one page or feature at a time
   - Run Next.js and AssembleJS in parallel
   - Use a proxy to route between the two applications
   - Gradually shift traffic from Next.js to AssembleJS

2. **Rewrite Approach**
   - Create a new AssembleJS application
   - Migrate components with minimal changes
   - Rebuild routing and data fetching
   - Test thoroughly before switching

3. **Hybrid Migration**
   - Wrap React components in AssembleJS
   - Use Blueprint Controller to handle routing
   - Switch to AssembleJS data fetching patterns
   - Replace Next.js-specific features gradually

## Step-by-Step Migration Guide

### 1. Setup AssembleJS Project

```bash
# Create a new AssembleJS project
npx asmgen
# Select "Project" from the list
# Enter your project name
# Follow the prompts
```

### 2. Migrating Pages to Blueprints

Next.js pages map to AssembleJS Blueprints. Here's how to migrate a typical page:

**Next.js Page:**

```jsx
// pages/products/[id].js
import { useRouter } from 'next/router';
import ProductHeader from '../../components/ProductHeader';
import ProductDetails from '../../components/ProductDetails';
import RelatedProducts from '../../components/RelatedProducts';

export default function ProductPage({ product, relatedProducts }) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="product-page">
      <ProductHeader product={product} />
      <ProductDetails product={product} />
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const product = await fetchProduct(id);
  const relatedProducts = await fetchRelatedProducts(id);
  
  return {
    props: {
      product,
      relatedProducts
    }
  };
}
```

**AssembleJS Blueprint Controller:**

```typescript
// src/controllers/product.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductController extends BlueprintController {
  async get(request, reply) {
    const { id } = request.params;
    
    // Render the blueprint with components
    return this.renderBlueprint(reply, {
      components: [
        {
          name: 'product-header',
          params: { productId: id }
        },
        {
          name: 'product-details',
          params: { productId: id }
        },
        {
          name: 'related-products',
          params: { productId: id }
        }
      ]
    });
  }
}
```

### 3. Migrating Components

Next.js components can be migrated to AssembleJS components:

**Next.js Component:**

```jsx
// components/ProductDetails.js
import { useState } from 'react';
import styles from './ProductDetails.module.css';

export default function ProductDetails({ product }) {
  const [quantity, setQuantity] = useState(1);
  
  const increment = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };
  
  const addToCart = () => {
    console.log(`Adding ${quantity} of ${product.name} to cart`);
    // Cart logic
  };
  
  return (
    <div className={styles.productDetails}>
      <h2>{product.name}</h2>
      <p className={styles.price}>${product.price.toFixed(2)}</p>
      <p className={styles.description}>{product.description}</p>
      
      <div className={styles.quantity}>
        <button onClick={decrement}>-</button>
        <span>{quantity}</span>
        <button onClick={increment}>+</button>
      </div>
      
      <button className={styles.addToCart} onClick={addToCart}>
        Add to Cart
      </button>
    </div>
  );
}
```

**AssembleJS Component:**

```tsx
// src/components/product/details/details.view.tsx
import { h } from 'preact';
import { useState } from 'preact/hooks';

const ProductDetails = ({ data }) => {
  const { product } = data;
  const [quantity, setQuantity] = useState(1);
  
  const increment = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };
  
  return (
    <div className="product-details">
      <h2>{product.name}</h2>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="description">{product.description}</p>
      
      <div className="quantity">
        <button onClick={decrement}>-</button>
        <span>{quantity}</span>
        <button onClick={increment}>+</button>
      </div>
      
      <button className="add-to-cart-button">
        Add to Cart
      </button>
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
    
    // Get a reference to the Add to Cart button
    const addToCartButton = this.element.querySelector('.add-to-cart-button');
    
    // Add event listener
    addToCartButton?.addEventListener('click', () => {
      const product = this.context.data.product;
      const quantity = this.element.querySelector('.quantity span')?.textContent;
      
      console.log(`Adding ${quantity} of ${product.name} to cart`);
      
      // Publish an event to notify other components
      this.eventBus.publish('cart:add', { 
        productId: product.id,
        quantity: parseInt(quantity || '1', 10)
      });
    });
  }
}

export default ProductDetailsComponent;
```

```typescript
// src/components/product/details/details.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class ProductDetailsFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Fetch product data
    const product = await fetchProduct(context.params.productId);
    
    // Add the product to the component's context data
    context.data.set('product', product);
  }
}

async function fetchProduct(id) {
  // Implementation of data fetching
  // This might be the same function used in your Next.js app
}
```

### 4. Migrating CSS

Next.js offers several ways to style components. Here's how to migrate each approach:

**CSS Modules:**

Next.js:
```jsx
import styles from './Component.module.css';

function Component() {
  return <div className={styles.container}>Content</div>;
}
```

AssembleJS:
```scss
// src/components/example/component/component.styles.scss
.container {
  // styles
}
```

```tsx
// src/components/example/component/component.view.tsx
const Component = () => {
  return <div className="container">Content</div>;
};
```

**Global CSS:**

Next.js:
```jsx
// pages/_app.js
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

AssembleJS:
```typescript
// src/server.ts
import { createBlueprintServer } from 'asmbl';
import './styles/globals.css';

createBlueprintServer({
  // configuration
});
```

**CSS-in-JS (styled-components):**

Next.js:
```jsx
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background: #f5f5f5;
`;

function Component() {
  return <Container>Content</Container>;
}
```

AssembleJS:
```tsx
// src/components/example/component/component.view.tsx
import { h } from 'preact';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background: #f5f5f5;
`;

const Component = () => {
  return <Container>Content</Container>;
};

export default Component;
```

### 5. Migrating Routing

Next.js uses file-based routing, while AssembleJS uses controllers:

**Next.js Routing:**

```jsx
// pages/blog/[slug].js
import { useRouter } from 'next/router';

export default function BlogPost({ post }) {
  const router = useRouter();
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <button onClick={() => router.push('/')}>Back to Home</button>
    </div>
  );
}

export async function getStaticPaths() {
  // ...
}

export async function getStaticProps({ params }) {
  // ...
}
```

**AssembleJS Routing:**

```typescript
// src/controllers/blog.controller.ts
import { BlueprintController } from 'asmbl';

export class BlogController extends BlueprintController {
  async get(request, reply) {
    const { slug } = request.params;
    
    return this.renderBlueprint(reply, {
      components: [
        {
          name: 'blog-post',
          params: { slug }
        }
      ]
    });
  }
}
```

For client-side navigation, use AssembleJS's event system:

```typescript
// src/components/blog/post/post.client.ts
import { Blueprint } from 'asmbl';

class BlogPostComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    const backButton = this.element.querySelector('.back-button');
    
    backButton?.addEventListener('click', () => {
      // Navigate to home
      window.location.href = '/';
      
      // Or use the event system for more complex navigation
      this.eventBus.publish('navigation:change', { 
        path: '/'
      });
    });
  }
}

export default BlogPostComponent;
```

### 6. Migrating API Routes

Next.js API routes map to AssembleJS controllers:

**Next.js API Route:**

```javascript
// pages/api/products/[id].js
export default async function handler(req, res) {
  const { id } = req.query;
  
  switch (req.method) {
    case 'GET':
      const product = await fetchProduct(id);
      return res.status(200).json(product);
    
    case 'POST':
      const updatedProduct = await updateProduct(id, req.body);
      return res.status(200).json(updatedProduct);
    
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

**AssembleJS Controller:**

```typescript
// src/controllers/api/product.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductApiController extends BlueprintController {
  // GET /api/products/:id
  async get(request, reply) {
    const { id } = request.params;
    const product = await this.fetchProduct(id);
    
    return reply.send(product);
  }
  
  // POST /api/products/:id
  async post(request, reply) {
    const { id } = request.params;
    const updatedProduct = await this.updateProduct(id, request.body);
    
    return reply.send(updatedProduct);
  }
  
  private async fetchProduct(id) {
    // Implementation
  }
  
  private async updateProduct(id, data) {
    // Implementation
  }
}
```

### 7. Migrating Authentication

If you're using Next.js Authentication (e.g., NextAuth.js), you'll need to migrate to AssembleJS's authentication system:

**Next.js Authentication:**

```jsx
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    // Other providers...
  ],
  // Configuration...
});
```

**AssembleJS Authentication:**

```typescript
// src/auth/auth.service.ts
import { Service } from 'asmbl';

export class AuthService extends Service {
  async initialize() {
    // Set up authentication providers
    this.setupGoogleAuth();
    // Other providers...
  }
  
  private setupGoogleAuth() {
    // Implementation
  }
  
  async validateUser(credentials) {
    // Implementation
  }
  
  async getUserFromToken(token) {
    // Implementation
  }
}
```

```typescript
// src/controllers/auth.controller.ts
import { BlueprintController } from 'asmbl';
import { AuthService } from '../auth/auth.service';

export class AuthController extends BlueprintController {
  private authService: AuthService;
  
  constructor() {
    super();
    this.authService = this.getService(AuthService);
  }
  
  // POST /auth/login
  async login(request, reply) {
    const { credentials } = request.body;
    const result = await this.authService.validateUser(credentials);
    
    if (result.success) {
      return reply.send({
        user: result.user,
        token: result.token
      });
    }
    
    return reply.code(401).send({ error: 'Invalid credentials' });
  }
  
  // GET /auth/user
  async getUser(request, reply) {
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    const user = await this.authService.getUserFromToken(token);
    
    if (user) {
      return reply.send({ user });
    }
    
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
```

### 8. Migrating Next.js Specific Features

#### Image Optimization

**Next.js Image Component:**

```jsx
import Image from 'next/image';

function ProductImage({ product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={500}
      height={300}
      priority
    />
  );
}
```

**AssembleJS Approach:**

```typescript
// src/factories/image.factory.ts
import { ComponentFactory } from 'asmbl';
import sharp from 'sharp';

export class ImageFactory implements ComponentFactory {
  async factory(context) {
    const { src, width, height, alt } = context.params;
    
    // Process the image if needed
    const optimizedImageUrl = await this.optimizeImage(src, width, height);
    
    // Set the data for the component
    context.data.set('imageUrl', optimizedImageUrl);
    context.data.set('alt', alt);
    context.data.set('width', width);
    context.data.set('height', height);
  }
  
  private async optimizeImage(src, width, height) {
    // Implementation of image optimization
    // using sharp or other image processing libraries
  }
}
```

```tsx
// src/components/common/optimized-image/optimized-image.view.tsx
const OptimizedImage = ({ data }) => {
  return (
    <img
      src={data.imageUrl}
      alt={data.alt}
      width={data.width}
      height={data.height}
      loading="lazy"
    />
  );
};

export default OptimizedImage;
```

#### Head Management

**Next.js Head:**

```jsx
import Head from 'next/head';

function ProductPage({ product }) {
  return (
    <>
      <Head>
        <title>{product.name} | My Store</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.imageUrl} />
      </Head>
      {/* Page content */}
    </>
  );
}
```

**AssembleJS Approach:**

```typescript
// src/controllers/product.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductController extends BlueprintController {
  async get(request, reply) {
    const { id } = request.params;
    const product = await fetchProduct(id);
    
    // Set head metadata
    reply.header('X-Head-Title', `${product.name} | My Store`);
    reply.header('X-Head-Meta-Description', product.description);
    reply.header('X-Head-Meta-OG-Title', product.name);
    reply.header('X-Head-Meta-OG-Description', product.description);
    reply.header('X-Head-Meta-OG-Image', product.imageUrl);
    
    return this.renderBlueprint(reply, {
      components: [
        // Components
      ]
    });
  }
}
```

```typescript
// src/hooks/pre.serialization.ts
import { FastifyReply } from 'fastify';

export default function preSerializationHook(reply: FastifyReply) {
  // Extract head metadata from headers
  const title = reply.getHeader('X-Head-Title') as string;
  const metaDescription = reply.getHeader('X-Head-Meta-Description') as string;
  const ogTitle = reply.getHeader('X-Head-Meta-OG-Title') as string;
  const ogDescription = reply.getHeader('X-Head-Meta-OG-Description') as string;
  const ogImage = reply.getHeader('X-Head-Meta-OG-Image') as string;
  
  // Remove custom headers
  reply.removeHeader('X-Head-Title');
  reply.removeHeader('X-Head-Meta-Description');
  reply.removeHeader('X-Head-Meta-OG-Title');
  reply.removeHeader('X-Head-Meta-OG-Description');
  reply.removeHeader('X-Head-Meta-OG-Image');
  
  // Add head tags to the HTML
  if (reply.context.head) {
    if (title) {
      reply.context.head.title = title;
    }
    
    if (metaDescription) {
      reply.context.head.meta.push({
        name: 'description',
        content: metaDescription
      });
    }
    
    if (ogTitle) {
      reply.context.head.meta.push({
        property: 'og:title',
        content: ogTitle
      });
    }
    
    if (ogDescription) {
      reply.context.head.meta.push({
        property: 'og:description',
        content: ogDescription
      });
    }
    
    if (ogImage) {
      reply.context.head.meta.push({
        property: 'og:image',
        content: ogImage
      });
    }
  }
}
```

## Advanced Migration Topics

### Server-Side Rendering (SSR)

Next.js provides SSR through `getServerSideProps`. In AssembleJS, server-side rendering is handled through Factories:

**Next.js SSR:**

```jsx
export async function getServerSideProps(context) {
  const { id } = context.params;
  const product = await fetchProduct(id);
  
  return {
    props: {
      product
    }
  };
}
```

**AssembleJS SSR:**

```typescript
// src/components/product/details/details.factory.ts
import { ComponentFactory } from 'asmbl';

export class ProductDetailsFactory implements ComponentFactory {
  async factory(context) {
    const { productId } = context.params;
    const product = await fetchProduct(productId);
    
    context.data.set('product', product);
  }
}
```

### Static Site Generation (SSG)

Next.js enables SSG through `getStaticProps` and `getStaticPaths`. AssembleJS handles this through pre-rendering:

**Next.js SSG:**

```jsx
export async function getStaticPaths() {
  const products = await fetchAllProducts();
  
  const paths = products.map(product => ({
    params: { id: product.id.toString() }
  }));
  
  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const { id } = params;
  const product = await fetchProduct(id);
  
  return {
    props: {
      product
    },
    revalidate: 60 // ISR - revalidate every 60 seconds
  };
}
```

**AssembleJS SSG:**

```typescript
// src/controllers/product.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductController extends BlueprintController {
  // Configuration for static generation
  static prerender = {
    enabled: true,
    paths: async () => {
      const products = await fetchAllProducts();
      
      return products.map(product => ({
        params: { id: product.id.toString() }
      }));
    },
    revalidate: 60 // Revalidate every 60 seconds
  };
  
  async get(request, reply) {
    const { id } = request.params;
    
    return this.renderBlueprint(reply, {
      components: [
        {
          name: 'product-details',
          params: { productId: id }
        }
      ]
    });
  }
}
```

### Incremental Static Regeneration (ISR)

Next.js supports ISR through the `revalidate` option. AssembleJS provides similar functionality:

**Next.js ISR:**

```jsx
export async function getStaticProps({ params }) {
  const { id } = params;
  const product = await fetchProduct(id);
  
  return {
    props: {
      product
    },
    revalidate: 60 // Revalidate every 60 seconds
  };
}
```

**AssembleJS ISR:**

```typescript
// src/controllers/product.controller.ts
import { BlueprintController } from 'asmbl';

export class ProductController extends BlueprintController {
  static prerender = {
    enabled: true,
    revalidate: 60 // Revalidate every 60 seconds
  };
  
  // Implementation
}
```

## Testing Your Migration

1. **Unit Tests**: Update your unit tests to work with AssembleJS components
2. **Integration Tests**: Test the interaction between components and the event system
3. **End-to-End Tests**: Verify the complete user flows
4. **Performance Testing**: Compare the performance between Next.js and AssembleJS
5. **Progressive Rollout**: Use feature flags to gradually enable AssembleJS for a subset of users

## Common Challenges and Solutions

### Challenge: Next.js-specific Libraries

Some libraries are specifically designed for Next.js and may not work directly with AssembleJS.

**Solution:**
- Look for framework-agnostic alternatives
- Create adapter components to bridge the gap
- Implement equivalent functionality using AssembleJS features

### Challenge: Data Fetching Patterns

Next.js has specific data fetching patterns that differ from AssembleJS.

**Solution:**
- Move data fetching logic to Factories
- Use dependency injection for data access
- Implement caching strategies for optimal performance

### Challenge: Complex Routing

Next.js's file-based routing may not map directly to AssembleJS controllers.

**Solution:**
- Create a routing map to track the conversion
- Implement redirects for maintaining backward compatibility
- Use parameterized routes for dynamic pages

## Conclusion

Migrating from Next.js to AssembleJS requires careful planning and execution, but the benefits of improved performance, smaller bundle sizes, and framework flexibility make it a worthwhile investment. By following this guide, you can leverage the strengths of AssembleJS while maintaining the core functionality of your Next.js application.

Remember to:
- Start with a thorough assessment of your application
- Choose the appropriate migration strategy
- Migrate components, routes, and data fetching
- Test thoroughly at each step
- Roll out changes gradually

With AssembleJS's powerful component model and optimized rendering, your application will benefit from improved performance and a more flexible architecture.