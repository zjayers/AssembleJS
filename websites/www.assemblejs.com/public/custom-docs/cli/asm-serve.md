# asm-serve - AssembleJS Development Server

The `asm-serve` command launches a development server with hot reloading and live component updates to enhance your development workflow.

## Overview

`asm-serve` provides a development environment for your AssembleJS application, with features like:

- Hot module replacement for instant feedback
- Automatic reloading on file changes
- Development-specific optimizations
- Detailed error reporting
- Vite-based development server

## Usage

To start the development server, use the npm script in your package.json:

```bash
npm run dev
```

Or directly:

```bash
npx asm-serve
```

## Server Configuration

When creating a Blueprint server with `createBlueprintServer()`, make sure to include these required configuration options:

```typescript
// src/server.ts
import { createBlueprintServer } from 'asmbl';

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,  // Required for development server
  devServer: viteDevServer,      // Required for development server
  
  // Other configuration options
});
```

## Under the Hood

The `asm-serve` command:

1. Clears the dist directory
2. Starts watchers for script and style islands
3. Launches a Vite-based development server on port 3000
4. Uses hot module replacement for faster development

## Development Server Features

### Hot Module Replacement (HMR)

The development server supports hot module replacement through Vite, allowing you to see changes without a full page reload:

- **JavaScript/TypeScript**: Updates functionality without losing state
- **CSS/SCSS**: Instantly applies style changes
- **Templates**: Refreshes the DOM with updated markup

### File Watching

`asm-serve` watches your source files for changes:

- Script files via the script island watcher
- Style files via the style island watcher
- Server files via the Vite development server

### Error Handling

The development server provides error reporting:

- **Stack Traces**: Clear error messages
- **Error Overlay**: Error display in the browser

## Best Practices

- Use the development server for local development
- Ensure your server configuration includes the required `httpServer` and `devServer` parameters
- Use `npm run dev` instead of calling `asm-serve` directly for consistency

## Related Commands

- [asmgen](./asmgen.md) - Generate project artifacts
- [asm-build](./asm-build.md) - Build your application for production
- [asm-insights](./asm-insights.md) - Analyze and optimize your application