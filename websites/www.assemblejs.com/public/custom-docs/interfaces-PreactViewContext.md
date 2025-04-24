# Interface: PreactViewContext<Public, Params\>

View context for Preact components.

**`Author`**

Zach Ayers

## Type parameters

| Name | Type |
| :------ | :------ |
| `Public` | extends `ComponentPublicData` = `ComponentPublicData` |
| `Params` | extends `ComponentParams` = `ComponentParams` |

## Hierarchy

- `BaseViewContext`<`Public`, `Params`\>

  ↳ **`PreactViewContext`**

## Table of contents

### Properties

- [children](PreactViewContext.md#children)
- [componentName](PreactViewContext.md#componentname)
- [components](PreactViewContext.md#components)
- [data](PreactViewContext.md#data)
- [deviceType](PreactViewContext.md#devicetype)
- [id](PreactViewContext.md#id)
- [nestLevel](PreactViewContext.md#nestlevel)
- [params](PreactViewContext.md#params)
- [renderAsBlueprint](PreactViewContext.md#renderasblueprint)
- [renderer](PreactViewContext.md#renderer)
- [serverUrl](PreactViewContext.md#serverurl)
- [title](PreactViewContext.md#title)
- [viewName](PreactViewContext.md#viewname)

## Properties

### children

 **children**: `ComponentChildren`

Preact children components

#### Defined in

[src/types/component.context.ts:550](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L550)

___

### componentName

 **componentName**: `string`

Name of the component

#### Inherited from

BaseViewContext.componentName

#### Defined in

[src/types/component.context.ts:497](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L497)

___

### components

 **components**: `Record`<`string`, `Buffer`\>

Child component references

#### Inherited from

BaseViewContext.components

#### Defined in

[src/types/component.context.ts:495](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L495)

___

### data

 **data**: `Public`

Public data exposed to the client

#### Inherited from

BaseViewContext.data

#### Defined in

[src/types/component.context.ts:507](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L507)

___

### deviceType

 **deviceType**: `ComponentDevice`

Device type of the client

#### Inherited from

BaseViewContext.deviceType

#### Defined in

[src/types/component.context.ts:511](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L511)

___

### id

 **id**: `string`

Unique ID of the component instance

#### Inherited from

BaseViewContext.id

#### Defined in

[src/types/component.context.ts:503](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L503)

___

### nestLevel

 **nestLevel**: `number`

Nesting level in the component hierarchy

#### Inherited from

BaseViewContext.nestLevel

#### Defined in

[src/types/component.context.ts:513](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L513)

___

### params

 **params**: `Params`

Request parameters

#### Inherited from

BaseViewContext.params

#### Defined in

[src/types/component.context.ts:505](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L505)

___

### renderAsBlueprint

 **renderAsBlueprint**: `boolean`

Whether this component is rendered as a blueprint

#### Inherited from

BaseViewContext.renderAsBlueprint

#### Defined in

[src/types/component.context.ts:509](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L509)

___

### renderer

 `Optional` **renderer**: ``"EJS"`` \| ``"PREACT"`` \| ``"REACT"`` \| ``"VUE"`` \| ``"SVELTE"`` \| ``"HTML"`` \| ``"STRING"`` \| ``"MARKDOWN"`` \| ``"NUNJUCKS"`` \| ``"HANDLEBARS"`` \| ``"PUG"`` \| ``"WEBCOMPONENT"``

Renderer used

#### Inherited from

BaseViewContext.renderer

#### Defined in

[src/types/component.context.ts:517](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L517)

___

### serverUrl

 **serverUrl**: `string`

Server URL

#### Inherited from

BaseViewContext.serverUrl

#### Defined in

[src/types/component.context.ts:501](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L501)

___

### title

 **title**: `string`

Page title

#### Inherited from

BaseViewContext.title

#### Defined in

[src/types/component.context.ts:515](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L515)

___

### viewName

 **viewName**: `string`

Name of the view

#### Inherited from

BaseViewContext.viewName

#### Defined in

[src/types/component.context.ts:499](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/types/component.context.ts#L499)
