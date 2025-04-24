# Renderers

Renderers in AssembleJS are responsible for transforming component view files into HTML. The framework supports multiple rendering technologies, allowing you to use the best tool for each component.

## Overview

AssembleJS uses a pluggable renderer system that supports:

1. HTML with embedded templates
2. JSX/TSX for React and Preact components
3. Vue templates
4. Svelte components
5. Template engines like EJS, Handlebars, and Pug
6. Markdown for content-heavy components
7. Web Components for framework-agnostic elements

This multi-renderer approach enables you to choose the best technology for each part of your application rather than being locked into a single framework.

## Built-in Renderers

### HTML Renderer

The HTML renderer supports static HTML with embedded template expressions:

```html
<!-- components/card/basic/basic.view.html -->
<div class="card {{ data.variant ? 'card-' + data.variant : '' }}">
  <div class="card-header">
    <h3>{{ data.title }}</h3>
  </div>
  
  <div class="card-body">
    {{ data.content }}
  </div>
  
  {{ if (data.footer) { }}
    <div class="card-footer">
      {{ data.footer }}
    </div>
  {{ } }}
  
  <link href="basic.styles.scss" rel="stylesheet" />
  {{ if (data.interactive) { }}
    <script src="basic.client.ts"></script>
  {{ } }}
</div>
```

### Preact/React Renderer

The Preact renderer supports JSX/TSX templates:

```tsx
// components/card/preact/preact.view.tsx
import { h } from 'preact';

export function PreactCard(context) {
  const { title, content, footer, variant, interactive } = context.data;
  
  return (
    <div className={`card ${variant ? `card-${variant}` : ''}`}>
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      
      <div className="card-body">
        {content}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
      
      <link href="preact.styles.scss" rel="stylesheet" />
      {interactive && <script src="preact.client.ts"></script>}
    </div>
  );
}
```

### Vue Renderer

The Vue renderer supports Vue templates:

```vue
<!-- components/card/vue/vue.view.vue -->
<template>
  <div :class="['card', variant ? `card-${variant}` : '']">
    <div class="card-header">
      <h3>{{ title }}</h3>
    </div>
    
    <div class="card-body">
      {{ content }}
    </div>
    
    <div v-if="footer" class="card-footer">
      {{ footer }}
    </div>
    
    <link href="vue.styles.scss" rel="stylesheet" />
    <script v-if="interactive" src="vue.client.ts"></script>
  </div>
</template>

<script>
export default {
  props: ['context'],
  computed: {
    title() { return this.context.data.title; },
    content() { return this.context.data.content; },
    footer() { return this.context.data.footer; },
    variant() { return this.context.data.variant; },
    interactive() { return this.context.data.interactive; }
  }
}
</script>
```

### Svelte Renderer

The Svelte renderer supports Svelte components:

```svelte
<!-- components/card/svelte/svelte.view.svelte -->
<script>
  export let context;
  
  $: ({ title, content, footer, variant, interactive } = context.data);
</script>

<div class="card {variant ? `card-${variant}` : ''}">
  <div class="card-header">
    <h3>{title}</h3>
  </div>
  
  <div class="card-body">
    {content}
  </div>
  
  {#if footer}
    <div class="card-footer">
      {footer}
    </div>
  {/if}
  
  <link href="svelte.styles.scss" rel="stylesheet" />
  {#if interactive}
    <script src="svelte.client.ts"></script>
  {/if}
</div>
```

### EJS Renderer

The EJS renderer supports EJS templates:

```ejs
<!-- components/card/ejs/ejs.view.ejs -->
<div class="card <%= data.variant ? 'card-' + data.variant : '' %>">
  <div class="card-header">
    <h3><%= data.title %></h3>
  </div>
  
  <div class="card-body">
    <%= data.content %>
  </div>
  
  <% if (data.footer) { %>
    <div class="card-footer">
      <%= data.footer %>
    </div>
  <% } %>
  
  <link href="ejs.styles.scss" rel="stylesheet" />
  <% if (data.interactive) { %>
    <script src="ejs.client.ts"></script>
  <% } %>
</div>
```

### Markdown Renderer

The Markdown renderer is great for content-heavy components:

```markdown
<!-- components/article/content/content.view.md -->
# {{ data.title }}

*Published on {{ data.publishedDate }}*

{{ data.content }}

{% if data.tags.length > 0 %}
## Tags

{% for tag in data.tags %}
- {{ tag }}
{% endfor %}
{% endif %}

<link href="content.styles.scss" rel="stylesheet" />
```

### Web Component Renderer

The Web Component renderer creates custom elements:

```html
<!-- components/counter/basic/basic.view.wc -->
<template>
  <div class="counter">
    <button class="decrement">-</button>
    <span class="count">{{count}}</span>
    <button class="increment">+</button>
  </div>
  
  <style>
    @import "basic.styles.scss";
  </style>
  
  <script src="basic.client.ts"></script>
</template>

<script>
  export default {
    tagName: 'asm-counter',
    props: ['initialCount'],
    data() {
      return {
        count: this.initialCount || 0
      };
    }
  };
</script>
```

