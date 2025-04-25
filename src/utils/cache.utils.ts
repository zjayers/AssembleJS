/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
import { CONSTANTS } from "../constants/blueprint.constants";
import { logger } from "./logger.utils";

interface CacheOptions {
  /**
   * Maximum age of cached items in milliseconds
   * Default: 5 minutes (300000ms)
   */
  maxAge?: number;

  /**
   * Whether to automatically clean expired items periodically
   * Default: true
   */
  autoclean?: boolean;

  /**
   * Interval for auto-cleaning in milliseconds
   * Default: 60 seconds (60000ms)
   */
  cleanupInterval?: number;
}

interface CacheItem<T> {
  value: T;
  expires: number;
}

export interface ICache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, options?: { maxAge?: number }): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): string[];
}

/**
 * In-memory cache implementation with expiration
 * @author Zachariah Ayers
 * @category (Utils)
 * @public
 */
export class MemoryCache<T> implements ICache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private options: Required<CacheOptions>;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly log = logger(`${CONSTANTS.defaultLoggerClassName}:cache`);

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxAge: options.maxAge ?? 300000, // 5 minutes default
      autoclean: options.autoclean ?? true,
      cleanupInterval: options.cleanupInterval ?? 60000, // 1 minute default
    };

    if (this.options.autoclean) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {T | undefined} The cached value or undefined if not found or expired
   * @public
   * @author Zachariah Ayers
   */
  public get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    // Check if the item has expired
    if (Date.now() > item.expires) {
      this.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {T} value - Value to cache
   * @param {object} [options] - Optional cache options for this item
   * @param {number} [options.maxAge] - Custom TTL for this item in milliseconds
   * @returns {void}
   * @public
   * @author Zachariah Ayers
   */
  public set(key: string, value: T, options?: { maxAge?: number }): void {
    const maxAge = options?.maxAge ?? this.options.maxAge;
    const expires = Date.now() + maxAge;

    this.cache.set(key, { value, expires });
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if the key exists and is not expired
   * @public
   * @author Zachariah Ayers
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    if (Date.now() > item.expires) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if the key was deleted, false if it didn't exist
   * @public
   * @author Zachariah Ayers
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   * @returns {void}
   * @public
   * @author Zachariah Ayers
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   * @returns {number} Number of items in the cache
   * @public
   * @author Zachariah Ayers
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache
   * @returns {string[]} Array of cache keys
   * @public
   * @author Zachariah Ayers
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Start the automatic cleanup timer
   * @returns {void}
   * @private
   * @author Zachariah Ayers
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  /**
   * Stop the automatic cleanup timer
   * @returns {void}
   * @public
   * @author Zachariah Ayers
   */
  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Clean up expired items from the cache
   * @returns {void}
   * @public
   * @author Zachariah Ayers
   */
  public cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.log.debug(`Cleaned up ${expiredCount} expired cache items`);
    }
  }

  /**
   * Free resources used by the cache
   * @returns {void}
   * @public
   * @author Zachariah Ayers
   */
  public dispose(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

// Redis cache adapter implementation would go here
// export class RedisCache<T> implements ICache<T> { ... }

/**
 * Factory for creating cache instances
 * @author Zachariah Ayers
 * @category (Utils)
 * @public
 */
export class CacheFactory {
  /**
   * Create an in-memory cache
   * @template T - The type of values stored in the cache
   * @param {CacheOptions} [options] - Cache options
   * @returns {ICache<T>} A new memory cache instance
   * @static
   * @public
   * @author Zachariah Ayers
   */
  public static createMemoryCache<T>(options?: CacheOptions): ICache<T> {
    return new MemoryCache<T>(options);
  }

  // Factory method for Redis cache would go here
  // public static createRedisCache<T>(options?: RedisCacheOptions): ICache<T> { ... }
}

// Global cache singleton for application-wide caching
const globalCache = CacheFactory.createMemoryCache();

/**
 * Get the global cache instance
 * @template T - The type of values to be stored in the cache
 * @returns {ICache<T>} The global cache instance
 * @author Zachariah Ayers
 * @category (Utils)
 * @public
 */
export function getGlobalCache<T>(): ICache<T> {
  return globalCache as unknown as ICache<T>;
}

/**
 * Create a namespace-specific cache instance from the global cache
 * This allows for better organization and prevents key collisions
 * @template T - The type of values to be stored in the cache
 * @param {string} namespace - The namespace for this cache
 * @returns {ICache<T>} A namespaced cache API
 * @author Zachariah Ayers
 * @category (Utils)
 * @public
 */
export function createNamespacedCache<T>(namespace: string): ICache<T> {
  return {
    get(key: string): T | undefined {
      const value = globalCache.get(`${namespace}:${key}`);
      return value as T | undefined;
    },
    set(key: string, value: T, options?: { maxAge?: number }): void {
      globalCache.set(`${namespace}:${key}`, value, options);
    },
    has(key: string): boolean {
      return globalCache.has(`${namespace}:${key}`);
    },
    delete(key: string): boolean {
      return globalCache.delete(`${namespace}:${key}`);
    },
    clear(): void {
      // Only clear keys in our namespace
      const allKeys = globalCache.keys();
      const namespacePrefix = `${namespace}:`;

      for (const key of allKeys) {
        if (key.startsWith(namespacePrefix)) {
          globalCache.delete(key);
        }
      }
    },
    size(): number {
      const allKeys = globalCache.keys();
      const namespacePrefix = `${namespace}:`;

      return allKeys.filter((key) => key.startsWith(namespacePrefix)).length;
    },
    keys(): string[] {
      const allKeys = globalCache.keys();
      const namespacePrefix = `${namespace}:`;

      return allKeys
        .filter((key) => key.startsWith(namespacePrefix))
        .map((key) => key.slice(namespacePrefix.length));
    },
  };
}

/**
 * Create a typed wrapper around a cache for specific data types
 * @template T - The type to cast the cache values to
 * @param {ICache<unknown>} cache - The cache instance to wrap
 * @returns {ICache<T>} Typed cache API
 * @author Zachariah Ayers
 * @category (Utils)
 * @public
 */
export function createTypedCache<T>(cache: ICache<unknown>): ICache<T> {
  return cache as unknown as ICache<T>;
}

/**
 * Cache decorator for class methods
 * @param {string} cacheNamespace - The namespace for the cache
 * @param {(...args: unknown[]) => string} [keyGenerator] - Function to generate cache keys from method arguments
 * @param {object} [options] - Cache options
 * @param {number} [options.maxAge] - TTL for cached items in milliseconds
 * @returns {MethodDecorator} The method decorator
 * @author Zachariah Ayers
 * @category (Utils)
 * @public
 */
export function Cached(
  cacheNamespace: string,
  keyGenerator?: (...args: unknown[]) => string,
  options?: { maxAge?: number }
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = createNamespacedCache<unknown>(cacheNamespace);

    descriptor.value = function (...args: unknown[]) {
      const key = keyGenerator
        ? keyGenerator(...args)
        : `${propertyKey}:${JSON.stringify(args)}`;

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = originalMethod.apply(this, args);

      // Handle promises
      if (result instanceof Promise) {
        return result.then((value) => {
          cache.set(key, value, options);
          return value;
        });
      }

      cache.set(key, result, options);
      return result;
    };

    return descriptor;
  };
}

