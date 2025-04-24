# Variable: events

 `Const` **events**: `Pick`<`IEventBus`, ``"subscribe"`` \| ``"unsubscribe"`` \| ``"peek"`` \| ``"toAll"`` \| ``"toComponents"`` \| ``"toBlueprint"``\> & { `publish`: <P, R\>(`address`: [`EventAddress`](variables-types-EventAddress.md), `payload`: `P`) => [`BlueprintEvent`](variables-interfaces-BlueprintEvent.md)<`R`\> ; `useOnMessageListener`: <P\>(`listener`: (`message`: [`BlueprintEvent`](variables-interfaces-BlueprintEvent.md)<`P`\>) => `void`) => `void`  }

Functional Eventing Interface

**`Description`**

- Use this to access the AssembleJS eventing system outside an AssembleJS View.

**`Author`**

Zachariah Ayers

#### Defined in

[src/browser/eventing/event.bus.ts:330](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/browser/eventing/event.bus.ts#L330)
