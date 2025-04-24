# Global API

AssembleJS provides a set of global APIs that can be used across both server and client environments.

## Overview

The Global API includes core functions and utilities that form the foundation of AssembleJS applications. These APIs are available throughout the entire application lifecycle and can be used in both server-side and client-side code.

## Core Functions

### `createBlueprintServer`

Creates a new AssembleJS server instance.

```typescript
function createBlueprintServer(options: BlueprintServerOptions): BlueprintServer;
```

For detailed usage, see [createBlueprintServer](api-functions-createBlueprintServer.md).

### `registerComponent`

Registers a component with the component registry.

```typescript
function registerComponent(name: string, component: ComponentDefinition): void;
```

## Configuration

### `config`

The global configuration object for the AssembleJS instance.

```typescript
const config: BlueprintConfig;
```

Access configuration values:

```typescript
// Get server port
const port = config.server.port;

// Get environment
const env = config.environment;
```

## Logging

### `logger`

The global logger for AssembleJS.

```typescript
const logger: Logger;
```

Usage:

```typescript
// Log information
logger.info('Server started');

// Log warnings
logger.warn('Configuration missing, using defaults');

// Log errors
logger.error('Connection failed', { reason: 'timeout' });

// Log debug information (only in development)
logger.debug('Processing request', { path: '/api/user', method: 'GET' });
```

## Utilities

### `utils`

The global utilities object with helper functions.

```typescript
const utils: BlueprintUtils;
```

Available utilities:

```typescript
// String utilities
utils.string.camelCase('hello-world');  // 'helloWorld'
utils.string.capitalize('hello');       // 'Hello'

// Object utilities
utils.object.pick(obj, ['id', 'name']); // Pick specific properties
utils.object.omit(obj, ['password']);   // Omit specific properties

// Array utilities
utils.array.chunk([1, 2, 3, 4], 2);     // [[1, 2], [3, 4]]
utils.array.unique([1, 2, 2, 3]);       // [1, 2, 3]

// Path utilities
utils.path.join('components', 'header'); // 'components/header'
utils.path.resolve('./config.json');     // Absolute path
```

## Type Definitions

The Global API includes core type definitions:

```typescript
// Component type
type Component<T = any> = (context: ViewContext<T>) => string | Element;

// View context type
interface ViewContext<T = any> {
  data: T;
  params: Record<string, string>;
  component: ComponentRegistry;
  request: RequestInfo;
  events: EventBus;
}

// Request information
interface RequestInfo {
  path: string;
  method: string;
  query: Record<string, string>;
  headers: Record<string, string>;
}

// Event bus
interface EventBus {
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, data?: any): void;
  once(event: string, handler: EventHandler): void;
}
```

For detailed type information, see the specific type documentation:

- [ApiRequest](api-types-ApiRequest.md)
- [ApiReply](api-types-ApiReply.md)
- [ServerContext](api-types-ServerContext.md)
- [ComponentFactory](api-types-ComponentFactory.md)