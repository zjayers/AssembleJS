import type { Assembly } from "../../types/blueprint.simple.types";
import type { BlueprintServerOptions } from "../../types/blueprint.server.options";
import type { AddressInfo } from "net";
import { fastify } from "fastify";
import { ASSEMBLEJS } from "../config/blueprint.config";
import { assertNoDuplicateComponents } from "./assert-no-duplicate.components";
import { buildComponentViews } from "./build-component.views";
import { buildBlueprintControllers } from "./build.blueprint-controllers";
import { logLocalInformation } from "./log.local-information";
import { fileURLToPath } from "url";
import fastifyRoutes from "@fastify/routes";
import fastifyCompress from "@fastify/compress";
import fastifyHelmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";
import fastifyAuth from "@fastify/auth";
import fastifyBasicAuth from "@fastify/basic-auth";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import { createAuthMiddleware } from "./auth/auth.utils";
import { setupServerCaching } from "./cache/cache.integration";
import path from "path";
import fs from "fs";
import viteDevServer from "vavite/vite-dev-server";
import vaviteHttpServer from "vavite/http-dev-server";
import { AuthController } from "./auth/auth.controller";
import { ServiceContainer } from "./service-container";

/**
 * Creates a new AssembleJS server instance with the specified configuration.
 *
 * This is the main entry point for creating an AssembleJS application.
 * It sets up the server, registers components, controllers, and routes,
 * and initializes the application lifecycle.
 *
 * @example
 * ```typescript
 * import { createBlueprintServer } from 'asmbl';
 * import viteDevServer from 'vavite/vite-dev-server';
 * import vaviteHttpServer from 'vavite/http-dev-server';
 *
 * void createBlueprintServer({
 *   serverRoot: import.meta.url,
 *   httpServer: vaviteHttpServer,
 *   devServer: viteDevServer,
 *   manifest: {
 *     components: [
 *       {
 *         path: 'home',
 *         views: [{
 *           exposeAsBlueprint: true,
 *           viewName: 'desktop',
 *           templateFile: 'desktop.view.ejs',
 *           components: [
 *             {contentUrl: '/call-to-action/desktop/', name: 'callToAction'}
 *           ]
 *         }],
 *       }
 *     ],
 *     controllers: [MyApiController],
 *     assetDirectoryRoots: [{ path: './assets' }]
 *   }
 * });
 * ```
 *
 * @param {BlueprintServerOptions} userOpts - Configuration options for the AssembleJS server
 * @return {Promise<Assembly>} Promise that resolves to the Assembly instance
 *
 * @throws Will throw an error if the development HTTP server or HMR server is not found
 * @throws Will throw an error if the server fails to start
 *
 * @see {@link BlueprintServerOptions} for detailed configuration options
 * @see {@link Assembly} for the returned server instance
 *
 * @remarks
 * - The server creation is asynchronous and will resolve when the server is ready
 * - For development, use with vavite/vite-dev-server for HMR support
 * - For production, the server can be built using asm-build
 * - In development mode, the browser will automatically open to the server address
 */
