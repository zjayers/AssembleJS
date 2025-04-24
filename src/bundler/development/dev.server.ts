import path from "path";
import vavite from "vavite";
import { createServer } from "vite";
import livereload from "vite-plugin-live-reload";
import preact from "@preact/preset-vite";
import { CONSTANTS } from "../../constants/blueprint.constants";
import {
  createServerTransformPlugin,
  logWithBadge,
  printHeaderBox,
} from "../common/visual.utils";

export const startBlueprintDevServer = async (serverRoot: string) => {
  const serverEntryFile = "server.ts";
  const serverEntryPath = path.join(process.cwd(), "src", serverEntryFile);

  printHeaderBox("AssembleJS Development Server");
  logWithBadge("Starting development server...", "info");

  // Create the vite server.
  const server = await createServer({
    mode: "development",
    configFile: false,
    envDir: serverRoot,
    envPrefix: CONSTANTS.env.prefix.key,
    root: serverRoot,
    server: {
      port: 3000,
    },
    optimizeDeps: {
      include: [
        "preact/devtools",
        "preact/debug",
        "preact/jsx-runtime",
        "preact",
        "preact/hooks",
      ],
    },
    plugins: [
      // Add the server transformation plugin
      createServerTransformPlugin(serverRoot, "development"),

      preact(),
      /**
       * `vavite` is a set of tools for developing and building server-side applications with Vite.
       * https://github.com/cyco130/vavite
       */ vavite({
        serverEntry: serverEntryPath,
        reloadOn: "static-deps-change",
        serveClientAssetsInDev: true,
      }),
      /**
       * `vite-plugin-live-reload` is a Vite plugin that enables live reloading of the browser for server side changes.
       * https://www.npmjs.com/package/vite-plugin-live-reload
       */ livereload("src/**/*", {
        root: serverRoot,
        alwaysReload: true,
        log: true,
        cwd: serverRoot,
        persistent: true,
      }),
    ],
  });

  // Start the Vite dev server
  await server.listen();

  logWithBadge(
    "Development server running at http://localhost:3000",
    "success"
  );

  return server;
};
