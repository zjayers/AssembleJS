# Troubleshooting

This guide helps you diagnose and resolve common issues that may arise when developing applications with AssembleJS.

## Diagnosing Problems

Before diving into specific issues, here's a general approach to troubleshooting AssembleJS applications:

1. **Check the console output** - AssembleJS provides detailed error messages in the console
2. **Examine the server logs** - For server-side issues, check the logs in your terminal
3. **Use browser developer tools** - For client-side issues, use browser DevTools
4. **Enable verbose logging** - Set the `ASM_LOG_LEVEL=verbose` environment variable

## Common Issues and Solutions

### Installation Problems

#### Error: Cannot find module 'assemblejs'

This usually indicates the package is not installed or not installed correctly.

**Solution:**
```bash
# Reinstall AssembleJS
npm uninstall assemblejs
npm install assemblejs
```

#### Error: Cannot find package.json

This occurs when trying to run AssembleJS commands outside of a properly initialized project.

**Solution:**
```bash
# Initialize a new project
npm init -y

# Install AssembleJS
npm install assemblejs
```

### Build Errors

#### Error: Cannot resolve module

This typically means a module import path is incorrect or the module doesn't exist.

**Solution:**
1. Check that the module exists in your `node_modules` folder
2. Verify your import paths are correct
3. Check for typos in your import statements

```javascript
// Incorrect
import { BluePrint } from 'assemblejs';

// Correct
import { Blueprint } from 'assemblejs';
```

#### Error: TypeScript errors preventing build

Type errors can prevent your application from building correctly.

**Solution:**
1. Address specific type issues indicated in the error messages
2. Use proper type definitions
3. If needed, you can temporarily use `// @ts-ignore` above problematic lines

### Runtime Errors

#### Error: Blueprint not found

This occurs when trying to access a blueprint that doesn't exist or isn't registered.

**Solution:**
1. Check that the blueprint is properly defined and exported
2. Verify the path in your blueprint configuration
3. Make sure the blueprint is registered with the server

```typescript
// Make sure your server registration includes the blueprint
const server = createBlueprintServer({
  blueprints: [
    {
      name: 'home',
      path: '/home',
      controller: HomeController
    }
  ]
});
```

#### Error: Component render failure

This can happen if a component fails to render due to invalid props or other issues.

**Solution:**
1. Check that all required props are being passed to the component
2. Verify that any data the component depends on is available
3. Add error boundaries for client-side components

```typescript
// Add safeguards to component props
const MyComponent = (props) => {
  // Default values for missing props
  const { data = [] } = props;
  
  // Check for required data
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
  
  return (
    // Component rendering
  );
};
```

#### Error: Event subscription failure

This can occur when there are issues with the event system.

**Solution:**
1. Check that event addresses are correctly formatted
2. Verify that subscribers are correctly registered
3. Ensure the event bus is initialized before use

```typescript
// Correct event subscription
import { EventBus } from 'assemblejs';

// Make sure to use the correct event address format
EventBus.subscribe('component.eventName', handler);
```

### Routing Issues

#### 404 errors on valid routes

This can happen when routes are not properly defined or registered.

**Solution:**
1. Check your route definitions in the server configuration
2. Verify that controllers are correctly associated with routes
3. Check for conflicting route patterns

```typescript
// Make sure dynamic route parameters are correctly defined
const server = createBlueprintServer({
  routes: [
    {
      method: 'GET',
      path: '/products/:id', // Note the colon before parameter name
      controller: ProductController
    }
  ]
});
```

#### Client-side navigation not working

This can occur if the client-side navigation system is not properly initialized.

**Solution:**
1. Verify that `BlueprintClient` is correctly initialized
2. Check that navigation events are being triggered correctly
3. Ensure your links are using the client-side navigation API

```typescript
// Client-side navigation example
import { BlueprintClient } from 'assemblejs';

// Use the navigate method for client-side navigation
const handleClick = (e) => {
  e.preventDefault();
  BlueprintClient.navigate('/products/123');
};

// In your component
<a href="/products/123" onClick={handleClick}>View Product</a>
```

### Rendering Issues

#### Components not hydrating correctly

This can happen when the server and client rendering don't match or when hydration targets are incorrect.

**Solution:**
1. Ensure that the same data is available on both server and client
2. Check that hydration targets are correctly specified
3. Verify that components are compatible with SSR

```typescript
// Make sure hydration is correctly configured
blueprintClient.hydrate('component-id', data);
```

#### Styling inconsistencies between server and client

Style differences can occur due to CSS loading timing or specificity issues.

**Solution:**
1. Use CSS-in-JS solutions or component-scoped CSS
2. Ensure that CSS is included in the server rendering
3. Check for CSS specificity conflicts

### Performance Issues

#### Slow initial load times

This can be caused by large bundle sizes or inefficient server rendering.

**Solution:**
1. Implement code splitting and lazy loading
2. Use the AssembleJS profiler to identify bottlenecks
3. Optimize component rendering and data fetching

```typescript
// Implement lazy loading for blueprints
const LazyLoadedBlueprint = {
  controller: () => import('./controllers/heavy.controller'),
  // Other configuration
};
```

#### Memory leaks in long-running applications

Memory leaks can occur if event listeners or subscriptions aren't properly cleaned up.

**Solution:**
1. Unsubscribe from events when components are destroyed
2. Clean up resources in lifecycle hooks
3. Monitor memory usage during development

```typescript
// Proper event cleanup
const subscription = EventBus.subscribe('some.event', handler);

// In cleanup/unmount function
subscription.unsubscribe();
```

## Debugging Tools

AssembleJS provides several tools to help debug applications:

### Developer Panel

The AssembleJS Developer Panel provides real-time information about your application:

```typescript
// Enable the developer panel in development
const server = createBlueprintServer({
  enableDevPanel: process.env.NODE_ENV === 'development'
});
```

### Event Debugger

The Event Debugger allows you to monitor event flow in your application:

```typescript
// Enable event debugging
import { configureEventDebugging } from 'assemblejs/debug';

configureEventDebugging({
  enabled: true,
  traceEvents: true,
  logToConsole: true
});
```

### Performance Profiler

The Performance Profiler helps identify performance bottlenecks:

```typescript
// Enable performance profiling
import { startPerformanceProfile, stopPerformanceProfile } from 'assemblejs/profiler';

// Start profiling a specific operation
startPerformanceProfile('rendering-homepage');

// Your code here

// Stop profiling and log results
stopPerformanceProfile('rendering-homepage');
```

## Getting Additional Help

If you're still experiencing issues after trying these solutions:

1. **Community Support** - Ask questions in the [AssembleJS community forums](https://community.assemblejs.com)
2. **GitHub Issues** - Report bugs on the [AssembleJS GitHub repository](https://github.com/assemblejs/assemblejs/issues)
3. **Documentation** - Review the comprehensive [API documentation](api-global)
4. **Discord Channel** - Join the [AssembleJS Discord](https://discord.gg/assemblejs) for real-time help

## Related Topics

- [Development Workflow](development-workflow)
- [Performance Profiling](cookbook/performance)
- [Contributing to AssembleJS](contributing-to-assemblejs)