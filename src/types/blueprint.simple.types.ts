import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RequestPayload,
  RouteOptions,
} from "fastify";
import type { ICache } from "../utils/cache.utils";
import type { Component } from "./component";
import type { BlueprintController } from "../server/abstract/blueprint.controller";
import type { ServiceContainer } from "../server/app/service-container";
import type { BlueprintServerManifest } from "./blueprint.server.manifest";

/**
 * AssembleJS Cache Interface
 * @description Interface for server-side caching
 * @author Zach Ayers
 */
export interface BlueprintCaches {
  /** Component cache */
  component: ICache<Component>;

  /** Controller cache */
  controller: ICache<BlueprintController>;

  /** Rendered view cache */
  renderedView: ICache<string>;

  /** API response cache */
  api: ICache<unknown>;

  /** Clear all caches */
  clearAll: () => void;
}

/**
 * AssembleJS wrapper around the generic Fastify instance
 * @public
 * @category (Server)
 * @author Zach Ayers
 */
export interface Assembly extends FastifyInstance {
  /** Cache interfaces for this assembly instance */
  caches?: BlueprintCaches;

  /** Service container for dependency injection */
  serviceContainer: ServiceContainer;

  /** Server manifest containing registered components, blueprints, controllers, etc. */
  manifest?: BlueprintServerManifest;
}

// Keeping BlueprintInstance as an alias for backward compatibility
export interface BlueprintInstance extends Assembly {}

export type ApiRequest = FastifyRequest;
export type ApiReply = FastifyReply;
export type ApiError = FastifyError;
export type ApiPayload = RequestPayload;
export type ApiRouteOptions = RouteOptions;
