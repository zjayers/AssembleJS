# Project Structure

This guide outlines recommended project structures and organization patterns for AssembleJS applications. Following these conventions will help maintain consistency across your codebase and enable teams to work efficiently.

## Standard Directory Structure

AssembleJS projects typically follow this structure:

```
src/
├── controllers/    # API controllers
├── components/     # UI components
├── blueprints/     # Blueprint compositions
├── factories/      # Data fetching factories
├── services/       # Shared services
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── server.ts       # Main server entry point
```

Let's explore each directory and its purpose:

### `/src/controllers/`

Controllers handle API endpoints and request processing:

```typescript
// src/controllers/user.controller.ts
import { BlueprintController } from 'assemblejs';

export class UserController extends BlueprintController {
  async handleRequest(request, reply) {
    const users = await this.services.userService.getAllUsers();
    
    return reply.send(users);
  }
}
```

Best practices:
- Use the `.controller.ts` suffix for all controller files
- Group related controllers in subdirectories
- Keep controllers focused on a single resource or domain
- Use dependency injection for services
- Implement proper error handling

### `/src/components/`

Components are UI building blocks with their own templates, styles, and logic:

```
components/
├── header/
│   ├── main/           # Component view name
│   │   ├── main.client.ts       # Client-side logic
│   │   ├── main.styles.scss     # Component-specific styles
│   │   └── main.view.tsx        # Component template (Preact)
│   └── mobile/         # Mobile-specific variation
│       ├── mobile.client.ts
│       ├── mobile.styles.scss
│       └── mobile.view.tsx
└── footer/
    └── main/
        ├── main.client.ts
        ├── main.styles.scss
        └── main.view.ejs        # EJS template
```

Best practices:
- Organize by component name first, then view name
- Keep components small and focused on a single responsibility
- Create device-specific views when needed
- Use consistent naming conventions
- Include all related files (client, styles, view) in the view directory

### `/src/blueprints/`

Blueprints compose multiple components into complete pages or features:

```
blueprints/
├── home/
│   └── main/
│       ├── main.client.ts       # Client-side logic
│       ├── main.styles.scss     # Blueprint-specific styles
│       └── main.view.tsx        # Blueprint template
└── product/
    ├── detail/
    │   ├── detail.client.ts
    │   ├── detail.styles.scss
    │   └── detail.view.tsx
    └── list/
        ├── list.client.ts
        ├── list.styles.scss
        └── list.view.tsx
```

Best practices:
- Organize by blueprint name (often maps to routes)
- Keep blueprint templates minimal, focusing on component composition
- Use consistent naming between route paths and blueprint directories
- Create multiple views for different aspects of a feature

### `/src/factories/`

Factories prepare data on the server before rendering:

```typescript
// src/factories/product.factory.ts
import { ComponentFactory } from 'assemblejs';

export class ProductFactory implements ComponentFactory {
  priority = 10; // Higher priority factories run first
  
  async factory(context) {
    const productId = context.params.id;
    const product = await context.services.productService.getProduct(productId);
    
    context.data.set('product', product);
    
    // Fetch related products if this product exists
    if (product) {
      const relatedProducts = await context.services.productService.getRelatedProducts(productId);
      context.data.set('relatedProducts', relatedProducts);
    }
  }
}
```

Best practices:
- Use the `.factory.ts` suffix for all factory files
- Set appropriate priority levels
- Fetch only the data needed for rendering
- Handle errors gracefully
- Avoid expensive operations when possible

### `/src/services/`

Services contain shared business logic and data access:

```typescript
// src/services/product.service.ts
import { Service } from 'assemblejs';

export class ProductService extends Service {
  async getProduct(id) {
    // Implementation details
    return await this.db.products.findOne({ id });
  }
  
  async getRelatedProducts(id) {
    const product = await this.getProduct(id);
    // Implementation details
    return await this.db.products.find({ category: product.category, id: { $ne: id } });
  }
}
```

Best practices:
- Use the `.service.ts` suffix for all service files
- Make services injectable
- Focus on a single domain
- Implement proper error handling
- Add appropriate logging

### `/src/utils/`

Utilities provide common helper functions and shared code:

```typescript
// src/utils/string.utils.ts
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export function truncate(text, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
```

Best practices:
- Group related utilities in domain-specific files
- Keep utility functions pure and stateless
- Add thorough unit tests
- Use descriptive naming

### `/src/types/`

Type definitions for TypeScript:

```typescript
// src/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
}

export type ProductCategory = 'electronics' | 'clothing' | 'books' | 'home';
```

Best practices:
- Keep types close to their usage
- Use interfaces for object shapes
- Use type for unions and complex types
- Export all types for reuse

