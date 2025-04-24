# API Integration

<iframe src="https://placeholder-for-assemblejs-api-integration-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

API integration is a core aspect of modern web applications. This cookbook will demonstrate how to efficiently connect your AssembleJS application with external APIs while maintaining performance and reliability.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Familiarity with async/await and Promises in JavaScript
- Understanding of HTTP request methods (GET, POST, PUT, DELETE)

## Implementation Steps

### Step 1: Create a Basic API Service

First, let's create a service to handle API requests. This will abstract the API logic from our components:

1. Create a new service file:

```bash
mkdir -p src/services
touch src/services/api.service.ts
```

2. Implement the base API service:

```typescript
// src/services/api.service.ts
import { Service } from 'asmbl';

interface ApiOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export class ApiService extends Service {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(options: ApiOptions) {
    super();
    this.baseUrl = options.baseUrl;
    this.defaultHeaders = options.headers || {
      'Content-Type': 'application/json'
    };
    this.timeout = options.timeout || 10000;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>('GET', url);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url);
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  private async request<T>(
    method: string, 
    url: string, 
    data?: any
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
```

### Step 2: Register the API Service

1. Register the service in your server.ts file:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { ApiService } from "./services/api.service";

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [],
    services: [
      {
        name: 'apiService',
        service: new ApiService({
          baseUrl: 'https://jsonplaceholder.typicode.com'
        })
      }
    ]
  }
});
```

### Step 3: Create a Component Factory

Now, let's create a factory that will fetch data for a component:

```bash
mkdir -p src/components/posts
touch src/components/posts/posts.factory.ts
```

Implement the factory:

```typescript
// src/components/posts/posts.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { ApiService } from '../../services/api.service';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export class PostsFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get the API service
    const apiService = context.services.get('apiService') as ApiService;
    
    try {
      // Fetch posts
      const posts = await apiService.get<Post[]>('/posts');
      
      // Add posts to the component context
      context.data.set('posts', posts.slice(0, 5));
      context.data.set('loading', false);
      context.data.set('error', null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      context.data.set('posts', []);
      context.data.set('loading', false);
      context.data.set('error', 'Failed to load posts');
    }
  }
}
```

### Step 4: Create the Component View

Let's create a React component to display the posts:

```bash
touch src/components/posts/posts.view.tsx
```

Implement the view:

```tsx
// src/components/posts/posts.view.tsx
import React from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface PostsProps {
  data: {
    posts: Post[];
    loading: boolean;
    error: string | null;
  };
}

const Posts: React.FC<PostsProps> = ({ data }) => {
  const { posts, loading, error } = data;
  
  if (loading) {
    return <div className="posts-loading">Loading posts...</div>;
  }
  
  if (error) {
    return <div className="posts-error">{error}</div>;
  }
  
  return (
    <div className="posts-container">
      <h2>Recent Posts</h2>
      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        <ul className="posts-list">
          {posts.map(post => (
            <li key={post.id} className="post-item">
              <h3>{post.title}</h3>
              <p>{post.body.substring(0, 100)}...</p>
              <button className="read-more-btn">Read More</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Posts;
```

### Step 5: Add Client-Side Code

Now, let's add some client-side code to handle user interactions:

```bash
touch src/components/posts/posts.client.ts
```

Implement the client file:

```typescript
// src/components/posts/posts.client.ts
import { Blueprint } from 'asmbl';

export class PostsClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Find all "Read More" buttons
    const readMoreButtons = this.root.querySelectorAll('.read-more-btn');
    
    // Add click event listeners
    readMoreButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Get the post item element
        const postItem = (e.currentTarget as HTMLElement).closest('.post-item');
        if (!postItem) return;
        
        // Toggle expanded class to show full content
        postItem.classList.toggle('expanded');
        
        // Update button text
        const isExpanded = postItem.classList.contains('expanded');
        (e.currentTarget as HTMLElement).textContent = isExpanded ? 'Show Less' : 'Read More';
      });
    });
  }
}

