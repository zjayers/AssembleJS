# Class: BlueprintClient

Main AssembleJS Client Entrypoint.

**`Description`**

This class serves as the primary client-side entry point for AssembleJS.
It manages the registration of component code-behind classes, maintains the client registry,
and provides core client-side functionality. This entrypoint is bundled and provided
to the browser by the top-most blueprint in the component hierarchy.

**`Example`**

```typescript
// Register a component's client-side code
import { Blueprint, BlueprintClient } from "asmbl";

export class MyComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    console.log("MyComponent mounted");
  }
}

BlueprintClient.registerComponentCodeBehind(MyComponent);
```

**`Author`**

Zachariah Ayers

## Table of contents

### Constructors

- [constructor](BlueprintClient.md#constructor)

### Methods

- [getBlueprintClientRegistry](BlueprintClient.md#getblueprintclientregistry)
- [registerComponentCodeBehind](BlueprintClient.md#registercomponentcodebehind)

## Constructors

### constructor

**new BlueprintClient**()

## Methods

### getBlueprintClientRegistry

`Static` **getBlueprintClientRegistry**(): [`BlueprintClientRegistry`](classes-interfaces-BlueprintClientRegistry.md)

Get the BlueprintClientRegistry singleton from the global window.
If a registry doesn't already exist in the global scope, this method will
initialize a new one. This ensures there's always a single, consistent
registry available for component management.

**`Example`**

```typescript
// Get the registry to access registered components
const registry = BlueprintClient.getBlueprintClientRegistry();
const componentCount = Object.keys(registry.components).length;
console.log(`There are ${componentCount} registered components`);
```

#### Returns

[`BlueprintClientRegistry`](classes-interfaces-BlueprintClientRegistry.md)

The singleton instance of the client registry

#### Defined in

[src/browser/client/blueprint.client.ts:56](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/client/blueprint.client.ts#L56)

___

### registerComponentCodeBehind

`Static` **registerComponentCodeBehind**(`constructor`): `void`

Register a Blueprint component's client-side code with the global registry.
This method associates the component's code-behind class with its DOM element
by using the data attribute that identifies the component. It automatically
initializes the component and manages its lifecycle.

**`Example`**

```typescript
// Create and register a component with event handling
export class NavBarComponent extends Blueprint {
  protected override onMount(): void {
    super.onMount();

    // Add click event listener to a button
    const menuButton = document.getElementById('menu-toggle');
    if (menuButton) {
      menuButton.addEventListener('click', this.toggleMenu.bind(this));
    }
  }

  private toggleMenu(): void {
    const menu = document.getElementById('main-menu');
    if (menu) {
      menu.classList.toggle('visible');
    }
  }
}

BlueprintClient.registerComponentCodeBehind(NavBarComponent);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `constructor` | `BlueprintConstructor`<`AnyObject`, `EMPTY_NODE_PARAMS`\> | The Blueprint constructor class to register. |

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.client.ts:92](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/client/blueprint.client.ts#L92)
