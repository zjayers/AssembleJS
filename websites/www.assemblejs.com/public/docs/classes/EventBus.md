# Class: EventBus

**`See`**

IEventBus

## Implements

- `IEventBus`

## Table of contents

### Constructors

- [constructor](EventBus.md#constructor)

### Properties

- [eventEmitter](EventBus.md#eventemitter)
- [eventSink](EventBus.md#eventsink)

### Methods

- [peek](EventBus.md#peek)
- [publish](EventBus.md#publish)
- [subscribe](EventBus.md#subscribe)
- [toAll](EventBus.md#toall)
- [toBlueprint](EventBus.md#toblueprint)
- [toComponents](EventBus.md#tocomponents)
- [unsubscribe](EventBus.md#unsubscribe)

## Constructors

### constructor

**new EventBus**()

EventBus Constructor
Initializing an event bus will ensure there is an EventManager on the global window object.
Once an EventManager is created, the EventSink and EventEmitter will be referenced by this class.

#### Defined in

[src/browser/eventing/event.bus.ts:275](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L275)

## Properties

### eventEmitter

 **eventEmitter**: `EventEmitter`

#### Implementation of

IEventBus.eventEmitter

#### Defined in

[src/browser/eventing/event.bus.ts:202](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L202)

___

### eventSink

 **eventSink**: `IEventSink`

#### Implementation of

IEventBus.eventSink

#### Defined in

[src/browser/eventing/event.bus.ts:203](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L203)

## Methods

### peek

**peek**<`P`\>(`address`): `undefined` \| `P`

**`Inherit Doc`**

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`EventAddress`](../types/EventAddress.md) |

#### Returns

`undefined` \| `P`

#### Implementation of

IEventBus.peek

#### Defined in

[src/browser/eventing/event.bus.ts:206](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L206)

___

### publish

**publish**<`P`\>(`event`): [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`P`\>

**`Inherit Doc`**

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`P`\> |

#### Returns

[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`P`\>

#### Implementation of

IEventBus.publish

#### Defined in

[src/browser/eventing/event.bus.ts:211](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L211)

___

### subscribe

**subscribe**<`P`\>(`address`, `listener`): `void`

**`Inherit Doc`**

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`EventAddress`](../types/EventAddress.md) |
| `listener` | `EventListener`<`P`\> |

#### Returns

`void`

#### Implementation of

IEventBus.subscribe

#### Defined in

[src/browser/eventing/event.bus.ts:261](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L261)

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

| Name | Type | Default value |
| :------ | :------ | :------ |
| `payload` | `Payload` | `undefined` |
| `topic` | `string` | `CONSTANTS.eventingGlobalTopic` |

#### Returns

[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

#### Implementation of

IEventBus.toAll

#### Defined in

[src/browser/eventing/event.bus.ts:225](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L225)

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

| Name | Type | Default value |
| :------ | :------ | :------ |
| `payload` | `Payload` | `undefined` |
| `topic` | `string` | `CONSTANTS.eventingGlobalTopic` |

#### Returns

[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

#### Implementation of

IEventBus.toBlueprint

#### Defined in

[src/browser/eventing/event.bus.ts:249](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L249)

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

| Name | Type | Default value |
| :------ | :------ | :------ |
| `payload` | `Payload` | `undefined` |
| `topic` | `string` | `CONSTANTS.eventingGlobalTopic` |

#### Returns

[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`Response`\>

#### Implementation of

IEventBus.toComponents

#### Defined in

[src/browser/eventing/event.bus.ts:237](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L237)

___

### unsubscribe

**unsubscribe**(`address`, `listener`): `void`

**`Inherit Doc`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`EventAddress`](../types/EventAddress.md) |
| `listener` | `EventListener`<`unknown`\> |

#### Returns

`void`

#### Implementation of

IEventBus.unsubscribe

#### Defined in

[src/browser/eventing/event.bus.ts:266](https://github.com/zjayers/AssembleJS/blob/e3653e0/src/browser/eventing/event.bus.ts#L266)
