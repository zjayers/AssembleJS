import type { FastifyInstance } from "fastify";
import { CONSTANTS } from "../../../constants/blueprint.constants";
import {
  createHttpCacheMiddleware,
  createNamespacedCache,
} from "../../../utils/cache.utils";
import { logger } from "../../../utils/logger.utils";
import type { Component } from "../../../types/component";
import type { BlueprintController } from "../../abstract/blueprint.controller";

// Cache namespaces
const CACHE_NAMESPACES = {
  COMPONENT: "component",
  CONTROLLER: "controller",
  RENDERED_VIEW: "rendered_view",
  BLUEPRINT: "blueprint",
  API: "api",
};

// Logger for cache operations
const log = logger(`${CONSTANTS.defaultLoggerClassName}:cache-integration`);

/**
 * Cache configuration options
 */
export interface CacheConfig {
  enableHttpCache?: boolean;
  httpCacheTtl?: number;
  cacheComponents?: boolean;
  cacheControllers?: boolean;
  cacheRenderedViews?: boolean;
  [key: string]: any; // Allow additional properties
}

/**
 * Set up caching for the blueprint server
 * @param {FastifyInstance} server Fastify server instance
 * @param {CacheConfig} options Caching options
 */
export function setupServerCaching(
  server: FastifyInstance,
  options: CacheConfig = {}
) {
  const {
    enableHttpCache = true,
    httpCacheTtl = 30000, // 30 seconds default
    cacheComponents = true,
    cacheControllers = true,
    cacheRenderedViews = true,
  } = options;

  log.info("Setting up caching system");

  // Add HTTP response caching middleware if enabled
  if (enableHttpCache) {
    log.info("HTTP response caching enabled with TTL:", httpCacheTtl, "ms");
    server.addHook(
      "onRequest",
      createHttpCacheMiddleware({
        maxAge: httpCacheTtl,
        autoclean: true,
      })
    );
  }

  // Create various cache instances
  const componentCache = createNamespacedCache<Component>(
    CACHE_NAMESPACES.COMPONENT
  );
  const controllerCache = createNamespacedCache<BlueprintController>(
    CACHE_NAMESPACES.CONTROLLER
  );
  const renderedViewCache = createNamespacedCache<string>(
    CACHE_NAMESPACES.RENDERED_VIEW
  );
  const apiCache = createNamespacedCache<unknown>(CACHE_NAMESPACES.API);

  // Add the caches to the server instance for use throughout the application
  server.decorate("caches", {
    component: componentCache,
    controller: controllerCache,
    renderedView: renderedViewCache,
    api: apiCache,
    clearAll: () => {
      componentCache.clear();
      controllerCache.clear();
      renderedViewCache.clear();
      apiCache.clear();
      log.info("All caches cleared");
    },
  });

  // Set up hooks to automatically clear caches when needed
  if (cacheComponents || cacheControllers || cacheRenderedViews) {
    // Clear relevant caches when server closes
    server.addHook("onClose", (instance, done) => {
      // Use type assertion to access the caches property
      const blueprintInstance = instance as unknown as {
        caches?: { clearAll: () => void };
      };
      if (blueprintInstance.caches) {
        blueprintInstance.caches.clearAll();
      }
      done();
    });
  }

  log.info("Caching system setup complete");
}

/**
 * The cache configuration type for server options
 */
export interface CacheConfig {
  /**
   * Whether to enable HTTP response caching
   */
  enableHttpCache?: boolean;

  /**
   * Time-to-live for HTTP cache entries in milliseconds
   */
  httpCacheTtl?: number;

  /**
   * Whether to cache component instances
   */
  cacheComponents?: boolean;

  /**
   * Whether to cache controller instances
   */
  cacheControllers?: boolean;

  /**
   * Whether to cache rendered views
   */
  cacheRenderedViews?: boolean;
}

// Export the namespaces for use elsewhere
export { CACHE_NAMESPACES };
