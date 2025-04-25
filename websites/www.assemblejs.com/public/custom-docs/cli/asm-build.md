# asm-build - AssembleJS Build Command

The `asm-build` command provides a streamlined way to build your AssembleJS application. This feature is currently in development with basic functionality.

## Overview

`asm-build` is a simple build tool that will compile your AssembleJS application. The current implementation is minimal, with more features planned for future releases.

## Usage

```bash
npm run build
```

Or directly:

```bash
npx asm-build
```

## Current Implementation Status

> **Note:** The build command is currently in early development. Many of the features described below are planned for future implementation.

The current version of `asm-build` provides basic build functionality. Advanced features like asset optimization, code splitting, and configuration options are under development.

## Basic Configuration

When using `asm-build`, ensure your server configuration includes the required HTTP and development server options:

```typescript
// server.ts
import { createBlueprintServer } from "asmbl";

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,  // Required
  devServer: viteDevServer,      // Required
  
  // Other configuration options
});
```

## Planned Features

The following features are planned for future releases:

- Output directory configuration
- Minification options
- Source map generation
- Bundle analysis
- Tree shaking
- Code splitting
- Asset optimization
- Configuration via `asm.config.js`

## Current Best Practices

- For production builds, use the basic `npm run build` command
- Ensure your server.ts file includes the required HTTP and development server configuration
- Consider using alternative build tools for advanced needs until `asm-build` is fully implemented

## Example Basic Usage

```bash
# Interactive mode
npx asm
# Select "build" from the options

# Direct command
npx asm-build
```

## Related Commands

- [asmgen](./asmgen.md) - Generate project artifacts
- [asm-serve](./asm-serve.md) - Start the development server
- [asm-insights](./asm-insights.md) - Analyze application performance