# Frequently Asked Questions

This document addresses common questions about AssembleJS, its features, capabilities, and best practices.

## General Questions

### What is AssembleJS?

AssembleJS is a modern micro-frontend framework designed for building distributed, component-based UIs. It manages the compiling, bundling, and serving of UI blueprints and components in a distributed style that enables teams to work independently while creating a cohesive user experience.

### How does AssembleJS compare to other frameworks?

AssembleJS stands apart through:
- **True Component Isolation**: Components are isolated at both code and runtime levels
- **Multi-UI Language Support**: Use HTML, EJS, Markdown, Preact, React, Vue, Svelte, or Web Components
- **Server-First Architecture**: Optimized for performance with selective client hydration
- **Islands Architecture**: Only interactive components are hydrated, reducing JavaScript payload
- **Framework Agnostic**: Mix and match UI frameworks within the same application
- **Factory System**: Powerful server-side data preparation

### Is AssembleJS ready for production use?

Yes, AssembleJS is designed for production use in commercial environments, with features specifically aimed at enterprise needs like performance, security, and team collaboration.

### Who created AssembleJS?

AssembleJS was created by Zachariah Ayers to address fundamental limitations in existing UI frameworks and to provide a more natural, flexible approach to building web applications.

### What license is AssembleJS released under?

AssembleJS is released under the MIT License with Attribution Requirement.

## Technical Questions

### What languages and frameworks does AssembleJS support?

AssembleJS supports multiple UI frameworks and templating languages:

- **HTML & Templates**: Raw HTML, EJS, Handlebars, Nunjucks, Pug, Markdown
- **Component Frameworks**: React, Preact, Vue, Svelte
- **Web Standards**: Web Components

This allows teams to use the technology that best suits their needs or expertise.

### Does AssembleJS support server-side rendering (SSR)?

Yes, AssembleJS was built from the ground up with a server-first approach. It provides robust server-side rendering with selective client-side hydration through its islands architecture.

### How does data fetching work in AssembleJS?

AssembleJS uses a powerful Factory system for data fetching:

1. Factories run on the server before rendering
2. They can fetch data from APIs, databases, files, or any source
3. The data is made available to components during rendering
4. Components receive prepared data without needing to know how it was fetched

This approach separates data concerns from presentation.

### How does the Islands Architecture work?

AssembleJS implements Islands Architecture as follows:

1. The entire page is rendered on the server as HTML
2. Only interactive components ("islands") are hydrated with JavaScript
3. Static content remains as lightweight HTML
4. Components specify when they should be hydrated (on load, when visible, etc.)
5. Each island is isolated from others, preventing cascading failures

This approach significantly reduces JavaScript payload and improves performance.

### How does AssembleJS handle state management?

AssembleJS provides several approaches to state management:

1. **Server-Prepared Data**: Factories prepare initial state
2. **Component-Local State**: Components manage their own state
3. **Event System**: Components communicate through events
4. **Service Classes**: Share state and functionality between components
5. **Framework-Specific State**: Use React Context, Vuex, etc. within their respective components

### How can components communicate with each other?

Components communicate through the AssembleJS event system:

1. Components publish events to specific addresses
2. Other components subscribe to relevant events
3. Events can contain arbitrary data
4. The event system handles cross-component and cross-framework communication

This approach keeps components loosely coupled while enabling coordination.

### Does AssembleJS work with TypeScript?

Yes, AssembleJS is built with TypeScript and provides comprehensive type definitions for all its APIs, ensuring type safety throughout your application.

### Can I use AssembleJS with an existing backend?

Yes, AssembleJS can be integrated with any backend. It provides its own server component but can also be used alongside existing Express, Fastify, or other Node.js servers.

### How does routing work in AssembleJS?

AssembleJS provides a controller-based routing system:

1. Controllers handle specific routes or URL patterns
2. Controllers determine which Blueprints to render
3. Blueprints specify which Components to include
4. Client-side navigation can be implemented for SPA-like experiences
5. Routes can be protected with middleware for authentication

### How does AssembleJS handle CSS?

AssembleJS provides isolated styling for components:

1. Each component has its own styles scoped to prevent conflicts
2. Styles are automatically included with the component
3. Global styles can be included at the application level
4. Design systems can be implemented using shared styles
5. CSS preprocessors like SASS/SCSS are supported

## Performance and Optimization

### How does AssembleJS perform compared to other frameworks?

AssembleJS is designed with performance as a core principle:

1. Server-side rendering provides fast initial load times
2. Selective hydration minimizes JavaScript payload
3. Component-level code splitting reduces initial load size
4. Islands Architecture improves Time to Interactive metrics
5. Only interactive components receive JavaScript

This results in excellent Core Web Vitals scores out of the box.

### How does AssembleJS handle caching?

AssembleJS provides multiple levels of caching:

1. **Component-Level Caching**: Individual components can be cached
2. **HTTP Response Caching**: Proper cache headers for browser and CDN caching
3. **Data Caching**: Factories can implement data caching strategies
4. **Static Generation**: Pre-render pages at build time

### How does AssembleJS optimize bundle size?

AssembleJS optimizes bundle size through:

1. Component-level code splitting
2. Framework-specific code isolation
3. Tree-shaking and dead code elimination
4. Loading JavaScript only for interactive components
5. Incremental and lazy loading of non-critical resources

