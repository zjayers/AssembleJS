# Interface: BlueprintEvent<P\>

Event interface used by the Eventing system

**`Author`**

Zach Ayers

**`Example`**

```typescript
// Create an event that expects a payload of type 'string'.
const event: BlueprintEvent<string> = { channel: 'my-channel', topic: 'my-topic', payload: 'my-payload' };
```

## Type parameters

| Name |
| :------ |
| `P` |

## Table of contents

### Properties

- [channel](BlueprintEvent.md#channel)
- [payload](BlueprintEvent.md#payload)
- [topic](BlueprintEvent.md#topic)

## Properties

### channel

 **channel**: `string`

The channel to publish the event on. Channels may have many topics.

#### Defined in

[src/browser/eventing/blueprint.event.ts:16](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/browser/eventing/blueprint.event.ts#L16)

___

### payload

 **payload**: `P`

The payload to publish on the corresponding channel & topic.

#### Defined in

[src/browser/eventing/blueprint.event.ts:27](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/browser/eventing/blueprint.event.ts#L27)

___

### topic

 **topic**: `string`

The topic to publish within the channel. Channel / Topic combinations relate to a single event queue.
New payloads are added to the end of the matching event queue if one is found.

#### Defined in

[src/browser/eventing/blueprint.event.ts:22](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/browser/eventing/blueprint.event.ts#L22)
