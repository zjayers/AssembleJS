# Class: BlueprintController

Abstract definition of an AssembleJS Controller.

**`Description`**

Blueprint controllers provide the foundation for defining server-side routes
and handlers in AssembleJS applications. This base class includes dependency injection
capabilities through the ServiceContainer, allowing controllers to easily access shared
services. All custom controllers in an AssembleJS application should extend this class.

**`Example`**

```typescript
import { Blueprint, BlueprintController, Assembly } from "asmbl";

export class UserController extends BlueprintController {
  // Implement the required register method
  register(app: Assembly): void {
    // Register a GET route for user data
    app.get('/users', async (req, reply) => {
      // Use injected service if available
      if (this.hasService('userService')) {
        const userService = this.getService<UserService>('userService');
        const users = await userService.getAllUsers();
        return users;
      }

      // Fallback if service not available
      return { error: 'User service not available' };
    });
  }
}
```

**`Author`**

Zachariah Ayers

## Hierarchy

- `Loggable`

  ↳ **`BlueprintController`**

## Table of contents

### Constructors

- [constructor](BlueprintController.md#constructor)

### Methods

- [register](BlueprintController.md#register)
- [getService](BlueprintController.md#getservice)
- [hasService](BlueprintController.md#hasservice)

### Properties

- [log](BlueprintController.md#log)

## Constructors

### constructor

**new BlueprintController**()

Creates a new Loggable instance
Initializes a ConsoleLogger with the class name for consistent logging

#### Inherited from

Loggable.constructor

#### Defined in

[src/server/abstract/loggable.ts:15](https://github.com/zjayers/AssembleJS/blob/3539104/src/server/abstract/loggable.ts#L15)

## Methods

### register

`Abstract` **register**(`app`): `void`

Register a controller with the server.
This abstract method must be implemented by all concrete controller classes.
It's where you define all routes, hooks, and handlers for your controller.
The method is called during server initialization to set up the controller's
functionality.

**`Returnss`**

**`Example`**

```typescript
// Sample implementation in a concrete controller
register(app: Assembly): void {
  // Define a route group with a common prefix
  const routes = app.register({
    prefix: '/api/products'
  });

  // Register route handlers
  routes.get('/', this.getAllProducts.bind(this));
  routes.get('/:id', this.getProductById.bind(this));
  routes.post('/', this.createProduct.bind(this));
  routes.put('/:id', this.updateProduct.bind(this));
  routes.delete('/:id', this.deleteProduct.bind(this));
}
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `app` | [`Assembly`](../interfaces/Assembly.md) | The server instance to register the controller with |

#### Returns

`void`

#### Defined in

[src/server/abstract/blueprint.controller.ts:111](https://github.com/zjayers/AssembleJS/blob/3539104/src/server/abstract/blueprint.controller.ts#L111)

___

### getService

`Protected` **getService**<`T`\>(`token`): `T`

Get a service from the container.
This method retrieves a service instance from the global ServiceContainer.
Services are singleton instances that provide shared functionality across the application.

**`Throws`**

When the requested service is not found in the container

**`Example`**

```typescript
// Get the user service from the container
const userService = this.getService<UserService>('userService');
const currentUser = await userService.getCurrentUser(req.userId);
```

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`Service`](Service.md)<`T`\> | The service type that extends the Service base class |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | The service identifier used during registration |

#### Returns

`T`

The service instance of the requested type

#### Defined in

[src/server/abstract/blueprint.controller.ts:56](https://github.com/zjayers/AssembleJS/blob/3539104/src/server/abstract/blueprint.controller.ts#L56)

___

### hasService

`Protected` **hasService**(`token`): `boolean`

Check if a service is available in the container.
This method verifies if a service with the given token exists in the ServiceContainer
before attempting to retrieve it. This allows for graceful fallbacks when optional
services are not available.

**`Example`**

```typescript
// Check if the optional caching service is available
if (this.hasService('cacheService')) {
  const cacheService = this.getService<CacheService>('cacheService');
  return await cacheService.getCachedData(key);
} else {
  // Fallback to database lookup if cache isn't available
  return await this.fetchDataFromDatabase(key);
}
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | The service identifier to check |

#### Returns

`boolean`

True if the service is registered, false otherwise

#### Defined in

[src/server/abstract/blueprint.controller.ts:80](https://github.com/zjayers/AssembleJS/blob/3539104/src/server/abstract/blueprint.controller.ts#L80)

## Properties

### log

 `Protected` `Readonly` **log**: `ConsoleLogger`

#### Inherited from

Loggable.log

#### Defined in

[src/server/abstract/loggable.ts:9](https://github.com/zjayers/AssembleJS/blob/3539104/src/server/abstract/loggable.ts#L9)
