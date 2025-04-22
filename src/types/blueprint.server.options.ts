import type { HookHandlerDoneFunction } from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { FastifyServerOptions } from "fastify";
// We're not using these specific imports directly
// import type { Server, IncomingMessage, ServerResponse } from "http";
// Remove unused import
// import type { AnyObject } from "./object.any";
import type { BlueprintServerManifest } from "./blueprint.server.manifest";
import type { ViteDevServer } from "vite";
// Using Node's http.Server instead of vavite's HttpServer
import type { Server as HttpServer } from "http";
import type { CacheConfig } from "../server/app/cache/cache.integration";

/**
 * BlueprintServer Authentication Configuration
 * @description Defines authentication settings for the AssembleJS server
 * @author Zach Ayers
 */
export interface BlueprintServerAuth {
  /**
   * Enable basic HTTP authentication
   * @default false
   */
  useBasicAuth?: boolean;

  /**
   * Basic auth username (overrides environment variable)
   */
  basicAuthUser?: string;

  /**
   * Basic auth password (overrides environment variable)
   */
  basicAuthPassword?: string;

  /**
   * Custom authentication method
   * Allows implementing JWT, OAuth, or other auth strategies
   * @param request - The FastifyRequest object
   * @param reply - The FastifyReply object
   * @param done - Callback to continue request processing
   */
  authenticate?: (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => void;

  /**
   * Routes that should be public (not require authentication)
   * @example ["/health", "/favicon.ico", "/public/*"]
   */
  publicRoutes?: string[];

  /**
   * Whether to use authentication in development mode
   * @default false
   */
  enableInDevelopment?: boolean;
}

/**
 * AssembleJS Server Dev Server
 * @description
 * @internal
 */
export type BlueprintDevServer = ViteDevServer | undefined;

/**
 * AssembleJS HTTP Hook
 * @description Allows hooking into the request pipeline
 * @internal
 */
// We utilize a tuple of key + function, so that only one "hook" per key is registered, making it more declarative.
export type BlueprintServerHook = [
  (
    | "onRequest"
    | "preParsing"
    | "preValidation"
    | "preHandler"
    | "preSerialization"
    | "onError"
    | "onSend"
    | "onResponse"
    | "onTimeout"
    | "onRoute"
    | "onRegister"
    | "onReady"
    | "onClose"
  ),
  (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => void
];

/**
 * AssembleJS Server Options
 * @description Options for creating an AssembleJS server
 * @author Zach Ayers
 */
export interface BlueprintServerOptions {
  /**
   * Manifest of the AssembleJS server
   * @description All Components, controllers, and other items
   * that will be loaded on to the server.
   */
  manifest: BlueprintServerManifest;

  /**
   * URL of the server root directory
   * @description Used to resolve relative paths
   * @example import.meta.url
   */
  serverRoot: string;

  /**
   * Host to bind the server to
   * @default "0.0.0.0"
   */
  host?: string;

  /**
   * Port to bind the server to
   * @default 3000
   */
  port?: number;

  /**
   * Authentication configuration
   */
  auth?: BlueprintServerAuth;

  /**
   * Hooks to register with the server
   * @description These can be used to add custom behavior
   * to the request lifecycle
   */
  hooks?: BlueprintServerHook[];

  /**
   * Advanced server options
   * @description Advanced configuration options for the server
   * See: https://www.fastify.io/docs/latest/Reference/Server/#factory
   */
  advanced?: Partial<FastifyServerOptions>;

  /**
   * HTTP server to use
   * @description Custom HTTP server for AssembleJS
   * @internal
   */
  httpServer?: HttpServer;

  /**
   * Vite dev server to use
   * @description Custom Vite dev server
   * @internal
   */
  devServer?: BlueprintDevServer;

  /**
   * Caching configuration
   * @description Configure caching behavior for the server
   */
  cache?: CacheConfig;
}
