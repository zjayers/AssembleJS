# Global API

AssembleJS provides several global APIs that are available throughout your application. These are the functions and objects that you'll use most commonly when building with AssembleJS.

## Overview

The global API includes functions for creating Blueprint servers, components, and utilities for interacting with the framework. These APIs are exposed at the top level of the AssembleJS package.

```javascript
import { createBlueprintServer, Blueprint, events } from 'asmbl';
```

## Core Functions

### createBlueprintServer()

Creates and initializes a new Blueprint server instance.

**Signature:**

```typescript
function createBlueprintServer(options: BlueprintServerOptions): BlueprintServer
```

**Example:**

```typescript
import { createBlueprintServer } from 'asmbl';

createBlueprintServer({
  serverRoot: import.meta.url,
  manifest: {
    components: [
      // Components and Blueprints here
    ],
    controllers: [
      // API controllers here
    ]
  }
});
```

**Details:**

This is the main entry point for creating an AssembleJS application. It initializes the server, registers components and controllers, and starts listening for requests.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| options | `BlueprintServerOptions` | Configuration options for the server |

**Returns:**

A `BlueprintServer` instance that can be used to interact with the server.

**See also:**

- [BlueprintServerOptions](/docs/interfaces/BlueprintServerOptions)
- [BlueprintServer Reference](/docs/api/server)

## Core Classes

AssembleJS provides several core classes that you'll use when building applications:

### Blueprint

The base class for all client-side component implementations.

```typescript
import { Blueprint } from 'asmbl';

class MyComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    // Initialize component
  }
}
```

[Learn more about the Blueprint class](/docs/classes/Blueprint)

### BlueprintClient

Manages component registration and activation on the client.

```typescript
import { BlueprintClient } from 'asmbl';

// Register component
BlueprintClient.registerComponentCodeBehind(MyComponent);
```

[Learn more about the BlueprintClient class](/docs/classes/BlueprintClient)

## Global Objects

### events

The global event bus used for communication between components.

```typescript
import { events } from 'asmbl';

// Subscribe to an event
events.on('some-channel', 'some-topic', (event) => {
  console.log('Received event:', event);
});

// Publish an event
events.emit('some-channel', 'some-topic', { data: 'Hello World' });
```

[Learn more about the events system](/docs/api/event)

### hooks

Built-in hooks for extending the server behavior.

```typescript
import { hooks } from 'asmbl';

// Use a built-in hook in your server setup
hooks.onReady((server) => {
  console.log('Server is ready!');
});
```

[Learn more about hooks](/docs/variables/hooks)

## Type Definitions

AssembleJS provides TypeScript type definitions for all its APIs:

```typescript
import type { 
  BlueprintServerOptions, 
  ComponentFactory, 
  EventAddress 
} from 'asmbl';
```

## Next Steps

- [Server API](/docs/api/server) - Server-side APIs for creating controllers and services
- [Client API](/docs/api/client) - Client-side APIs for creating components
- [Event API](/docs/api/event) - APIs for event-based communication between components