/**
 * HTTP response cache middleware
 * This can be attached to Fastify routes to cache responses
 * @param {CacheOptions} [options] - Cache options
 * @returns {Function} Middleware function for Fastify
 * @author Zachariah Ayers
 * @category (Utils)
 * @public
 */
export function createHttpCacheMiddleware(options?: CacheOptions) {
  const cache = CacheFactory.createMemoryCache<{
    statusCode: number;
    body: unknown;
    headers: Record<string, string>;
  }>(options);

  return function httpCacheMiddleware(
    request: any,
    reply: any,
    next: () => void
  ) {
    const cacheKey = `${request.method}:${request.url}`;

    if (cache.has(cacheKey)) {
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse) {
        // Add cache headers
        reply.header("X-Cache", "HIT");

        // Add the original headers
        Object.entries(cachedResponse.headers).forEach(([key, value]) => {
          reply.header(key, value);
        });

        reply.code(cachedResponse.statusCode).send(cachedResponse.body);
        return;
      }
    }

    // Store the original send function
    const originalSend = reply.send;

    // Override the send function to cache the response
    reply.send = function (payload: unknown) {
      // Only cache successful responses
      if (reply.statusCode >= 200 && reply.statusCode < 400) {
        cache.set(cacheKey, {
          statusCode: reply.statusCode,
          body: payload,
          headers: reply.getHeaders(),
        });
      }

      reply.header("X-Cache", "MISS");

      // Call the original send function
      return originalSend.call(reply, payload);
    };

    next();
  };
}
