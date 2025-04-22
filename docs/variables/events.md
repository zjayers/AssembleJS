# Variable: events

 `Const` **events**: `Pick`<`IEventBus`, ``"subscribe"`` \| ``"unsubscribe"`` \| ``"peek"`` \| ``"toAll"`` \| ``"toComponents"`` \| ``"toBlueprint"``\> & { `publish`: <P, R\>(`address`: [`EventAddress`](../types/EventAddress.md), `payload`: `P`) => [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`R`\> ; `useOnMessageListener`: <P\>(`listener`: (`message`: [`BlueprintEvent`](../interfaces/BlueprintEvent.md)<`P`\>) => `void`) => `void`  }

Functional Eventing Interface

**`Description`**

- Use this to access the AssembleJS eventing system outside an AssembleJS View.

**`Author`**

Zach Ayers

#### Defined in

[src/browser/eventing/event.bus.ts:302](https://github.com/zjayers/AssembleJS/blob/bbb670f/src/browser/eventing/event.bus.ts#L302)