## How Renderers Work

Renderers in AssembleJS follow this process:

1. The view file is identified based on file extension
2. The appropriate renderer is selected
3. The renderer parses the template
4. Component data from factories is provided to the template
5. The template is rendered to HTML
6. The HTML is sent to the client

## Configuring Renderers

You can configure renderers globally:

```typescript
import { createBlueprintServer } from 'asmbl';

const server = createBlueprintServer({
  renderers: {
    // Configure the Preact renderer
    preact: {
      ssr: true, // Enable server-side rendering
      hydration: true // Enable client-side hydration
    },
    
    // Configure the Vue renderer
    vue: {
      ssr: true,
      hydration: true
    },
    
    // Configure the EJS renderer
    ejs: {
      options: {
        delimiter: '%',
        compileDebug: process.env.NODE_ENV !== 'production'
      }
    },
    
    // Register a custom renderer
    custom: {
      extension: 'custom',
      render: async (template, data) => {
        // Custom rendering logic
        return processCustomTemplate(template, data);
      }
    }
  }
});
```

## Custom Renderers

You can create and register custom renderers:

```typescript
import { Renderer } from 'assemblejs';
import customTemplateEngine from 'custom-template-engine';

// Create a custom renderer
class CustomRenderer implements Renderer {
  // Extension this renderer handles
  extension = 'custom';
  
  // Render method
  async render(template: string, data: any, options: any): Promise<string> {
    // Process the template with your custom logic
    return customTemplateEngine.process(template, data, options);
  }
  
  // Optional compile method for better performance
  async compile(template: string, options: any): Promise<Function> {
    return customTemplateEngine.compile(template, options);
  }
}

// Register the custom renderer
server.registerRenderer(new CustomRenderer());
```

## Renderer Selection

The renderer is selected based on the file extension of the view file:

| Extension | Renderer |
|-----------|----------|
| .html     | HTML Renderer |
| .tsx, .jsx | Preact/React Renderer |
| .vue      | Vue Renderer |
| .svelte   | Svelte Renderer |
| .ejs      | EJS Renderer |
| .hbs, .handlebars | Handlebars Renderer |
| .pug      | Pug Renderer |
| .md       | Markdown Renderer |
| .wc       | Web Component Renderer |

## Server-Side Rendering

All renderers support server-side rendering (SSR), which happens by default. This means:

1. Components are rendered to HTML on the server
2. Fully formed HTML is sent to the client
3. The page loads quickly with content already present
4. SEO is better since content is in the initial HTML

## Client-Side Hydration

Interactive components can be hydrated on the client side:

```typescript
// components/counter/basic/basic.client.ts
import { createComponentClient } from 'assemblejs';

const client = createComponentClient('counter.basic');

client.onReady(() => {
  // Get references to elements
  const counter = document.querySelector('.counter');
  const decrementButton = counter?.querySelector('.decrement');
  const incrementButton = counter?.querySelector('.increment');
  const countDisplay = counter?.querySelector('.count');
  
  // Initialize state
  let count = parseInt(countDisplay?.textContent || '0');
  
  // Add event listeners
  decrementButton?.addEventListener('click', () => {
    count--;
    if (countDisplay) countDisplay.textContent = String(count);
  });
  
  incrementButton?.addEventListener('click', () => {
    count++;
    if (countDisplay) countDisplay.textContent = String(count);
  });
});
```

## Renderer Context

Each renderer provides a context object to templates with these properties:

```typescript
interface RendererContext {
  // Data from factories
  data: Record<string, any>;
  
  // URL parameters
  params: Record<string, string>;
  
  // Access to other components
  component: {
    [namespace: string]: {
      [name: string]: (props?: any) => string
    }
  };
  
  // Request information
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
    query: Record<string, string>;
  };
  
  // Event system
  events: EventBus;
}
```

## Best Practices

### Choose the Right Renderer

- Use HTML or template engines for simpler components
- Use React/Preact/Vue for complex interactive components
- Use Markdown for content-heavy components
- Use Web Components for reusable, framework-agnostic elements

### Mixing Renderers

Mix renderers based on component needs:

```tsx
export function ProductPage(context) {
  return (
    <div className="product-page">
      {/* Vue component for the header */}
      <context.component.header.main />
      
      {/* Preact component for product details */}
      <context.component.product.details id={context.params.productId} />
      
      {/* Markdown for rich content */}
      <context.component.product.description />
      
      {/* Svelte component for interactive features */}
      <context.component.product.configurator />
    </div>
  );
}
```

### Performance Optimization

- Use the `compile` method for renderers that support it
- Cache compiled templates in production
- Use partial hydration for interactive components

## Next Steps

Now that you understand renderers, explore these related topics:

- [Component System](core-concepts-components.md) - Learn more about components
- [Server-Side Rendering](advanced-server-side-rendering.md) - Deep dive into SSR
- [Islands Architecture](advanced-islands-architecture.md) - Learn about the Islands approach