export default PostsClient;
```

### Step 6: Add Styles

Let's add some styles for our component:

```bash
touch src/components/posts/posts.styles.scss
```

Add the styles:

```scss
// src/components/posts/posts.styles.scss
.posts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  
  h2 {
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
}

.posts-loading,
.posts-error {
  padding: 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.posts-error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.posts-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  h3 {
    margin-top: 0;
    color: #007bff;
  }
  
  p {
    color: #6c757d;
    line-height: 1.5;
  }
  
  &.expanded p {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
}

.read-more-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: #0069d9;
  }
}
```

### Step 7: Register the Component

Finally, register the component in your server.ts:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { ApiService } from "./services/api.service";
import { PostsFactory } from "./components/posts/posts.factory";

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'posts',
        views: [{
          viewName: 'list',
          templateFile: 'posts.view.tsx',
          factory: new PostsFactory()
        }]
      }
    ],
    services: [
      {
        name: 'apiService',
        service: new ApiService({
          baseUrl: 'https://jsonplaceholder.typicode.com'
        })
      }
    ]
  }
});
```

### Step 8: Create a Blueprint to Display the Component

Create a blueprint to display our posts component:

```bash
mkdir -p src/blueprints/home
touch src/blueprints/home/main/main.view.tsx
```

Implement the blueprint:

```tsx
// src/blueprints/home/main/main.view.tsx
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="header">
        <h1>API Integration Example</h1>
        <p>Demonstrating API integration in AssembleJS</p>
      </header>
      
      <main className="main-content">
        <div className="posts-wrapper" data-component="posts/list"></div>
      </main>
      
      <footer className="footer">
        <p>AssembleJS API Integration Cookbook</p>
      </footer>
    </div>
  );
};

export default Home;
```

Add the blueprint to your server.ts:

```typescript
// src/server.ts
// ...previous code...

manifest: {
  components: [
    // ...previous components...
  ],
  blueprints: [
    {
      path: 'home',
      views: [{
        viewName: 'main',
        templateFile: 'main.view.tsx',
        route: '/'
      }]
    }
  ],
  services: [
    // ...previous services...
  ]
}
```

## Advanced Topics

### Error Handling and Retries

To add retry functionality to our API service:

```typescript
// Modify the request method in api.service.ts
private async request<T>(
  method: string, 
  url: string, 
  data?: any,
  retries = 3
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request to ${url}, ${retries} retries left`);
      // Exponential backoff delay
      const delay = 1000 * Math.pow(2, 3 - retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.request<T>(method, url, data, retries - 1);
    }
    throw error;
  }
}
```

### Caching API Responses

Add a simple caching mechanism to the API service:

```typescript
// Add to api.service.ts
private cache: Map<string, { data: any, timestamp: number }> = new Map();
private cacheTTL: number = 60000; // 1 minute

async get<T>(endpoint: string, params?: Record<string, string>, useCache = true): Promise<T> {
  const url = this.buildUrl(endpoint, params);
  
  // Check cache if enabled
  if (useCache) {
    const cached = this.cache.get(url);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
  }
  
  // Fetch new data
  const data = await this.request<T>('GET', url);
  
  // Update cache
  if (useCache) {
    this.cache.set(url, { data, timestamp: Date.now() });
  }
  
  return data;
}
```

### Authentication and Authorization

Add authentication to our API service:

```typescript
// Add to api.service.ts
private authToken?: string;

setAuthToken(token: string): void {
  this.authToken = token;
  this.defaultHeaders['Authorization'] = `Bearer ${token}`;
}

clearAuthToken(): void {
  this.authToken = undefined;
  delete this.defaultHeaders['Authorization'];
}

isAuthenticated(): boolean {
  return !!this.authToken;
}
```

## Conclusion

This cookbook has demonstrated how to integrate external APIs with your AssembleJS application. We've covered creating a reusable API service, implementing component factories to fetch data, and displaying that data in a component. The advanced topics covered error handling, retries, caching, and authentication.

By following these patterns, you can build robust AssembleJS applications that efficiently communicate with external services while maintaining good performance and error handling.