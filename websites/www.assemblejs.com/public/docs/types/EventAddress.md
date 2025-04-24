# Type alias: EventAddress

 **EventAddress**: `Omit`<[`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`never`\>, ``"payload"``\>

Address to use when publishing/subscribing to events.

**`Author`**

Zachariah Ayers

**`Example`**

```typescript
// Build the Address
const address: EventAddress = {
  channel: 'my-channel',
  topic: 'my-topic'
}

// Initialize an eventBus
const eventBus = new EventBus();

// Publish a payload to the address
eventBus.publish(address, {data: 'my-payload'}
```

#### Defined in

[src/browser/eventing/event.address.ts:23](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/eventing/event.address.ts#L23)