export async function createBlueprintServer(
  userOpts: BlueprintServerOptions
): Promise<Assembly> {
  const rootPath: string = fileURLToPath(new URL(userOpts.serverRoot!));
  ASSEMBLEJS.setRoot(rootPath);

  // Get HTTP Server Pointers
  const httpServer = userOpts.httpServer ?? vaviteHttpServer;
  // Get Dev Server Pointers
  const devServer = userOpts.devServer ?? viteDevServer;

  // Get the base server options
  const baseOpts: Pick<BlueprintServerOptions, "host" | "port"> = {
    host: userOpts.host ?? (ASSEMBLEJS.host as string),
    port: userOpts.port ?? (ASSEMBLEJS.port as number),
  };

  // Create the Fastify Instance
  // Create the Fastify instance and cast it to BlueprintInstance
  const app = fastify({
    logger: {
      level:
        ASSEMBLEJS.logLevel ?? ASSEMBLEJS.isLocal()
          ? "debug"
          : ASSEMBLEJS.isProduction()
          ? "error"
          : "info",
      transport: ASSEMBLEJS.isLocal()
        ? {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    },
    disableRequestLogging: !ASSEMBLEJS.enableRequestLogging,
    ignoreTrailingSlash: false,
    serverFactory: httpServer
      ? (handler) => {
          httpServer!.on("request", handler);
          return httpServer!;
        }
      : undefined,
    ...baseOpts,
    ...userOpts.advanced,
  });

  // Cast the Fastify instance to our Assembly type
  const blueprintApp = app as unknown as Assembly;

  // Initialize the service container
  const serviceContainer = ServiceContainer.getInstance();
  blueprintApp.serviceContainer = serviceContainer;

  // Attach the manifest to the app instance
  blueprintApp.manifest = userOpts.manifest;

  // Register services from the manifest if provided
  if (userOpts.manifest.services) {
    blueprintApp.log.info("Registering services...");

    for (const [token, ServiceClass] of Object.entries(
      userOpts.manifest.services
    )) {
      try {
        // Create a new instance of the service
        const service = new ServiceClass();

        // Register the service in the container
        serviceContainer.register(token, service);

        // Initialize the service if it has an initialize method
        if (typeof service.initialize === "function") {
          await service.initialize();
        }

        blueprintApp.log.debug(`Service registered: ${token}`);
      } catch (error) {
        blueprintApp.log.error(
          `Failed to register service ${token}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  // Append Custom Hooks
  userOpts.hooks?.forEach((hook) => {
    // Hooks are tuples with a string key and a function
    // Need to safely extract and apply them
    // Correctly handle the hook tuple types based on the BlueprintServerHook definition
    const [hookName, hookFunction] = hook;

    // Make sure both the hook name and function exist

    if (hookName && typeof hookFunction === "function") {
      // Cast to any to bypass type checking since we've done our own validation
      blueprintApp.addHook(hookName as any, hookFunction);
    }
  });

  // If any .ts or .scss files are requests, return a "no content"
  // This is to prevent the browser from requesting the file directly
  blueprintApp.addHook("onRequest", (req, reply, done) => {
    if (req.url?.endsWith(".ts") || req.url?.endsWith(".scss")) {
      reply.code(204).send();
      return done();
    }

    done();
  });

  // Client Bundle - available from the top-most blueprint server
  await blueprintApp.register(fastifyStatic, {
    root: path.join(
      rootPath,
      "..",
      "..",
      "node_modules",
      "asmbl",
      "lib",
      "bundles"
    ),
    prefix: "/bundles",
  });

  // Framework assets (favicon, apple-touch-icon, etc.) at root level
  await blueprintApp.register(fastifyStatic, {
    root: path.join(
      rootPath,
      "..",
      "..",
      "node_modules",
      "asmbl",
      "lib",
      "bundles",
      "assets"
    ),
    prefix: "/",
    decorateReply: false,
  });

  // Apply Plugins
  await blueprintApp.register(fastifyRoutes);
  await blueprintApp.register(fastifyCompress);
  await blueprintApp.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      },
    },
  });
  await blueprintApp.register(fastifyCors);
  await blueprintApp.register(fastifyCookie, {
    secret: ASSEMBLEJS.cookieSecret as string, // for cookie signing
    parseOptions: {}, // options for parsing cookies
  });

  // Setup caching system if configured
  if (userOpts.cache) {
    setupServerCaching(blueprintApp, userOpts.cache);
  }

  // Register authentication if configured
  if (userOpts.auth?.useBasicAuth === true) {
    // Basic Auth
    await blueprintApp.register(fastifyAuth);
    await blueprintApp.register(fastifyBasicAuth, {
      authenticate: {
        realm: "localhost",
      },
      validate: (username, password, req, reply, done) => {
        const validUser =
          userOpts.auth?.basicAuthUser || ASSEMBLEJS.basicAuthUser;
        const validPassword =
          userOpts.auth?.basicAuthPassword || ASSEMBLEJS.basicAuthPassword;

        if (username === validUser && password === validPassword) {
          return done();
        }
        return done(new Error("Authentication failed"));
      },
    });

    // Add authentication middleware for routes requiring auth
    const authMiddleware = createAuthMiddleware(userOpts.auth);
    blueprintApp.addHook("onRequest", authMiddleware);
  } else if (userOpts.auth?.authenticate) {
    // Custom authentication
    await blueprintApp.register(fastifyAuth);

    // Add authentication middleware for routes requiring auth
    const authMiddleware = createAuthMiddleware(userOpts.auth);
    blueprintApp.addHook("onRequest", authMiddleware);
  }

  // Ensure no duplicate Components or views were used
  assertNoDuplicateComponents(userOpts);

  // Prepare Components
  userOpts.manifest.components = await buildComponentViews(userOpts);

  // Register the authentication controller if authentication is enabled
  if (userOpts.auth) {
    // Add auth controller to the manifest controllers
    // Create a new controllers array instead of modifying the original
    const controllers = [
      ...(userOpts.manifest.controllers || []),
      AuthController,
    ];

    // Create a new manifest with the updated controllers
    userOpts.manifest = {
      ...userOpts.manifest,
      controllers,
    };
  }

  // Prepare Controllers
  buildBlueprintControllers(blueprintApp, userOpts, devServer);

  // Start the Server
  // Register global error handlers

  // 404 Not Found Handler
  blueprintApp.setNotFoundHandler((request, reply) => {
    blueprintApp.log.debug(`404 Not Found: ${request.method} ${request.url}`);

    // If it's an API route, return a JSON error
    if (request.url.startsWith("/api/")) {
      reply.code(404).send({
        error: "Not Found",
        message: "The requested endpoint does not exist",
        path: request.url,
      });
      return;
    }

    // For HTML requests, return the 404 page
    try {
      const notFoundPath = path.join(
        __dirname,
        "../../developer/pages/404.html"
      );
      if (fs.existsSync(notFoundPath)) {
        let notFoundHtml = fs.readFileSync(notFoundPath, "utf8");

        // In development mode, show additional details
        if (ASSEMBLEJS.isLocal()) {
          // Show development-only sections
          notFoundHtml = notFoundHtml.replace(
            /class="dev-only"/g,
            'class="dev-only" style="display: block;"'
          );

          // Inject request URL
          notFoundHtml = notFoundHtml.replace(
            "<!-- Request URL will be injected here -->",
            request.url.replace(/</g, "&lt;").replace(/>/g, "&gt;")
          );
        }

        reply.code(404).header("Content-Type", "text/html").send(notFoundHtml);
        return;
      }
    } catch (error) {
      blueprintApp.log.error("Error serving 404 page:", error);
    }

    // Fallback response if the HTML file can't be loaded
    reply
      .code(404)
      .header("Content-Type", "text/html")
      .send(
        "<h1>404 Not Found</h1><p>The requested resource could not be found.</p>"
      );
  });

  // 500 Server Error Handler
  blueprintApp.setErrorHandler((error, request, reply) => {
    // Log the error
    blueprintApp.log.error(
      {
        err: error,
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
      },
      "Server Error"
    );

    // Determine status code (use 500 as default)
    const statusCode = error.statusCode || 500;

    // Check if it's an API request
    if (request.url.startsWith("/api/")) {
      reply.code(statusCode).send({
        error: error.name || "Internal Server Error",
        message: error.message || "An unexpected error occurred",
        statusCode,
      });
      return;
    }

    // For HTML requests, return the 500 page
    try {
      const serverErrorPath = path.join(
        __dirname,
        "../../developer/pages/500.html"
      );
      if (fs.existsSync(serverErrorPath)) {
        let errorHtml = fs.readFileSync(serverErrorPath, "utf8");

        // In development mode, show error details
        if (ASSEMBLEJS.isLocal()) {
          // Show development-only sections
          errorHtml = errorHtml.replace(
            /class="dev-only"/g,
            'class="dev-only" style="display: block;"'
          );

          // Hide production message
          errorHtml = errorHtml.replace(
            /class="prod-message"/g,
            'class="prod-message" style="display: none;"'
          );

          // Inject error type
          errorHtml = errorHtml.replace(
            "<!-- Error type will be injected here -->",
            `${error.name || "Error"}`
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
          );

          // Inject error message
          errorHtml = errorHtml.replace(
            "<!-- Error message will be injected here -->",
            `${error.message || "An unknown error occurred"}`
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
          );

          // Inject stack trace
          errorHtml = errorHtml.replace(
            "<!-- Error stack will be injected here -->",
            `${error.stack || "No stack trace available"}`
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
          );

          // Inject request information
          errorHtml = errorHtml.replace(
            "<!-- Method will be injected here -->",
            request.method.replace(/</g, "&lt;").replace(/>/g, "&gt;")
          );

          errorHtml = errorHtml.replace(
            "<!-- URL will be injected here -->",
            request.url.replace(/</g, "&lt;").replace(/>/g, "&gt;")
          );

          errorHtml = errorHtml.replace(
            "<!-- IP will be injected here -->",
            (request.ip || "Unknown")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
          );
        }

        reply
          .code(statusCode)
          .header("Content-Type", "text/html")
          .send(errorHtml);
        return;
      }
    } catch (error) {
      blueprintApp.log.error("Error serving 500 page:", error);
    }

    // Fallback response if the HTML file can't be loaded
    reply
      .code(statusCode)
      .header("Content-Type", "text/html")
      .send("<h1>Server Error</h1><p>An unexpected error occurred.</p>");
  });

  // Turn off logging to ignore the first Fastify "Server Listening" message
  const defaultLogLevel = blueprintApp.log.level;
  blueprintApp.log.level = "silent";

  const PORT = httpServer
    ? (httpServer.address() as AddressInfo).port
    : baseOpts.port;

  // Start the App
  await blueprintApp
    .listen({
      port: PORT,
      host: baseOpts.host,
    })
    // Turn logging back on, this will keep Fastify from logging the misleading "http://0.0.0.0:3000" message
    .then(() => (blueprintApp.log.level = defaultLogLevel))
    // Now let's notify the user the server has started.
    .then(async () => {
      const baseAddress = `http://${
        ASSEMBLEJS.isLocal() ? "localhost" : baseOpts.host
      }:${PORT}`;

      // If running in dev, log a few more bits of information to the user
      logLocalInformation(blueprintApp, userOpts, baseAddress);

      // Without the development HTTP server, our pass through to the main server is not active and you will receive a 404
      blueprintApp.log.debug(
        `Development Http Server Started: ${httpServer !== undefined}`
      );
      if (httpServer === undefined) {
        blueprintApp.log.error("Development Http Server Not Found!");
        throw new Error(
          "Development Http Server Not Found! This is likely a module resolution issue. Please check your imports and restart your application."
        );
      }

      // Without the Vite dev server, Hot module reload and browser bundling will not operate properly.
      blueprintApp.log.debug(
        `Development HMR Server Started: ${devServer !== undefined}`
      );
      if (devServer === undefined) {
        blueprintApp.log.error("Development HMR Server Not Found!");
        throw new Error(
          "Development HMR Server Not Found! This is likely a module resolution issue. Please check your imports and restart your application."
        );
      }

      // If all is well, notify the user
      blueprintApp.log.info(`> Server Listening at: ${baseAddress}`);

      // Auto-open browser when in development mode
      if (ASSEMBLEJS.isLocal()) {
        try {
          // Use the open package to open the browser
          const open = (await import("open")).default;

          // Open the default browser to the base address
          await open(baseAddress);
          blueprintApp.log.info(`> Browser opened to: ${baseAddress}`);
        } catch (error) {
          blueprintApp.log.warn(
            `> Failed to open browser: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    })
    .catch((err) => {
      // If something went wrong, log using the server logger and exit gracefully
      blueprintApp.log.error({ err }, "Server failed to start");

      // Give time for logs to be flushed before exiting
      setTimeout(() => {
        // Exit with error code
        process.exit(1);
      }, 100);
    });

  // Return the Fastify Instance
  return blueprintApp;
}
