import {
  MemoryCache,
  CacheFactory,
  getGlobalCache,
  createNamespacedCache,
  createTypedCache,
  Cached,
} from "../../utils/cache.utils";

// Mock the logger function to avoid actual logging during tests
jest.mock("../../utils/logger.utils", () => ({
  logger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe("Cache Utilities", () => {
  describe("MemoryCache", () => {
    let cache: MemoryCache<string>;

    beforeEach(() => {
      cache = new MemoryCache<string>({ maxAge: 100 });
    });

    afterEach(() => {
      cache.dispose();
    });

    test("should store and retrieve values", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    test("should return undefined for non-existent keys", () => {
      expect(cache.get("nonexistent")).toBeUndefined();
    });

    test("should check if a key exists with has()", () => {
      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);
      expect(cache.has("nonexistent")).toBe(false);
    });

    test("should delete keys", () => {
      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);

      cache.delete("key1");
      expect(cache.has("key1")).toBe(false);
      expect(cache.get("key1")).toBeUndefined();
    });

    test("should clear all keys", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get("key1")).toBeUndefined();
      expect(cache.get("key2")).toBeUndefined();
    });

    test("should return all keys", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      const keys = cache.keys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
    });

    test("should expire items after maxAge", async () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");

      // Wait for the cache item to expire
      await new Promise((resolve) => setTimeout(resolve, 120));

      expect(cache.get("key1")).toBeUndefined();
      expect(cache.has("key1")).toBe(false);
    });

    test("should respect item-specific maxAge", async () => {
      cache.set("key1", "value1", { maxAge: 50 });
      cache.set("key2", "value2", { maxAge: 200 });

      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key2")).toBe("value2");

      // Wait for the first item to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(cache.get("key1")).toBeUndefined();
      expect(cache.get("key2")).toBe("value2");

      // Wait for the second item to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(cache.get("key2")).toBeUndefined();
    });

    test("should clean up expired items", async () => {
      cache.set("key1", "value1", { maxAge: 50 });
      cache.set("key2", "value2", { maxAge: 50 });

      // Wait for the items to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Items are still in the cache but marked as expired
      expect(cache.size()).toBe(2);

      // Manual cleanup
      cache.cleanup();

      // The expired items should be removed
      expect(cache.size()).toBe(0);
    });

    test("should stop cleanup timer", () => {
      const setIntervalSpy = jest.spyOn(global, "setInterval");
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      // Create a new cache with autoclean enabled
      const autoCleanCache = new MemoryCache<string>({
        autoclean: true,
        cleanupInterval: 100,
      });

      // Check that the timer was started
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);

      // Stop the timer
      autoCleanCache.stopCleanupTimer();

      // Check that the timer was cleared
      expect(clearIntervalSpy).toHaveBeenCalled();

      // Dispose the cache to clean up
      autoCleanCache.dispose();

      // Restore spies
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });

  describe("CacheFactory", () => {
    test("should create a memory cache", () => {
      const cache = CacheFactory.createMemoryCache<string>();
      expect(cache).toBeDefined();
      expect(cache).toHaveProperty("get");
      expect(cache).toHaveProperty("set");

      // Test the cache functionality
      cache.set("key", "value");
      expect(cache.get("key")).toBe("value");

      // Clean up
      (cache as MemoryCache<string>).dispose();
    });
  });

  describe("Global and Namespaced Caches", () => {
    beforeEach(() => {
      // Clear the global cache before each test
      getGlobalCache().clear();
    });

    test("getGlobalCache should return the same instance", () => {
      const cache1 = getGlobalCache();
      const cache2 = getGlobalCache();

      // Should be the same instance
      expect(cache1).toBe(cache2);

      // Should have the expected methods
      expect(cache1).toHaveProperty("get");
      expect(cache1).toHaveProperty("set");
    });

    test("createNamespacedCache should create a namespaced cache", () => {
      const cache1 = createNamespacedCache<string>("ns1");
      const cache2 = createNamespacedCache<number>("ns2");

      // Different namespaces should be isolated
      cache1.set("key", "value");
      cache2.set("key", 123);

      expect(cache1.get("key")).toBe("value");
      expect(cache2.get("key")).toBe(123);

      // The global cache should contain both keys with namespaces
      const globalCache = getGlobalCache();
      expect(globalCache.get("ns1:key")).toBe("value");
      expect(globalCache.get("ns2:key")).toBe(123);
    });

    test("namespaced cache should return correct keys", () => {
      const cache = createNamespacedCache<string>("test");
      const globalCache = getGlobalCache();

      // Add some keys in our namespace
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      // Add a key in a different namespace
      globalCache.set("other:key3", "value3");

      // Keys should only include our namespace
      const keys = cache.keys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
      expect(keys).not.toContain("other:key3");

      // Size should only count our namespace
      expect(cache.size()).toBe(2);
    });

    test("namespaced cache clear should only clear its namespace", () => {
      const cache1 = createNamespacedCache<string>("ns1");
      const cache2 = createNamespacedCache<string>("ns2");

      cache1.set("key1", "value1");
      cache2.set("key2", "value2");

      cache1.clear();

      // ns1 cache should be empty
      expect(cache1.size()).toBe(0);
      expect(cache1.get("key1")).toBeUndefined();

      // ns2 cache should still have its key
      expect(cache2.size()).toBe(1);
      expect(cache2.get("key2")).toBe("value2");
    });
  });

  describe("Typed Cache", () => {
    test("createTypedCache should create a typed wrapper", () => {
      const baseCache = CacheFactory.createMemoryCache<unknown>();
      const stringCache = createTypedCache<string>(baseCache);

      // Should be able to store and retrieve strings
      stringCache.set("key", "value");
      expect(stringCache.get("key")).toBe("value");

      // Clean up
      (baseCache as MemoryCache<unknown>).dispose();
    });
  });

  describe("Cache Decorator", () => {
    class TestClass {
      public callCount = 0;

      @Cached("test-cache")
      calculateSquare(n: number): number {
        this.callCount++;
        return n * n;
      }

      @Cached("test-cache", (...args: unknown[]) => `custom-${args[0]}`)
      calculateWithCustomKey(n: number): number {
        this.callCount++;
        return n * n;
      }

      @Cached("test-cache")
      async asyncCalculation(n: number): Promise<number> {
        this.callCount++;
        return Promise.resolve(n * n);
      }
    }

    let instance: TestClass;

    beforeEach(() => {
      // Clear the global cache before each test
      getGlobalCache().clear();
      instance = new TestClass();
    });

    test("should cache method results", () => {
      // First call - should execute the method
      expect(instance.calculateSquare(5)).toBe(25);
      expect(instance.callCount).toBe(1);

      // Second call with the same argument - should use cache
      expect(instance.calculateSquare(5)).toBe(25);
      expect(instance.callCount).toBe(1);

      // Call with different argument - should execute the method
      expect(instance.calculateSquare(10)).toBe(100);
      expect(instance.callCount).toBe(2);
    });

    test("should use custom key generator", () => {
      // First call - should execute the method
      expect(instance.calculateWithCustomKey(5)).toBe(25);
      expect(instance.callCount).toBe(1);

      // Second call with the same argument - should use cache
      expect(instance.calculateWithCustomKey(5)).toBe(25);
      expect(instance.callCount).toBe(1);

      // Should have used the custom key format
      const cache = createNamespacedCache<number>("test-cache");
      expect(cache.has("custom-5")).toBe(true);
    });

    test("should cache async method results", async () => {
      // First call - should execute the method
      expect(await instance.asyncCalculation(5)).toBe(25);
      expect(instance.callCount).toBe(1);

      // Second call with the same argument - should use cache
      expect(await instance.asyncCalculation(5)).toBe(25);
      expect(instance.callCount).toBe(1);
    });
  });
});
