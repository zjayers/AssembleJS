# asm-serve - AssembleJS Development Server

The `asm-serve` command launches a powerful development server with hot reloading, live component updates, and a suite of development tools to enhance your workflow.

## Overview

`asm-serve` provides a complete development environment for your AssembleJS application, with features like:

- Hot module replacement for instant feedback
- Automatic reloading on file changes
- Development-specific optimizations
- Interactive development panel
- Detailed error reporting
- Automatic TypeScript type checking

## Usage

```bash
npm run dev
```

Or directly:

```bash
npx asm-serve [options]
```

## Command Options

| Option | Description |
|--------|-------------|
| `--port=<PORT>` | Specify the port to use (defaults to 3000) |
| `--host=<HOST>` | Specify the host to bind to (defaults to localhost) |
| `--open` | Open the browser automatically |
| `--no-hmr` | Disable hot module replacement |
| `--no-panel` | Disable the development panel |
| `--silent` | Reduce console output |
| `--verbose` | Increase console output detail |
| `--help`, `-h` | Display help information |

## Environment Variables

You can configure the development server using environment variables:

| Variable | Description |
|----------|-------------|
| `ASSEMBLEJS_PORT` | The port to use for the development server |
| `ASSEMBLEJS_HOST` | The host to bind the development server to |
| `ASSEMBLEJS_ENVIRONMENT` | The environment mode (development, production, test) |
| `ASSEMBLEJS_DEV_OPEN` | Whether to open the browser automatically (true/false) |
| `ASSEMBLEJS_DEV_HMR` | Whether to enable hot module replacement (true/false) |
| `ASSEMBLEJS_DEV_PANEL` | Whether to enable the development panel (true/false) |

## Development Server Features

### Hot Module Replacement (HMR)

The development server supports hot module replacement, allowing you to see changes without a full page reload:

- **JavaScript/TypeScript**: Updates functionality without losing state
- **CSS/SCSS**: Instantly applies style changes
- **Templates**: Refreshes the DOM with updated markup
- **Component Structure**: Automatically detects new components

### Development Panel

The development panel provides a suite of tools to enhance your workflow:

- **Component Inspector**: Examine component structure and properties
- **Event Monitor**: Track event bus activity between components
- **Network Analyzer**: Monitor API calls and performance
- **Layout Visualizer**: See component boundaries and structure
- **Resource Usage**: Track memory and performance metrics

### Error Handling

The development server provides enhanced error reporting:

- **Stack Traces**: Clear, actionable error messages
- **Code Context**: Shows relevant code snippets
- **Quick Fixes**: Suggestions for common errors
- **Error Overlay**: Non-intrusive error display in the browser

### Development-Only Features

- **API Mocking**: Mock API responses for development
- **Slow Network Simulation**: Test under various network conditions
- **Storage Inspector**: Examine localStorage and sessionStorage
- **Accessibility Checker**: Verify accessibility during development

## Advanced Configuration

For advanced development server configuration, you can create an `asm.config.js` file in your project root:

```javascript
// asm.config.js
module.exports = {
  dev: {
    port: 4000,
    host: '0.0.0.0',
    open: true,
    hmr: true,
    panel: true,
    // Advanced options
    proxy: {
      '/api': 'http://localhost:8080'
    },
    middleware: [
      // Custom middleware functions
    ],
    plugins: [
      // Custom development plugins
    ]
  }
};
```

## Common Use Cases

### Starting the Development Server

```bash
npm run dev
```

### Using a Different Port

```bash
npx asm-serve --port=4000
```

### Allowing External Access

```bash
npx asm-serve --host=0.0.0.0
```

### Disabling Development Panel

```bash
npx asm-serve --no-panel
```

## Best Practices

- Use the development server for local development
- Take advantage of the development panel for debugging
- Configure proxy settings for API integration during development
- Set environment variables for consistent configuration across the team

## Related Commands

- [asmgen](./asmgen.md) - Generate project artifacts
- [asm-build](./asm-build.md) - Build your application for production
- [asm-insights](./asm-insights.md) - Analyze and optimize your application