### Can AssembleJS handle large-scale applications?

Yes, AssembleJS is particularly well-suited for large applications with many teams. Its component isolation and distributed architecture allow teams to work independently without stepping on each other's toes, while the Blueprint system ensures a cohesive user experience.

## Development Workflow

### How do I create a new AssembleJS project?

```bash
npx asmgen
# Select "Project" from the list
# Enter your project name
# Follow the prompts

cd my-project
npm install
npm run dev
```

### How do I add a new page?

```bash
npx asmgen
# Select "Blueprint" from the list
# Enter your page name
# Follow the prompts
```

### How do I add a new component?

```bash
npx asmgen
# Select "Component" from the list
# Enter your component name
# Select your preferred UI framework
# Follow the prompts
```

### How can I structure my AssembleJS project?

Recommended project structure:

```
src/
├── controllers/    # API controllers
├── components/     # UI components
├── blueprints/     # Blueprint compositions
├── factories/      # Data fetching factories
├── services/       # Shared services
└── server.ts       # Main server entry point
```

### How are tests written for AssembleJS components?

AssembleJS components can be tested at multiple levels:

1. **Unit Tests**: Test component functions and logic in isolation
2. **Component Tests**: Test component rendering and behavior
3. **Integration Tests**: Test component interaction through the event system
4. **End-to-End Tests**: Test complete user flows

The AssembleJS testing utilities provide helpers for rendering components, simulating events, and asserting on the rendered output.

### How do I deploy an AssembleJS application?

AssembleJS applications can be deployed to any platform that supports Node.js:

1. **Traditional Hosting**: Deploy as a Node.js application
2. **Containerization**: Use Docker for containerized deployment
3. **Serverless**: Deploy to AWS Lambda, Vercel, or Netlify
4. **Static Hosting**: Pre-render static pages for CDN hosting

The RIVET deployment system provides optimized configurations for various deployment targets.

## Troubleshooting

### Component not rendering

Check the following:

1. Ensure the component path is correct in the Blueprint
2. Verify the component directory structure matches the naming convention
3. Check for errors in the component factory or template
4. Review the server logs for rendering errors

### Events not firing between components

Check the following:

1. Ensure the event address is the same for publisher and subscriber
2. Verify the event bus is properly initialized
3. Check the timing of subscriptions (subscribe before publishing)
4. Review event data format

### Styles not applying

Check the following:

1. Ensure the styles file is correctly named and located
2. Verify CSS selectors are correctly scoped
3. Check for CSS conflicts or specificity issues
4. Review the generated CSS in the browser inspector

### Factory data not available in component

Check the following:

1. Ensure the factory is properly registered
2. Verify the factory is setting data with the correct keys
3. Check for asynchronous operations that might not be awaited
4. Review how the data is accessed in the component

## Ecosystem and Integration

### Can I use npm packages with AssembleJS?

Yes, AssembleJS is fully compatible with the npm ecosystem. You can use any JavaScript/TypeScript package in your components, factories, and services.

### How do I integrate a UI library like Material UI or Bootstrap?

UI libraries can be integrated in several ways:

1. **Global Integration**: Import the library's styles at the application level
2. **Component-Specific**: Import library components only in components that need them
3. **Wrapped Components**: Create AssembleJS wrapper components around library components
4. **Factories**: Handle data preparation specific to library requirements

### Can I use AssembleJS with GraphQL?

Yes, you can use GraphQL with AssembleJS:

1. Create a GraphQL client in a service class
2. Use the client in factories to fetch data
3. Pass the data to components through the context
4. Optionally create a GraphQL controller for server-side operations

### How do I implement authentication in AssembleJS?

Authentication can be implemented using:

1. **Auth Middleware**: Protect routes at the controller level
2. **Auth Service**: Handle authentication state and methods
3. **Factories**: Check authentication and prepare appropriate data
4. **Components**: Show authentication-specific UI elements

### Does AssembleJS support internationalization (i18n)?

Yes, AssembleJS supports internationalization:

1. Store translations in JSON or other formats
2. Create an i18n service for translation functions
3. Use factories to prepare translated content
4. Create language-specific routes if needed
5. Use existing i18n libraries within the AssembleJS ecosystem

## Advanced Topics

### How do Server Components work in AssembleJS?

AssembleJS implements server components through its Factory system:

1. Components are defined with their template/view
2. Factories prepare data on the server
3. Components render on the server with prepared data
4. The resulting HTML is sent to the client
5. Selective hydration adds interactivity where needed

### How can I contribute to AssembleJS?

Contributions to AssembleJS are welcome:

1. Fork the repository on GitHub
2. Create a feature branch
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Submit a pull request

See the [Contributing Guide](contributing-to-assemblejs.md) for more details.

### What is the roadmap for AssembleJS?

The AssembleJS roadmap includes:

1. Enhanced documentation and examples
2. Additional framework integrations
3. Performance optimizations
4. Developer tools and debugging utilities
5. Enterprise features for large-scale applications

See the [Development Roadmap](development-roadmap.md) for more details.

### Where can I get help if I'm stuck?

For help with AssembleJS:
- Check the [documentation](https://assemblejs.com/docs)
- Join the community discussion on [Discord](#)
- Search or ask questions on [GitHub Issues](https://github.com/zjayers/assemblejs/issues)
- Contact the AssembleJS team directly for commercial support