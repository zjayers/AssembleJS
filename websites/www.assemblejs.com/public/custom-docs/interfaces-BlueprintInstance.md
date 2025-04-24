# Interface: BlueprintInstance

AssembleJS wrapper around the generic Fastify instance

**`Author`**

Zach Ayers

## Hierarchy

- [`Assembly`](interfaces-Assembly.md)

  ↳ **`BlueprintInstance`**

## Table of contents

### Methods

- [addConstraintStrategy](BlueprintInstance.md#addconstraintstrategy)
- [addHook](BlueprintInstance.md#addhook)
- [addSchema](BlueprintInstance.md#addschema)
- [after](BlueprintInstance.md#after)
- [auth](BlueprintInstance.md#auth)
- [close](BlueprintInstance.md#close)
- [decorate](BlueprintInstance.md#decorate)
- [decorateReply](BlueprintInstance.md#decoratereply)
- [decorateRequest](BlueprintInstance.md#decoraterequest)
- [getDefaultRoute](BlueprintInstance.md#getdefaultroute)
- [getSchema](BlueprintInstance.md#getschema)
- [getSchemas](BlueprintInstance.md#getschemas)
- [hasConstraintStrategy](BlueprintInstance.md#hasconstraintstrategy)
- [hasDecorator](BlueprintInstance.md#hasdecorator)
- [hasReplyDecorator](BlueprintInstance.md#hasreplydecorator)
- [hasRequestDecorator](BlueprintInstance.md#hasrequestdecorator)
- [inject](BlueprintInstance.md#inject)
- [listen](BlueprintInstance.md#listen)
- [parseCookie](BlueprintInstance.md#parsecookie)
- [printPlugins](BlueprintInstance.md#printplugins)
- [printRoutes](BlueprintInstance.md#printroutes)
- [ready](BlueprintInstance.md#ready)
- [route](BlueprintInstance.md#route)
- [routing](BlueprintInstance.md#routing)
- [setDefaultRoute](BlueprintInstance.md#setdefaultroute)
- [setErrorHandler](BlueprintInstance.md#seterrorhandler)
- [setNotFoundHandler](BlueprintInstance.md#setnotfoundhandler)
- [setReplySerializer](BlueprintInstance.md#setreplyserializer)
- [setSchemaController](BlueprintInstance.md#setschemacontroller)
- [setSchemaErrorFormatter](BlueprintInstance.md#setschemaerrorformatter)
- [setSerializerCompiler](BlueprintInstance.md#setserializercompiler)
- [setValidatorCompiler](BlueprintInstance.md#setvalidatorcompiler)
- [signCookie](BlueprintInstance.md#signcookie)
- [unsignCookie](BlueprintInstance.md#unsigncookie)
- [withTypeProvider](BlueprintInstance.md#withtypeprovider)

### Properties

- [addContentTypeParser](BlueprintInstance.md#addcontenttypeparser)
- [all](BlueprintInstance.md#all)
- [basicAuth](BlueprintInstance.md#basicauth)
- [caches](BlueprintInstance.md#caches)
- [defaultTextParser](BlueprintInstance.md#defaulttextparser)
- [delete](BlueprintInstance.md#delete)
- [errorHandler](BlueprintInstance.md#errorhandler)
- [get](BlueprintInstance.md#get)
- [getDefaultJsonParser](BlueprintInstance.md#getdefaultjsonparser)
- [hasContentTypeParser](BlueprintInstance.md#hascontenttypeparser)
- [head](BlueprintInstance.md#head)
- [initialConfig](BlueprintInstance.md#initialconfig)
- [log](BlueprintInstance.md#log)
- [manifest](BlueprintInstance.md#manifest)
- [options](BlueprintInstance.md#options)
- [patch](BlueprintInstance.md#patch)
- [post](BlueprintInstance.md#post)
- [prefix](BlueprintInstance.md#prefix)
- [put](BlueprintInstance.md#put)
- [register](BlueprintInstance.md#register)
- [removeAllContentTypeParsers](BlueprintInstance.md#removeallcontenttypeparsers)
- [removeContentTypeParser](BlueprintInstance.md#removecontenttypeparser)
- [routes](BlueprintInstance.md#routes)
- [server](BlueprintInstance.md#server)
- [serviceContainer](BlueprintInstance.md#servicecontainer)
- [version](BlueprintInstance.md#version)

## Methods

### addConstraintStrategy

**addConstraintStrategy**(`strategy`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `strategy` | `ConstraintStrategy`<`V1`, `unknown`\> |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[addConstraintStrategy](Assembly.md#addconstraintstrategy)

#### Defined in

node_modules/fastify/types/instance.d.ts:89

___

### addHook

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

`onRequest` is the first hook to be executed in the request lifecycle. There was no previous hook, the next hook will be `preParsing`.
 Notice: in the `onRequest` hook, request.body will always be null, because the body parsing happens before the `preHandler` hook.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onRequest"`` |
| `hook` | `onRequestHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:241

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onRequest"`` |
| `hook` | `onRequestAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:252

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

`preParsing` is the second hook to be executed in the request lifecycle. The previous hook was `onRequest`, the next hook will be `preValidation`.
Notice: in the `preParsing` hook, request.body will always be null, because the body parsing happens before the `preHandler` hook.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preParsing"`` |
| `hook` | `preParsingHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:267

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preParsing"`` |
| `hook` | `preParsingAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:278

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

`preValidation` is the third hook to be executed in the request lifecycle. The previous hook was `preParsing`, the next hook will be `preHandler`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preValidation"`` |
| `hook` | `preValidationHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:292

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preValidation"`` |
| `hook` | `preValidationAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:303

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

`preHandler` is the fourth hook to be executed in the request lifecycle. The previous hook was `preValidation`, the next hook will be `preSerialization`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preHandler"`` |
| `hook` | `preHandlerHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:317

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preHandler"`` |
| `hook` | `preHandlerAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:328

**addHook**<`PreSerializationPayload`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

`preSerialization` is the fifth hook to be executed in the request lifecycle. The previous hook was `preHandler`, the next hook will be `onSend`.
 Note: the hook is NOT called if the payload is a string, a Buffer, a stream or null.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `PreSerializationPayload` | `unknown` |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preSerialization"`` |
| `hook` | `preSerializationHookHandler`<`PreSerializationPayload`, `Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:343

**addHook**<`PreSerializationPayload`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `PreSerializationPayload` | `unknown` |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"preSerialization"`` |
| `hook` | `preSerializationAsyncHookHandler`<`PreSerializationPayload`, `Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:355

**addHook**<`OnSendPayload`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

You can change the payload with the `onSend` hook. It is the sixth hook to be executed in the request lifecycle. The previous hook was `preSerialization`, the next hook will be `onResponse`.
Note: If you change the payload, you may only change it to a string, a Buffer, a stream, or null.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `OnSendPayload` | `unknown` |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onSend"`` |
| `hook` | `onSendHookHandler`<`OnSendPayload`, `Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:371

**addHook**<`OnSendPayload`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `OnSendPayload` | `unknown` |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onSend"`` |
| `hook` | `onSendAsyncHookHandler`<`OnSendPayload`, `Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:383

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

`onResponse` is the seventh and last hook in the request hook lifecycle. The previous hook was `onSend`, there is no next hook.
The onResponse hook is executed when a response has been sent, so you will not be able to send more data to the client. It can however be useful for sending data to external services, for example to gather statistics.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onResponse"`` |
| `hook` | `onResponseHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:399

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onResponse"`` |
| `hook` | `onResponseAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:410

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

`onTimeout` is useful if you need to monitor the request timed out in your service. (if the `connectionTimeout` property is set on the fastify instance)
The onTimeout hook is executed when a request is timed out and the http socket has been hanged up. Therefore you will not be able to send data to the client.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onTimeout"`` |
| `hook` | `onTimeoutHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:425

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onTimeout"`` |
| `hook` | `onTimeoutAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:436

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

This hook is useful if you need to do some custom error logging or add some specific header in case of error.
It is not intended for changing the error, and calling reply.send will throw an exception.
This hook will be executed only after the customErrorHandler has been executed, and only if the customErrorHandler sends an error back to the user (Note that the default customErrorHandler always sends the error back to the user).
Notice: unlike the other hooks, pass an error to the done function is not supported.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onError"`` |
| `hook` | `onErrorHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `FastifyError`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:453

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `RequestType`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `RequestType` | extends `FastifyRequestType`<`unknown`, `unknown`, `unknown`, `unknown`, `RequestType`\> = `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\> |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onError"`` |
| `hook` | `onErrorAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `FastifyError`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `RequestType`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:464

**addHook**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `Logger`\>(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

Triggered when a new route is registered. Listeners are passed a routeOptions object as the sole parameter. The interface is synchronous, and, as such, the listener does not get passed a callback

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `Logger` | extends `BaseLogger` & `LoggerExtras`<`LoggerOptions`, `Logger`\> & `Record`<`never`, `LogFn`\> = `FastifyLoggerInstance` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onRoute"`` |
| `hook` | `onRouteHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `Logger`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `Logger`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:480

**addHook**(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

Triggered when a new plugin is registered and a new encapsulation context is created. The hook will be executed before the registered code.
This hook can be useful if you are developing a plugin that needs to know when a plugin context is formed, and you want to operate in that specific context.
Note: This hook will not be called if a plugin is wrapped inside fastify-plugin.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onRegister"`` |
| `hook` | `onRegisterHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`, `FastifyPluginOptions`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:495

**addHook**(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

Triggered when fastify.listen() or fastify.ready() is invoked to start the server. It is useful when plugins need a "ready" event, for example to load data before the server start listening for requests.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onReady"`` |
| `hook` | `onReadyHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:503

**addHook**(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onReady"`` |
| `hook` | `onReadyAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:508

**addHook**(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

Triggered when fastify.close() is invoked to stop the server. It is useful when plugins need a "shutdown" event, for example to close an open connection to a database.

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onClose"`` |
| `hook` | `onCloseHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:516

**addHook**(`name`, `hook`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | ``"onClose"`` |
| `hook` | `onCloseAsyncHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addHook](Assembly.md#addhook)

#### Defined in

node_modules/fastify/types/instance.d.ts:521

___

### addSchema

**addSchema**(`schema`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | `unknown` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[addSchema](Assembly.md#addschema)

#### Defined in

node_modules/fastify/types/instance.d.ts:53

___

### after

**after**(): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> & `PromiseLike`<`undefined`\>

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> & `PromiseLike`<`undefined`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[after](Assembly.md#after)

#### Defined in

node_modules/fastify/types/instance.d.ts:57

**after**(`afterListener`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `afterListener` | (`err`: `Error`) => `void` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[after](Assembly.md#after)

#### Defined in

node_modules/fastify/types/instance.d.ts:58

___

### auth

**auth**(`functions`, `options?`): `preHandlerHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `functions` | `FastifyAuthFunction`[] |
| `options?` | `Object` |
| `options.relation?` | ``"and"`` \| ``"or"`` |
| `options.run?` | ``"all"`` |

#### Returns

`preHandlerHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[auth](Assembly.md#auth)

#### Defined in

node_modules/@fastify/auth/auth.d.ts:13

___

### close

**close**(): `Promise`<`undefined`\>

#### Returns

`Promise`<`undefined`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[close](Assembly.md#close)

#### Defined in

node_modules/fastify/types/instance.d.ts:60

**close**(`closeListener`): `undefined`

#### Parameters

| Name | Type |
| :------ | :------ |
| `closeListener` | () => `void` |

#### Returns

`undefined`

#### Inherited from

[Assembly](interfaces-Assembly.md).[close](Assembly.md#close)

#### Defined in

node_modules/fastify/types/instance.d.ts:61

___

### decorate

**decorate**<`T`\>(`property`, `value`, `dependencies?`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` \| `symbol` |
| `value` | `T` extends (...`args`: `any`[]) => `any` ? (`this`: `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>, ...`args`: `Parameters`<`T`\>) => `ReturnType`<`T`\> : `T` |
| `dependencies?` | `string`[] |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[decorate](Assembly.md#decorate)

#### Defined in

node_modules/fastify/types/instance.d.ts:64

___

### decorateReply

**decorateReply**<`T`\>(`property`, `value`, `dependencies?`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` \| `symbol` |
| `value` | `T` extends (...`args`: `any`[]) => `any` ? (`this`: `FastifyReply`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `unknown`\>, ...`args`: `Parameters`<`T`\>) => `ReturnType`<`T`\> : `T` |
| `dependencies?` | `string`[] |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[decorateReply](Assembly.md#decoratereply)

#### Defined in

node_modules/fastify/types/instance.d.ts:78

___

### decorateRequest

**decorateRequest**<`T`\>(`property`, `value`, `dependencies?`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` \| `symbol` |
| `value` | `T` extends (...`args`: `any`[]) => `any` ? (`this`: `FastifyRequest`<`RouteGenericInterface`, `Server`, `IncomingMessage`, `FastifySchema`, `FastifyTypeProviderDefault`, `unknown`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\>, ...`args`: `Parameters`<`T`\>) => `ReturnType`<`T`\> : `T` |
| `dependencies?` | `string`[] |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[decorateRequest](Assembly.md#decoraterequest)

#### Defined in

node_modules/fastify/types/instance.d.ts:71

___

### getDefaultRoute

**getDefaultRoute**(): `DefaultRoute`<`IncomingMessage`, `ServerResponse`\>

#### Returns

`DefaultRoute`<`IncomingMessage`, `ServerResponse`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[getDefaultRoute](Assembly.md#getdefaultroute)

#### Defined in

node_modules/fastify/types/instance.d.ts:215

___

### getSchema

**getSchema**(`schemaId`): `unknown`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaId` | `string` |

#### Returns

`unknown`

#### Inherited from

[Assembly](interfaces-Assembly.md).[getSchema](Assembly.md#getschema)

#### Defined in

node_modules/fastify/types/instance.d.ts:54

___

### getSchemas

**getSchemas**(): `Record`<`string`, `unknown`\>

#### Returns

`Record`<`string`, `unknown`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[getSchemas](Assembly.md#getschemas)

#### Defined in

node_modules/fastify/types/instance.d.ts:55

___

### hasConstraintStrategy

**hasConstraintStrategy**(`strategyName`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `strategyName` | `string` |

#### Returns

`boolean`

#### Inherited from

[Assembly](interfaces-Assembly.md).[hasConstraintStrategy](Assembly.md#hasconstraintstrategy)

#### Defined in

node_modules/fastify/types/instance.d.ts:90

___

### hasDecorator

**hasDecorator**(`decorator`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `decorator` | `string` \| `symbol` |

#### Returns

`boolean`

#### Inherited from

[Assembly](interfaces-Assembly.md).[hasDecorator](Assembly.md#hasdecorator)

#### Defined in

node_modules/fastify/types/instance.d.ts:85

___

### hasReplyDecorator

**hasReplyDecorator**(`decorator`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `decorator` | `string` \| `symbol` |

#### Returns

`boolean`

#### Inherited from

[Assembly](interfaces-Assembly.md).[hasReplyDecorator](Assembly.md#hasreplydecorator)

#### Defined in

node_modules/fastify/types/instance.d.ts:87

___

### hasRequestDecorator

**hasRequestDecorator**(`decorator`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `decorator` | `string` \| `symbol` |

#### Returns

`boolean`

#### Inherited from

[Assembly](interfaces-Assembly.md).[hasRequestDecorator](Assembly.md#hasrequestdecorator)

#### Defined in

node_modules/fastify/types/instance.d.ts:86

___

### inject

**inject**(`opts`, `cb`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `string` \| `InjectOptions` |
| `cb` | `CallbackFunc` |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[inject](Assembly.md#inject)

#### Defined in

node_modules/fastify/types/instance.d.ts:92

**inject**(`opts`): `Promise`<`Response`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `string` \| `InjectOptions` |

#### Returns

`Promise`<`Response`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[inject](Assembly.md#inject)

#### Defined in

node_modules/fastify/types/instance.d.ts:93

**inject**(): `Chain`

#### Returns

`Chain`

#### Inherited from

[Assembly](interfaces-Assembly.md).[inject](Assembly.md#inject)

#### Defined in

node_modules/fastify/types/instance.d.ts:94

___

### listen

**listen**(`opts`, `callback`): `void`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.backlog?` | `number` | Specify the maximum length of the queue of pending connections. The actual length will be determined by the OS through sysctl settings such as `tcp_max_syn_backlog` and `somaxconn` on Linux. Default to `511`. |
| `opts.exclusive?` | `boolean` | Default to `false`. |
| `opts.host?` | `string` | Default to `localhost`. |
| `opts.ipv6Only?` | `boolean` | For TCP servers, setting `ipv6Only` to `true` will disable dual-stack support, i.e., binding to host `::` won't make `0.0.0.0` be bound. Default to `false`. |
| `opts.path?` | `string` | Will be ignored if `port` is specified. **`See`** [Identifying paths for IPC connections](https://nodejs.org/api/net.html#identifying-paths-for-ipc-connections). |
| `opts.port?` | `number` | Default to `0` (picks the first available open port). |
| `opts.readableAll?` | `boolean` | For IPC servers makes the pipe readable for all users. Default to `false`. |
| `opts.signal?` | `AbortSignal` | An AbortSignal that may be used to close a listening server. **`Since`** This option is available only in Node.js v15.6.0 and greater |
| `opts.writableAll?` | `boolean` | For IPC servers makes the pipe writable for all users. Default to `false`. |
| `callback` | (`err`: ``null`` \| `Error`, `address`: `string`) => `void` | - |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[listen](Assembly.md#listen)

#### Defined in

node_modules/fastify/types/instance.d.ts:96

**listen**(`opts?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts?` | `Object` | - |
| `opts.backlog?` | `number` | Specify the maximum length of the queue of pending connections. The actual length will be determined by the OS through sysctl settings such as `tcp_max_syn_backlog` and `somaxconn` on Linux. Default to `511`. |
| `opts.exclusive?` | `boolean` | Default to `false`. |
| `opts.host?` | `string` | Default to `localhost`. |
| `opts.ipv6Only?` | `boolean` | For TCP servers, setting `ipv6Only` to `true` will disable dual-stack support, i.e., binding to host `::` won't make `0.0.0.0` be bound. Default to `false`. |
| `opts.path?` | `string` | Will be ignored if `port` is specified. **`See`** [Identifying paths for IPC connections](https://nodejs.org/api/net.html#identifying-paths-for-ipc-connections). |
| `opts.port?` | `number` | Default to `0` (picks the first available open port). |
| `opts.readableAll?` | `boolean` | For IPC servers makes the pipe readable for all users. Default to `false`. |
| `opts.signal?` | `AbortSignal` | An AbortSignal that may be used to close a listening server. **`Since`** This option is available only in Node.js v15.6.0 and greater |
| `opts.writableAll?` | `boolean` | For IPC servers makes the pipe writable for all users. Default to `false`. |

#### Returns

`Promise`<`string`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[listen](Assembly.md#listen)

#### Defined in

node_modules/fastify/types/instance.d.ts:141

**listen**(`callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`err`: ``null`` \| `Error`, `address`: `string`) => `void` |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[listen](Assembly.md#listen)

#### Defined in

node_modules/fastify/types/instance.d.ts:186

**listen**(`port`, `address`, `backlog`, `callback`): `void`

**`Deprecated`**

Variadic listen method is deprecated. Please use `.listen(optionsObject, callback)` instead. The variadic signature will be removed in `fastify@5`

**`See`**

https://github.com/fastify/fastify/pull/3712

#### Parameters

| Name | Type |
| :------ | :------ |
| `port` | `string` \| `number` |
| `address` | `string` |
| `backlog` | `number` |
| `callback` | (`err`: ``null`` \| `Error`, `address`: `string`) => `void` |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[listen](Assembly.md#listen)

#### Defined in

node_modules/fastify/types/instance.d.ts:192

**listen**(`port`, `address`, `callback`): `void`

**`Deprecated`**

Variadic listen method is deprecated. Please use `.listen(optionsObject, callback)` instead. The variadic signature will be removed in `fastify@5`

**`See`**

https://github.com/fastify/fastify/pull/3712

#### Parameters

| Name | Type |
| :------ | :------ |
| `port` | `string` \| `number` |
| `address` | `string` |
| `callback` | (`err`: ``null`` \| `Error`, `address`: `string`) => `void` |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[listen](Assembly.md#listen)

#### Defined in

node_modules/fastify/types/instance.d.ts:197

**listen**(`port`, `callback`): `void`

**`Deprecated`**

Variadic listen method is deprecated. Please use `.listen(optionsObject, callback)` instead. The variadic signature will be removed in `fastify@5`

**`See`**

https://github.com/fastify/fastify/pull/3712

#### Parameters

| Name | Type |
| :------ | :------ |
| `port` | `string` \| `number` |
| `callback` | (`err`: ``null`` \| `Error`, `address`: `string`) => `void` |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[listen](Assembly.md#listen)

#### Defined in

node_modules/fastify/types/instance.d.ts:202

**listen**(`port`, `address?`, `backlog?`): `Promise`<`string`\>

**`Deprecated`**

Variadic listen method is deprecated. Please use `.listen(optionsObject)` instead. The variadic signature will be removed in `fastify@5`

**`See`**

https://github.com/fastify/fastify/pull/3712

#### Parameters

| Name | Type |
| :------ | :------ |
| `port` | `string` \| `number` |
| `address?` | `string` |
| `backlog?` | `number` |

#### Returns

`Promise`<`string`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[listen](Assembly.md#listen)

#### Defined in

node_modules/fastify/types/instance.d.ts:207

___

### parseCookie

**parseCookie**(`cookieHeader`): `Object`

Manual cookie parsing method

**`Docs`**

https://github.com/fastify/fastify-cookie#manual-cookie-parsing

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cookieHeader` | `string` | Raw cookie header value |

#### Returns

`Object`

#### Inherited from

[Assembly](interfaces-Assembly.md).[parseCookie](Assembly.md#parsecookie)

#### Defined in

node_modules/@fastify/cookie/types/plugin.d.ts:12

___

### printPlugins

**printPlugins**(): `string`

Prints the representation of the plugin tree used by avvio, the plugin registration system

#### Returns

`string`

#### Inherited from

[Assembly](interfaces-Assembly.md).[printPlugins](Assembly.md#printplugins)

#### Defined in

node_modules/fastify/types/instance.d.ts:607

___

### printRoutes

**printRoutes**(`opts?`): `string`

Prints the representation of the internal radix tree used by the router

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `PrintRoutesOptions` |

#### Returns

`string`

#### Inherited from

[Assembly](interfaces-Assembly.md).[printRoutes](Assembly.md#printroutes)

#### Defined in

node_modules/fastify/types/instance.d.ts:602

___

### ready

**ready**(): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> & `PromiseLike`<`undefined`\>

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> & `PromiseLike`<`undefined`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[ready](Assembly.md#ready)

#### Defined in

node_modules/fastify/types/instance.d.ts:209

**ready**(`readyListener`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `readyListener` | (`err`: `Error`) => `void` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[ready](Assembly.md#ready)

#### Defined in

node_modules/fastify/types/instance.d.ts:210

___

### route

**route**<`RouteGeneric`, `ContextConfig`, `SchemaCompiler`\>(`opts`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | `unknown` |
| `SchemaCompiler` | `FastifySchema` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `RouteOptions`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `FastifyTypeProviderDefault`, `ResolveFastifyReplyReturnType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\>, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[route](Assembly.md#route)

#### Defined in

node_modules/fastify/types/instance.d.ts:218

___

### routing

**routing**(`req`, `res`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `IncomingMessage` |
| `res` | `ServerResponse` |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[routing](Assembly.md#routing)

#### Defined in

node_modules/fastify/types/instance.d.ts:214

___

### setDefaultRoute

**setDefaultRoute**(`defaultRoute`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `defaultRoute` | `DefaultRoute`<`IncomingMessage`, `ServerResponse`\> |

#### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[setDefaultRoute](Assembly.md#setdefaultroute)

#### Defined in

node_modules/fastify/types/instance.d.ts:216

___

### setErrorHandler

**setErrorHandler**<`TError`, `RouteGeneric`, `SchemaCompiler`, `TypeProvider`\>(`handler`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `TypeProvider`\>

Set a function that will be called whenever an error happens

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TError` | extends `Error` = `FastifyError` |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |
| `TypeProvider` | extends `FastifyTypeProvider` = `FastifyTypeProviderDefault` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | (`this`: `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `TypeProvider`\>, `error`: `TError`, `request`: `FastifyRequest`<`RouteGeneric`, `Server`, `IncomingMessage`, `SchemaCompiler`, `TypeProvider`, `unknown`, `ResolveFastifyRequestType`<`TypeProvider`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\>, `reply`: `FastifyReply`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `unknown`, `SchemaCompiler`, `TypeProvider`, `UseReplyFromRouteGeneric`<`RouteGeneric`\> extends ``true`` ? `ResolveReplyFromRouteGeneric`<`RouteGeneric`\> : `UseReplyFromSchemaCompiler`<`SchemaCompiler`\> extends ``true`` ? `ResolveReplyFromSchemaCompiler`<`TypeProvider`, `SchemaCompiler`\> : `unknown`\>) => `any` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `TypeProvider`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setErrorHandler](Assembly.md#seterrorhandler)

#### Defined in

node_modules/fastify/types/instance.d.ts:549

___

### setNotFoundHandler

**setNotFoundHandler**<`RouteGeneric`, `TypeProvider`, `SchemaCompiler`\>(`handler`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `TypeProvider`\>

Set the 404 handler

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `TypeProvider` | extends `FastifyTypeProvider` = `FastifyTypeProviderDefault` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | (`request`: `FastifyRequest`<`RouteGeneric`, `Server`, `IncomingMessage`, `SchemaCompiler`, `TypeProvider`, `unknown`, `ResolveFastifyRequestType`<`TypeProvider`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\>, `reply`: `FastifyReply`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `unknown`, `SchemaCompiler`, `TypeProvider`, `UseReplyFromRouteGeneric`<`RouteGeneric`\> extends ``true`` ? `ResolveReplyFromRouteGeneric`<`RouteGeneric`\> : `UseReplyFromSchemaCompiler`<`SchemaCompiler`\> extends ``true`` ? `ResolveReplyFromSchemaCompiler`<`TypeProvider`, `SchemaCompiler`\> : `unknown`\>) => `void` \| `Promise`<`void` \| `RouteGeneric`[``"Reply"``]\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `TypeProvider`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setNotFoundHandler](Assembly.md#setnotfoundhandler)

#### Defined in

node_modules/fastify/types/instance.d.ts:529

**setNotFoundHandler**<`RouteGeneric`, `ContextConfig`, `TypeProvider`, `SchemaCompiler`\>(`opts`, `handler`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `TypeProvider`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RouteGeneric` | extends `RouteGenericInterface` = `RouteGenericInterface` |
| `ContextConfig` | extends `unknown` = `unknown` |
| `TypeProvider` | extends `FastifyTypeProvider` = `FastifyTypeProviderDefault` |
| `SchemaCompiler` | extends `FastifySchema` = `FastifySchema` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.preHandler?` | `preHandlerHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `TypeProvider`, `ResolveFastifyRequestType`<`TypeProvider`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\> \| `preHandlerHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `TypeProvider`, `ResolveFastifyRequestType`<`TypeProvider`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\>[] |
| `opts.preValidation?` | `preValidationHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `TypeProvider`, `ResolveFastifyRequestType`<`TypeProvider`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\> \| `preValidationHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `ContextConfig`, `SchemaCompiler`, `TypeProvider`, `ResolveFastifyRequestType`<`TypeProvider`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\>[] |
| `handler` | (`request`: `FastifyRequest`<`RouteGeneric`, `Server`, `IncomingMessage`, `SchemaCompiler`, `TypeProvider`, `unknown`, `ResolveFastifyRequestType`<`TypeProvider`, `SchemaCompiler`, `RouteGeneric`\>, `FastifyLoggerInstance`\>, `reply`: `FastifyReply`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGeneric`, `unknown`, `SchemaCompiler`, `TypeProvider`, `UseReplyFromRouteGeneric`<`RouteGeneric`\> extends ``true`` ? `ResolveReplyFromRouteGeneric`<`RouteGeneric`\> : `UseReplyFromSchemaCompiler`<`SchemaCompiler`\> extends ``true`` ? `ResolveReplyFromSchemaCompiler`<`TypeProvider`, `SchemaCompiler`\> : `unknown`\>) => `void` \| `Promise`<`void` \| `RouteGeneric`[``"Reply"``]\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `TypeProvider`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setNotFoundHandler](Assembly.md#setnotfoundhandler)

#### Defined in

node_modules/fastify/types/instance.d.ts:533

___

### setReplySerializer

**setReplySerializer**(`replySerializer`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

Set the reply serializer for all routes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `replySerializer` | (`payload`: `unknown`, `statusCode`: `number`) => `string` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setReplySerializer](Assembly.md#setreplyserializer)

#### Defined in

node_modules/fastify/types/instance.d.ts:571

___

### setSchemaController

**setSchemaController**(`schemaControllerOpts`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

Set the schema controller for all routes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaControllerOpts` | `FastifySchemaControllerOptions` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setSchemaController](Assembly.md#setschemacontroller)

#### Defined in

node_modules/fastify/types/instance.d.ts:566

___

### setSchemaErrorFormatter

**setSchemaErrorFormatter**(`errorFormatter`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `errorFormatter` | (`errors`: `FastifySchemaValidationError`[], `dataVar`: `string`) => `Error` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setSchemaErrorFormatter](Assembly.md#setschemaerrorformatter)

#### Defined in

node_modules/fastify/types/instance.d.ts:576

___

### setSerializerCompiler

**setSerializerCompiler**<`T`\>(`schemaCompiler`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

Set the schema serializer for all routes.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `FastifySchema` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaCompiler` | `FastifySerializerCompiler`<`T`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setSerializerCompiler](Assembly.md#setserializercompiler)

#### Defined in

node_modules/fastify/types/instance.d.ts:561

___

### setValidatorCompiler

**setValidatorCompiler**<`T`\>(`schemaCompiler`): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

Set the schema validator for all routes.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `FastifySchema` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaCompiler` | `FastifySchemaCompiler`<`T`\> |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[setValidatorCompiler](Assembly.md#setvalidatorcompiler)

#### Defined in

node_modules/fastify/types/instance.d.ts:556

___

### signCookie

**signCookie**(`value`): `string`

Signs the specified cookie using the secret/signer provided.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `string` | cookie value |

#### Returns

`string`

#### Inherited from

[Assembly](interfaces-Assembly.md).[signCookie](Assembly.md#signcookie)

#### Defined in

node_modules/@fastify/cookie/types/plugin.d.ts:36

___

### unsignCookie

**unsignCookie**(`value`): `UnsignResult`

Unsigns the specified cookie using the secret/signer provided.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `string` | Cookie value |

#### Returns

`UnsignResult`

#### Inherited from

[Assembly](interfaces-Assembly.md).[unsignCookie](Assembly.md#unsigncookie)

#### Defined in

node_modules/@fastify/cookie/types/plugin.d.ts:42

___

### withTypeProvider

**withTypeProvider**<`Provider`\>(): `FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `Provider`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Provider` | extends `FastifyTypeProvider` |

#### Returns

`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `Provider`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[withTypeProvider](Assembly.md#withtypeprovider)

#### Defined in

node_modules/fastify/types/instance.d.ts:51

## Properties

### addContentTypeParser

 **addContentTypeParser**: `AddContentTypeParser`<`Server`, `IncomingMessage`, `RouteGenericInterface`, `FastifySchema`, `FastifyTypeProviderDefault`\>

Add a content type parser

#### Inherited from

[Assembly](interfaces-Assembly.md).[addContentTypeParser](Assembly.md#addcontenttypeparser)

#### Defined in

node_modules/fastify/types/instance.d.ts:580

___

### all

 **all**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[all](Assembly.md#all)

#### Defined in

node_modules/fastify/types/instance.d.ts:231

___

### basicAuth

 **basicAuth**: `onRequestHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\> \| `preValidationHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\> \| `preHandlerHookHandler`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[basicAuth](Assembly.md#basicauth)

#### Defined in

node_modules/@fastify/basic-auth/index.d.ts:14

___

### caches

 `Optional` **caches**: `BlueprintCaches`

Cache interfaces for this assembly instance

#### Inherited from

[Assembly](interfaces-Assembly.md).[caches](Assembly.md#caches)

#### Defined in

[src/types/blueprint.simple.types.ts:45](https://github.com/zjayers/AssembleJS/blob/3539104/src/types/blueprint.simple.types.ts#L45)

___

### defaultTextParser

 **defaultTextParser**: `FastifyBodyParser`<`string`, `Server`, `IncomingMessage`, `RouteGenericInterface`, `FastifySchema`, `FastifyTypeProviderDefault`\>

Fastify default plain text parser

#### Inherited from

[Assembly](interfaces-Assembly.md).[defaultTextParser](Assembly.md#defaulttextparser)

#### Defined in

node_modules/fastify/types/instance.d.ts:597

___

### delete

 **delete**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[delete](Assembly.md#delete)

#### Defined in

node_modules/fastify/types/instance.d.ts:228

___

### errorHandler

 **errorHandler**: (`error`: `FastifyError`, `request`: `FastifyRequest`<`RouteGenericInterface`, `Server`, `IncomingMessage`, `FastifySchema`, `FastifyTypeProviderDefault`, `unknown`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\>, `reply`: `FastifyReply`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `unknown`\>) => `void`

#### Type declaration

(`error`, `request`, `reply`): `void`

Fastify default error handler

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `FastifyError` |
| `request` | `FastifyRequest`<`RouteGenericInterface`, `Server`, `IncomingMessage`, `FastifySchema`, `FastifyTypeProviderDefault`, `unknown`, `ResolveFastifyRequestType`<`FastifyTypeProviderDefault`, `FastifySchema`, `RouteGenericInterface`\>, `FastifyLoggerInstance`\> |
| `reply` | `FastifyReply`<`Server`, `IncomingMessage`, `ServerResponse`, `RouteGenericInterface`, `unknown`, `FastifySchema`, `FastifyTypeProviderDefault`, `unknown`\> |

##### Returns

`void`

#### Inherited from

[Assembly](interfaces-Assembly.md).[errorHandler](Assembly.md#errorhandler)

#### Defined in

node_modules/fastify/types/instance.d.ts:544

___

### get

 **get**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[get](Assembly.md#get)

#### Defined in

node_modules/fastify/types/instance.d.ts:224

___

### getDefaultJsonParser

 **getDefaultJsonParser**: `getDefaultJsonParser`

Fastify default JSON parser

#### Inherited from

[Assembly](interfaces-Assembly.md).[getDefaultJsonParser](Assembly.md#getdefaultjsonparser)

#### Defined in

node_modules/fastify/types/instance.d.ts:593

___

### hasContentTypeParser

 **hasContentTypeParser**: `hasContentTypeParser`

#### Inherited from

[Assembly](interfaces-Assembly.md).[hasContentTypeParser](Assembly.md#hascontenttypeparser)

#### Defined in

node_modules/fastify/types/instance.d.ts:581

___

### head

 **head**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[head](Assembly.md#head)

#### Defined in

node_modules/fastify/types/instance.d.ts:225

___

### initialConfig

 **initialConfig**: `Readonly`<{ `allowUnsafeRegex?`: `boolean` ; `bodyLimit?`: `number` ; `caseSensitive?`: `boolean` ; `connectionTimeout?`: `number` ; `disableRequestLogging?`: `boolean` ; `forceCloseConnections?`: `boolean` ; `http2?`: `boolean` ; `http2SessionTimeout?`: `number` ; `https?`: `boolean` \| `Readonly`<{ `allowHTTP1`: `boolean`  }\> ; `ignoreDuplicateSlashes?`: `boolean` ; `ignoreTrailingSlash?`: `boolean` ; `keepAliveTimeout?`: `number` ; `maxParamLength?`: `number` ; `onConstructorPoisoning?`: `ConstructorAction` ; `onProtoPoisoning?`: `ProtoAction` ; `pluginTimeout?`: `number` ; `requestIdHeader?`: `string` ; `requestIdLogLabel?`: `string`  }\>

Frozen read-only object registering the initial options passed down by the user to the fastify instance

#### Inherited from

[Assembly](interfaces-Assembly.md).[initialConfig](Assembly.md#initialconfig)

#### Defined in

node_modules/fastify/types/instance.d.ts:612

___

### log

 **log**: `FastifyLoggerInstance`

#### Inherited from

[Assembly](interfaces-Assembly.md).[log](Assembly.md#log)

#### Defined in

node_modules/fastify/types/instance.d.ts:49

___

### manifest

 `Optional` **manifest**: [`BlueprintServerManifest`](interfaces-BlueprintServerManifest.md)

Server manifest containing registered components, blueprints, controllers, etc.

#### Inherited from

[Assembly](interfaces-Assembly.md).[manifest](Assembly.md#manifest)

#### Defined in

[src/types/blueprint.simple.types.ts:51](https://github.com/zjayers/AssembleJS/blob/3539104/src/types/blueprint.simple.types.ts#L51)

___

### options

 **options**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[options](Assembly.md#options)

#### Defined in

node_modules/fastify/types/instance.d.ts:229

___

### patch

 **patch**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[patch](Assembly.md#patch)

#### Defined in

node_modules/fastify/types/instance.d.ts:230

___

### post

 **post**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[post](Assembly.md#post)

#### Defined in

node_modules/fastify/types/instance.d.ts:226

___

### prefix

 **prefix**: `string`

#### Inherited from

[Assembly](interfaces-Assembly.md).[prefix](Assembly.md#prefix)

#### Defined in

node_modules/fastify/types/instance.d.ts:47

___

### put

 **put**: `RouteShorthandMethod`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyTypeProviderDefault`\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[put](Assembly.md#put)

#### Defined in

node_modules/fastify/types/instance.d.ts:227

___

### register

 **register**: `FastifyRegister`<`FastifyInstance`<`Server`, `IncomingMessage`, `ServerResponse`, `FastifyLoggerInstance`, `FastifyTypeProviderDefault`\> & `PromiseLike`<`undefined`\>\>

#### Inherited from

[Assembly](interfaces-Assembly.md).[register](Assembly.md#register)

#### Defined in

node_modules/fastify/types/instance.d.ts:212

___

### removeAllContentTypeParsers

 **removeAllContentTypeParsers**: `removeAllContentTypeParsers`

Remove all content type parsers, including the default ones

#### Inherited from

[Assembly](interfaces-Assembly.md).[removeAllContentTypeParsers](Assembly.md#removeallcontenttypeparsers)

#### Defined in

node_modules/fastify/types/instance.d.ts:589

___

### removeContentTypeParser

 **removeContentTypeParser**: `removeContentTypeParser`

Remove an existing content type parser

#### Inherited from

[Assembly](interfaces-Assembly.md).[removeContentTypeParser](Assembly.md#removecontenttypeparser)

#### Defined in

node_modules/fastify/types/instance.d.ts:585

___

### routes

 **routes**: `FastifyRoutes`

#### Inherited from

[Assembly](interfaces-Assembly.md).[routes](Assembly.md#routes)

#### Defined in

node_modules/@fastify/routes/types/index.d.ts:7

___

### server

 **server**: `Server`

#### Inherited from

[Assembly](interfaces-Assembly.md).[server](Assembly.md#server)

#### Defined in

node_modules/fastify/types/instance.d.ts:46

___

### serviceContainer

 **serviceContainer**: `ServiceContainer`

Service container for dependency injection

#### Inherited from

[Assembly](interfaces-Assembly.md).[serviceContainer](Assembly.md#servicecontainer)

#### Defined in

[src/types/blueprint.simple.types.ts:48](https://github.com/zjayers/AssembleJS/blob/3539104/src/types/blueprint.simple.types.ts#L48)

___

### version

 **version**: `string`

#### Inherited from

[Assembly](interfaces-Assembly.md).[version](Assembly.md#version)

#### Defined in

node_modules/fastify/types/instance.d.ts:48
