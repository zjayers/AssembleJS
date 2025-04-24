# Class: Blueprint<Public, Params\>

Blueprint is the base class for all views in the browser.

**`Description`**

This is the base class for all views in the browser.

**`Author`**

Zachariah Ayers

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

**`Author`**

Zachariah Ayers

#### Returns

`AxiosInstance`

The scoped api interface for this view.

#### Defined in

[src/browser/client/blueprint.view.ts:216](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L216)

___

### context

`get` **context**(): [`ViewContext`](classes-interfaces-ViewContext.md)<`Public`, `Params`\>

Get the context for this view.

**`Author`**

Zachariah Ayers

#### Returns

[`ViewContext`](classes-interfaces-ViewContext.md)<`Public`, `Params`\>

The context for this view.

#### Defined in

[src/browser/client/blueprint.view.ts:196](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L196)

___

### root

`get` **root**(): `undefined` \| `HTMLElement`

Get the root element for this view.

**`Author`**

Zachariah Ayers

#### Returns

`undefined` \| `HTMLElement`

The root element for this view.

#### Defined in

[src/browser/client/blueprint.view.ts:206](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L206)

## Constructors

### constructor

**new Blueprint**<`Public`, `Params`\>(`idSelector`)

Base view constructor

**`Throws`**

- If the root element or data payload cannot be found

**`Author`**

Zachariah Ayers

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

[src/browser/client/blueprint.view.ts:75](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L75)

## Methods

### dispose

**dispose**(): `void`

Clean up this view's resources - especially event listeners
This method should be called when the view is no longer needed
to prevent memory leaks from event listener accumulation

**`Author`**

Zachariah Ayers

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:299](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L299)

___

### subscribe

**subscribe**<`Payload`, `Response`\>(`channel`, `topic`, `listener`): `void`

Subscribe to a topic on a channel.

**`Author`**

Zachariah Ayers

#### Type parameters

| Name | Description |
| :------ | :------ |
| `Payload` | The type of the payload |
| `Response` | The type of the expected response |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `channel` | `string` | The channel to subscribe to. |
| `topic` | `string` | The topic to subscribe to. |
| `listener` | `EventListener`<`unknown`\> | The listener to subscribe to the topic. |

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:266](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L266)

___

### toAll

**toAll**<`Payload`, `Response`\>(`payload`, `topic?`): [`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

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

[`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

#### Implementation of

ViewEventAdapter.toAll

#### Defined in

[src/browser/client/blueprint.view.ts:245](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L245)

___

### toBlueprint

**toBlueprint**<`Payload`, `Response`\>(`payload`, `topic?`): [`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

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

[`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

#### Implementation of

ViewEventAdapter.toBlueprint

#### Defined in

[src/browser/client/blueprint.view.ts:233](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L233)

___

### toComponents

**toComponents**<`Payload`, `Response`\>(`payload`, `topic?`): [`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

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

[`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

#### Implementation of

ViewEventAdapter.toComponents

#### Defined in

[src/browser/client/blueprint.view.ts:221](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L221)

___

### onMessage

`Protected` **onMessage**<`P`\>(`message`): `void`

This method will fire anytime <strong>subscribed</strong> event is received.

**`Description`**

If this view is not subscribed to the particular channel and topic, it will not receive the event. Components subscribe to the 'all', 'component', and 'blueprint' channels by default.

**`Author`**

Zachariah Ayers

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `P` | `unknown` | The type of the message payload |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | [`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`P`\> | The event message |

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:289](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L289)

___

### onMount

`Protected` **onMount**(): `void`

This method will fire when the view is mounted.

**`Description`**

Any post-mount actions should be done here.

**`Author`**

Zachariah Ayers

#### Returns

`void`

#### Defined in

[src/browser/client/blueprint.view.ts:382](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/client/blueprint.view.ts#L382)
