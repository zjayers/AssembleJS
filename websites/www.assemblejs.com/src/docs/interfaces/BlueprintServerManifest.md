# Interface: BlueprintServerManifest

Options required to build an AssembleJS server

**`Author`**

Zach Ayers

**`Example`**

```typescript
const opts: BlueprintServerOptions = {
  host: "0.0.0.0",
  port: 3000,
  publicDirectories: ["./dist", "./public"],
};
```

## Table of contents

### Properties

- [assetDirectoryRoots](BlueprintServerManifest.md#assetdirectoryroots)
- [components](BlueprintServerManifest.md#components)
- [controllers](BlueprintServerManifest.md#controllers)
- [developmentOptions](BlueprintServerManifest.md#developmentoptions)
- [services](BlueprintServerManifest.md#services)
- [shared](BlueprintServerManifest.md#shared)

## Properties

### assetDirectoryRoots

 `Optional` `Readonly` **assetDirectoryRoots**: `PathLikeArray`<`Omit`<`FastifyStaticOptions`, ``"root"``\>\>

#### Defined in

[src/types/blueprint.server.manifest.ts:27](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/types/blueprint.server.manifest.ts#L27)

___

### components

 `Optional` **components**: `ComponentManifest`

#### Defined in

[src/types/blueprint.server.manifest.ts:25](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/types/blueprint.server.manifest.ts#L25)

___

### controllers

 `Optional` `Readonly` **controllers**: () => [`BlueprintController`](../classes/BlueprintController.md) \| `NoConstructor`<[`BlueprintController`](../classes/BlueprintController.md)\>[] \| (...`args`: `any`[]) => [`BlueprintController`](../classes/BlueprintController.md) \| `NoConstructor`<[`BlueprintController`](../classes/BlueprintController.md)\>[]

#### Defined in

[src/types/blueprint.server.manifest.ts:30](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/types/blueprint.server.manifest.ts#L30)

___

### developmentOptions

 `Optional` `Readonly` **developmentOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contentWrapper?` | (`content`: `string`) => `string` |

#### Defined in

[src/types/blueprint.server.manifest.ts:26](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/types/blueprint.server.manifest.ts#L26)

___

### services

 `Optional` `Readonly` **services**: `Record`<`string`, (...`args`: `any`[]) => [`Service`](../classes/Service.md)\>

Services to be registered with the dependency injection container
Key is the service token that will be used to retrieve the service
Value is the service class constructor that extends the Service base class

#### Defined in

[src/types/blueprint.server.manifest.ts:44](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/types/blueprint.server.manifest.ts#L44)

___

### shared

 `Optional` `Readonly` **shared**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `components?` | `ComponentAddresses` | Any Components that all views of this Component require to render appropriately |
| `factories?` | `ComponentFactory`<`ComponentPublicData`, `ComponentParams`\>[] | Array of Component Factories to run on the ComponentTemplate of each view, sorted by Priority |
| `helpers?` | `Record`<`string`, `ComponentHelper`<`any`[], `any`\>\> | Array of helper functions to pass to the ComponentContext for all views of this Component |
| `paramsSchema?` | `ComponentParamsSchema` | Any request parameters to be validated when making ComponentTemplate content requests |
| `routeOpts?` | `RouteShorthandOptions`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\> | Any Route options to use for every view of this Component. |

#### Defined in

[src/types/blueprint.server.manifest.ts:45](https://github.com/zjayers/AssembleJS/blob/afc9ef0/src/types/blueprint.server.manifest.ts#L45)
