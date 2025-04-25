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

**`Author`**

Zachariah Ayers

#### Defined in

[src/browser/eventing/event.bus.ts:286](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L286)

## Properties

### eventEmitter

 **eventEmitter**: `EventEmitter`

#### Implementation of

IEventBus.eventEmitter

#### Defined in

[src/browser/eventing/event.bus.ts:212](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L212)

___

### eventSink

 **eventSink**: `IEventSink`

#### Implementation of

IEventBus.eventSink

#### Defined in

[src/browser/eventing/event.bus.ts:213](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L213)

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
| `address` | [`EventAddress`](classes-types-EventAddress.md) |

#### Returns

`undefined` \| `P`

#### Implementation of

IEventBus.peek

#### Defined in

[src/browser/eventing/event.bus.ts:216](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L216)

___

### publish

**publish**<`P`\>(`event`): [`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`P`\>

**`Inherit Doc`**

#### Type parameters

| Name |
| :------ |
| `P` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`P`\> |

#### Returns

[`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`P`\>

#### Implementation of

IEventBus.publish

#### Defined in

[src/browser/eventing/event.bus.ts:221](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L221)

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
| `address` | [`EventAddress`](classes-types-EventAddress.md) |
| `listener` | `EventListener`<`P`\> |

#### Returns

`void`

#### Implementation of

IEventBus.subscribe

#### Defined in

[src/browser/eventing/event.bus.ts:271](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L271)

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

| Name | Type | Default value |
| :------ | :------ | :------ |
| `payload` | `Payload` | `undefined` |
| `topic` | `string` | `CONSTANTS.eventingGlobalTopic` |

#### Returns

[`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

#### Implementation of

IEventBus.toAll

#### Defined in

[src/browser/eventing/event.bus.ts:235](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L235)

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

| Name | Type | Default value |
| :------ | :------ | :------ |
| `payload` | `Payload` | `undefined` |
| `topic` | `string` | `CONSTANTS.eventingGlobalTopic` |

#### Returns

[`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

#### Implementation of

IEventBus.toBlueprint

#### Defined in

[src/browser/eventing/event.bus.ts:259](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L259)

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

| Name | Type | Default value |
| :------ | :------ | :------ |
| `payload` | `Payload` | `undefined` |
| `topic` | `string` | `CONSTANTS.eventingGlobalTopic` |

#### Returns

[`BlueprintEvent`](classes-interfaces-BlueprintEvent.md)<`Response`\>

#### Implementation of

IEventBus.toComponents

#### Defined in

[src/browser/eventing/event.bus.ts:247](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L247)

___

### unsubscribe

**unsubscribe**(`address`, `listener`): `void`

**`Inherit Doc`**

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`EventAddress`](classes-types-EventAddress.md) |
| `listener` | `EventListener`<`unknown`\> |

#### Returns

`void`

#### Implementation of

IEventBus.unsubscribe

#### Defined in

[src/browser/eventing/event.bus.ts:276](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/browser/eventing/event.bus.ts#L276)
