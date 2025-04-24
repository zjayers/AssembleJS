# Function: createBlueprintServer

**createBlueprintServer**(`userOpts`): `Promise`<[`Assembly`](functions-interfaces-Assembly.md)\>

Creates a new AssembleJS server instance with the specified configuration.

This is the main entry point for creating an AssembleJS application.
It sets up the server, registers components, controllers, and routes,
and initializes the application lifecycle.

**`Example`**

```typescript
import { createBlueprintServer } from 'asmbl';
import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  manifest: {
    components: [
      {
        path: 'home',
        views: [{
          exposeAsBlueprint: true,
          viewName: 'desktop',
          templateFile: 'desktop.view.ejs',
          components: [
            {contentUrl: '/call-to-action/desktop/', name: 'callToAction'}
          ]
        }],
      }
    ],
    controllers: [MyApiController],
    assetDirectoryRoots: [{ path: './assets' }]
  }
});
```

**`Throws`**

Will throw an error if the development HTTP server or HMR server is not found

**`Throws`**

Will throw an error if the server fails to start

**`See`**

 - BlueprintServerOptions for detailed configuration options
 - [Assembly](functions-interfaces-Assembly.md) for the returned server instance

**`Remarks`**

- The server creation is asynchronous and will resolve when the server is ready
- For development, use with vavite/vite-dev-server for HMR support
- For production, the server can be built using asm-build
- In development mode, the browser will automatically open to the server address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `userOpts` | `BlueprintServerOptions` | Configuration options for the AssembleJS server |

#### Returns

`Promise`<[`Assembly`](functions-interfaces-Assembly.md)\>

Promise that resolves to the Assembly instance

#### Defined in

[src/server/app/create-blueprint.server.ts:80](https://github.com/zjayers/AssembleJS/blob/14bff3e/src/server/app/create-blueprint.server.ts#L80)
