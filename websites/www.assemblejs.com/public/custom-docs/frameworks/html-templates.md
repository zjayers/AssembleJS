# HTML & Templates Integration

AssembleJS provides robust support for using HTML and various templating languages in your components. This approach allows you to use familiar templating syntax while taking advantage of AssembleJS's component model and rendering pipeline.

## Supported Template Engines

AssembleJS supports the following HTML-based templating engines out of the box:

- **Raw HTML** - Static HTML content
- **EJS** - Embedded JavaScript templates
- **Handlebars** - Logic-less templates with powerful expressions
- **Nunjucks** - Jinja2-inspired templating with rich features
- **Pug** - Indentation-based templating (formerly Jade)
- **Markdown** - Simple markup language for content-heavy pages

## Creating a Component with HTML Templates

When you generate a component using `asmgen`, you can choose your preferred templating engine:

```bash
npx asmgen
# Select "Component" from the list
# Enter your component name
# Select your preferred template engine (HTML, EJS, etc.)
```

### Folder Structure

For an HTML-based component named "header" in the "navigation" directory:

```
components/
└── navigation/
    └── header/
        ├── header.client.ts    # Client-side logic
        ├── header.styles.scss  # Component styles
        └── header.view.html    # HTML template
```

The file extension will change based on the template engine you select:
- `.view.html` - Raw HTML
- `.view.ejs` - EJS templates
- `.view.hbs` - Handlebars templates
- `.view.njk` - Nunjucks templates
- `.view.pug` - Pug templates
- `.view.md` - Markdown content

## Template Syntax Examples

### Raw HTML

```html
<!-- header.view.html -->
<header class="main-header">
  <div class="logo">
    <img src="/logo.png" alt="Company Logo">
  </div>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>
```

### EJS

```ejs
<!-- header.view.ejs -->
<header class="main-header">
  <div class="logo">
    <img src="<%= data.logoUrl %>" alt="<%= data.companyName %> Logo">
  </div>
  <nav>
    <ul>
      <% data.menuItems.forEach(function(item) { %>
        <li><a href="<%= item.url %>" <%= item.active ? 'class="active"' : '' %>>
          <%= item.label %>
        </a></li>
      <% }); %>
    </ul>
  </nav>
</header>
```

### Handlebars

```handlebars
<!-- header.view.hbs -->
<header class="main-header">
  <div class="logo">
    <img src="{{data.logoUrl}}" alt="{{data.companyName}} Logo">
  </div>
  <nav>
    <ul>
      {{#each data.menuItems}}
        <li><a href="{{this.url}}" {{#if this.active}}class="active"{{/if}}>
          {{this.label}}
        </a></li>
      {{/each}}
    </ul>
  </nav>
</header>
```

### Nunjucks

```nunjucks
<!-- header.view.njk -->
<header class="main-header">
  <div class="logo">
    <img src="{{ data.logoUrl }}" alt="{{ data.companyName }} Logo">
  </div>
  <nav>
    <ul>
      {% for item in data.menuItems %}
        <li><a href="{{ item.url }}" {% if item.active %}class="active"{% endif %}>
          {{ item.label }}
        </a></li>
      {% endfor %}
    </ul>
  </nav>
</header>
```

### Pug

```pug
// header.view.pug
header.main-header
  .logo
    img(src=data.logoUrl, alt=`${data.companyName} Logo`)
  nav
    ul
      each item in data.menuItems
        li
          a(href=item.url, class=item.active ? 'active' : '')= item.label
```

### Markdown

```markdown
<!-- content.view.md -->
# Welcome to Our Website

This is a **markdown-based** component that can include:

- Rich text formatting
- Lists and tables
- [Links](https://example.com)
- And more!

## Dynamic Content

Current user: {{data.user.name}}

```

## Accessing Data in Templates

All templates have access to the `data` object, which contains information provided by the component's factory:

```typescript
// content.factory.ts
export class ContentFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    context.data.set('title', 'Welcome to our website');
    context.data.set('user', {
      name: 'John Doe',
      role: 'Admin'
    });
    context.data.set('menuItems', [
      { label: 'Home', url: '/', active: true },
      { label: 'About', url: '/about', active: false },
      { label: 'Contact', url: '/contact', active: false }
    ]);
  }
}
```

## Client-Side Integration

HTML-based components can be enhanced with client-side logic using the `.client.ts` file:

```typescript
// header.client.ts
import { Blueprint } from 'asmbl';

class HeaderComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Get references to DOM elements
    const mobileMenuToggle = this.root.querySelector('.mobile-menu-toggle');
    const nav = this.root.querySelector('nav');
    
    // Add event listeners
    mobileMenuToggle?.addEventListener('click', () => {
      nav?.classList.toggle('active');
    });
    
    // Subscribe to events from other components
    this.subscribe('app', 'theme:changed', (event) => {
      this.root.dataset.theme = event.payload.theme;
    });
  }
}

// Register the component
export default HeaderComponent;
```

## Template Includes and Partials

Different template engines handle includes and partials in their own way:

### EJS Includes

```ejs
<!-- Using includes in EJS -->
<%- include('../partials/menu', { items: data.menuItems }) %>
```

### Handlebars Partials

```handlebars
<!-- Using partials in Handlebars -->
{{> menu items=data.menuItems }}
```

### Nunjucks Includes

```nunjucks
<!-- Using includes in Nunjucks -->
{% include "partials/menu.njk" with {items: data.menuItems} %}
```

### Pug Includes

```pug
// Using includes in Pug
include ../partials/menu.pug
```

## Custom Helpers and Filters

AssembleJS allows you to register custom helpers and filters for your templating engines:

```typescript
// server.ts
import { createBlueprintServer } from 'asmbl';

createBlueprintServer({
  serverRoot: import.meta.url,
  templateConfig: {
    // Handlebars helpers
    handlebars: {
      helpers: {
        formatDate: (date) => new Date(date).toLocaleDateString(),
        uppercase: (str) => str.toUpperCase()
      }
    },
    // Nunjucks filters
    nunjucks: {
      filters: {
        shorten: (str, len) => str.substr(0, len) + '...',
        currencyFormat: (value) => `$${value.toFixed(2)}`
      }
    }
  },
  // Rest of your configuration
});
```

## Best Practices

1. **Choose the Right Engine** - Select the template engine that best fits your team's skills and project needs
2. **Keep Templates Focused** - Each template should represent a single, cohesive UI component
3. **Separate Concerns** - Keep presentation logic in templates, business logic in factories, and interaction logic in client files
4. **Use Partials** - Break complex templates into reusable partials
5. **Leverage Factory Data** - Use the factory system to prepare and transform data before it reaches templates
6. **Minimal Logic in Templates** - Keep complex logic in factories and use templates primarily for presentation
7. **Consistent Naming** - Follow consistent naming conventions for your templates and partials

## Next Steps

- [Core Concepts - Components](../core-concepts-components.md) - Learn more about the component model
- [Core Concepts - Factories](../core-concepts-factories.md) - Understand how to prepare data for your templates
- [Core Concepts - Renderers](../core-concepts-renderers.md) - Explore the rendering pipeline