### `/src/server.ts`

The server entry point ties everything together:

```typescript
// src/server.ts
import { createBlueprintServer } from 'assemblejs';
import { UserController } from './controllers/user.controller';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';

const server = createBlueprintServer({
  serverRoot: import.meta.url,
  services: [
    ProductService
  ],
  routes: [
    {
      method: 'GET',
      path: '/api/users',
      controller: UserController
    },
    {
      method: 'GET',
      path: '/api/products/:id',
      controller: ProductController
    }
  ]
});

server.start();
```

Best practices:
- Keep the server file clean and focused on configuration
- Register all services and routes
- Use environment variables for configurable values
- Implement proper error handling
- Add shutdown handling

## Extended Structure for Larger Applications

For larger applications, you may want to extend this structure:

```
src/
├── controllers/    # API controllers
├── components/     # UI components
├── blueprints/     # Blueprint compositions
├── factories/      # Data fetching factories
├── services/       # Shared services
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── middleware/     # Custom middleware
├── hooks/          # Server hooks
├── models/         # Data models
├── config/         # Configuration files
├── assets/         # Static assets
├── lib/            # Third-party code
├── errors/         # Custom error classes
├── events/         # Event definitions
├── database/       # Database configuration
├── migrations/     # Database migrations
├── seeds/          # Seed data
├── constants/      # Constant values
└── server.ts       # Main server entry point
```

## Project Organization Patterns

### Feature-Based Organization

For very large applications, you might consider organizing by feature:

```
src/
├── features/
│   ├── user/
│   │   ├── components/
│   │   ├── blueprints/
│   │   ├── factories/
│   │   ├── services/
│   │   └── controllers/
│   └── product/
│       ├── components/
│       ├── blueprints/
│       ├── factories/
│       ├── services/
│       └── controllers/
├── shared/
│   ├── components/
│   ├── services/
│   └── utils/
└── server.ts
```

### Domain-Driven Design

For complex business applications, consider a domain-driven structure:

```
src/
├── domain/
│   ├── user/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── events/
│   └── product/
│       ├── entities/
│       ├── repositories/
│       ├── services/
│       └── events/
├── application/
│   ├── controllers/
│   ├── factories/
│   └── services/
├── infrastructure/
│   ├── database/
│   ├── external/
│   └── cache/
├── presentation/
│   ├── components/
│   ├── blueprints/
│   └── assets/
└── server.ts
```

## Monorepo Structure

For large projects, you might use a monorepo structure:

```
packages/
├── core/           # Core framework code
├── ui/             # Shared UI components
├── api/            # API definition and clients
├── utils/          # Shared utilities
├── types/          # Shared type definitions
└── config/         # Shared configuration
apps/
├── web/            # Web application
├── admin/          # Admin dashboard
└── docs/           # Documentation site
```

## Test Structure

Organize tests to mirror your source structure:

```
src/
└── components/
    └── header/
        └── main/
            ├── main.client.ts
            ├── main.styles.scss
            └── main.view.tsx
tests/
├── unit/
│   └── components/
│       └── header/
│           └── main/
│               └── main.test.ts
├── integration/
│   └── components/
│       └── header/
│           └── main/
│               └── main.integration.test.ts
└── e2e/
    └── header.e2e.test.ts
```

## Configuration Files

Standard configuration files in the project root:

```
/
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project metadata and dependencies
├── assemblejs.config.js   # AssembleJS configuration
└── jest.config.js         # Test configuration
```

## Best Practices

### Naming Conventions

- Use kebab-case for directories and files
- Use PascalCase for classes and interfaces
- Use camelCase for variables and functions
- Use consistent suffixes (.controller.ts, .service.ts, etc.)
- Use .view.* extension for component templates

### Import Organization

Organize imports in each file:

```typescript
// 1. Node.js built-in modules
import fs from 'fs';
import path from 'path';

// 2. External dependencies
import { createBlueprintServer } from 'assemblejs';

// 3. Internal modules (absolute imports)
import { UserController } from '@controllers/user.controller';

// 4. Internal modules (relative imports)
import { formatDate } from '../utils/date.utils';

// 5. Type imports
import type { User } from '../types/user.types';
```

### Component Size

- Keep components small and focused (< 200 lines)
- Extract reusable patterns into shared components
- Split large components into multiple smaller ones

### Code Organization

- Keep related code together
- Use consistent formatting
- Add meaningful comments and documentation
- Remove unused code

## Related Topics

- [Development Setup](development-setup)
- [Development Workflow](development-workflow)
- [Component Lifecycle](advanced-component-lifecycle)
- [Blueprint Architecture](core-concepts-blueprints)