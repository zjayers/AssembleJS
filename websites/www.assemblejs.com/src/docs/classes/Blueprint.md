# Class: Blueprint<Public, Params\>

Blueprint is the base class for all views in the browser.

**`Description`**

This is the base class for all views in the browser.

**`Author`**

Zach Ayers

## Type parameters

| Name | Type |
| :------ | :------ |
| `Public` | extends `ComponentPublicData` = `EMPTY_NODE_PARAM` |
| `Params` | extends `ComponentParams` = `EMPTY_NODE_PARAMS` |

## Implements

- `ViewEventAdapter`

## Table of contents

### Accessors

- [api](Blueprint.md#api)
- [context](Blueprint.md#context)
- [root](Blueprint.md#root)

### Constructors

- [constructor](Blueprint.md#constructor)

### Methods

- [dispose](Blueprint.md#dispose)
- [subscribe](Blueprint.md#subscribe)
- [toAll](Blueprint.md#toall)
- [toBlueprint](Blueprint.md#toblueprint)
- [toComponents](Blueprint.md#tocomponents)
- [onMessage](Blueprint.md#onmessage)
- [onMount](Blueprint.md#onmount)

## Accessors

### api

`get` **api**(): `AxiosInstance`

Get the scoped api interface for this view.

#### Returns

`AxiosInstance`

- The scoped api interface for this view.

#### Defined in

[src/browser/client/blueprint.view.ts:205](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L205)

___

### context

`get` **context**(): [`ViewContext`](../interfaces/ViewContext.md)<`Public`, `Params`\>

Get the context for this view.

#### Returns

[`ViewContext`](../interfaces/ViewContext.md)<`Public`, `Params`\>

- The context for this view.

#### Defined in

[src/browser/client/blueprint.view.ts:189](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L189)

___

### root

`get` **root**(): `undefined` \| `HTMLElement`

Get the root element for this view.

#### Returns

`undefined` \| `HTMLElement`

- The root element for this view.

#### Defined in

[src/browser/client/blueprint.view.ts:197](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L197)

## Constructors

### constructor

**new Blueprint**<`Public`, `Params`\>(`idSelector`)

Base view constructor

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Public` | extends `ComponentPublicData` = `AnyObject` |
| `Params` | extends `ComponentParams` = `EMPTY_NODE_PARAMS` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `idSelector` | `string` | The id selector for the root element of this view. |

#### Defined in

[src/browser/client/blueprint.view.ts:70](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L70)

## Methods

### dispose

**dispose**(): `void`

Clean up this view's resources - especially event listeners
This method should be called when the view is no longer needed
to prevent memory leaks from event listener accumulation

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:281](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L281)

___

### subscribe

**subscribe**<`Payload`, `Response`\>(`channel`, `topic`, `listener`): `void`

Subscribe to a topic on a channel.

**`Author`**

Zach Ayers

#### Type parameters

| Name |
| :------ |
| `Payload` |
| `Response` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `channel` | `string` | The channel to subscribe to. |
| `topic` | `string` | The topic to subscribe to. |
| `listener` | `EventListener`<`unknown`\> | The listener to subscribe to the topic. |

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:252](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L252)

___

### toAll

**toAll**<`Payload`, `Response`\>(`payload`, `topic?`): [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

**`Inherit Doc`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Payload` | `Payload` |
| `Response` | `Payload` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Payload` |
| `topic?` | `string` |

#### Returns

[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

#### Implementation of

ViewEventAdapter.toAll

#### Defined in

[src/browser/client/blueprint.view.ts:234](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L234)

___

### toBlueprint

**toBlueprint**<`Payload`, `Response`\>(`payload`, `topic?`): [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

**`Inherit Doc`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Payload` | `Payload` |
| `Response` | `Payload` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Payload` |
| `topic?` | `string` |

#### Returns

[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

#### Implementation of

ViewEventAdapter.toBlueprint

#### Defined in

[src/browser/client/blueprint.view.ts:222](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L222)

___

### toComponents

**toComponents**<`Payload`, `Response`\>(`payload`, `topic?`): [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

**`Inherit Doc`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Payload` | `Payload` |
| `Response` | `Payload` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Payload` |
| `topic?` | `string` |

#### Returns

[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

#### Implementation of

ViewEventAdapter.toComponents

#### Defined in

[src/browser/client/blueprint.view.ts:210](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L210)

___

### onMessage

`Protected` **onMessage**<`P`\>(`message`): `void`

This method will fire anytime <strong>subscribed</strong> event is recieved.

**`Description`**

If this view is not subscribed to the particular channel and topic, it will not recieve the event. Components subscribe to the 'all', 'component', and 'blueprint' channels by default.

**`Author`**

Zach Ayers

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`P`\> |

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:273](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L273)

___

### onMount

`Protected` **onMount**(): `void`

This method will fire when the view is mounted.

**`Description`**

Any post-mount actions should be done here.

**`Author`**

Zach Ayers

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:360](https://github.com/zjayers/minimesh/blob/9210909/src/browser/client/blueprint.view.ts#L360)
