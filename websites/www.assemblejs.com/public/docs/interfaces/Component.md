# Interface: Component<Public, Params\>

A Component is the building block of AssembleJS.

**`Description`**

Each AssembleJS server is composed of 1 to Many Components.
Each Component may render child Components from external servers.
The general lifecycle of a Component is as follows:

1.
An HTTP request comes in to the AssembleJS server requesting the content for Component 'A

2.
The AssembleJS server fetches the template for the Component 'A',
runs it through any defined factories,
then runs it through the defined Component renderer.

3.
The AssembleJS server then returns the manipulated template to the requesting Component -
   along with a JSON script of any Public data on the ComponentContext object.

4.
While waiting on the Component content, the requesting Component will use a cached 'manifest.json'
   for this Component to reach out and gather any required Assets.

5.
The requesting Component will then compile the retrieved template,
  and any required Assets, into a final template.

**`Author`**

Zachariah Ayers

## Type parameters

| Name | Type |
| :------ | :------ |
| `Public` | extends `ComponentPublicData` = `ComponentPublicData` |
| `Params` | extends `ComponentParams` = `ComponentParams` |

## Table of contents

### Properties

- [developmentOptions](Component.md#developmentoptions)
- [path](Component.md#path)
- [root](Component.md#root)
- [shared](Component.md#shared)
- [views](Component.md#views)

## Properties

### developmentOptions

 `Optional` `Readonly` **developmentOptions**: `Object`

When AssembleJS is NOT in 'production', and this Component is NOT being requested
from another Component, apply these development options tools

**`Optional`**

**`Author`**

Zachariah Ayers

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contentWrapper?` | (`content`: `string`) => `string` |

#### Defined in

[src/types/component.ts:60](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/types/component.ts#L60)

___

### path

 `Readonly` **path**: `string`

The name of this component

**`Author`**

Zachariah Ayers

#### Defined in

[src/types/component.ts:44](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/types/component.ts#L44)

___

### root

 `Optional` `Readonly` **root**: `string`

The base directory to search for this component set in

**`Optional`**

**`Author`**

Zachariah Ayers

#### Defined in

[src/types/component.ts:52](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/types/component.ts#L52)

___

### shared

 `Optional` `Readonly` **shared**: `Object`

Collection of common Component options that will be passed to ALL Component views

**`Optional`**

**`Author`**

Zachariah Ayers

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `components?` | `ComponentAddresses` | Any Components that all views of this Component require to render appropriately |
| `factories?` | `ComponentFactory`<`Public`, `Params`\>[] | Array of Component Factories to run on the ComponentTemplate of each view, sorted by Priority |
| `helpers?` | `Record`<`string`, `ComponentHelper`<`any`[], `any`\>\> | Array of helper functions to pass to the ComponentContext for all views of this Component |
| `paramsSchema?` | `ComponentParamsSchema` | Any request parameters to be validated when making ComponentTemplate content requests |
| `routeOpts?` | `RouteShorthandOptions`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\> | Any Route options to use for every view of this Component. |

#### Defined in

[src/types/component.ts:71](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/types/component.ts#L71)

___

### views

 `Readonly` **views**: `ComponentView`<`Public`, `Params`\>[]

Array of views for this Component

**`Author`**

Zachariah Ayers

#### Defined in

[src/types/component.ts:93](https://github.com/zjayers/AssembleJS/blob/b7f8979/src/types/component.ts#L93)
