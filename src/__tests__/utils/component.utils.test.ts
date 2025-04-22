import {
  addToHydration,
  safeFetch,
  isStaticAsset,
  getComponentCache,
} from "../../utils/component.utils";
import { HttpError } from "../../utils/http.utils";
import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";

// Mock dependencies
jest.mock("../../utils/cache.utils", () => ({
  createNamespacedCache: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    has: jest.fn(),
  })),
}));

// Mock logger to avoid chalk import issues
jest.mock("../../utils/logger.utils", () => ({
  logger: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe("component.utils", () => {
  describe("addToHydration", () => {
    it("should add data to the context.data object", () => {
      const context = {
        data: {},
        componentName: "test-component",
        viewName: "test-view",
      } as ComponentContext<any, ComponentParams>;

      const result = addToHydration(context, "testKey", "testValue");

      expect(result).toEqual({ testKey: "testValue" });
      expect(context.data).toEqual({ testKey: "testValue" });
    });

    it("should throw error when trying to overwrite existing key without overwrite flag", () => {
      const context = {
        data: { testKey: "existingValue" },
        componentName: "test-component",
        viewName: "test-view",
      } as ComponentContext<any, ComponentParams>;

      expect(() => {
        addToHydration(context, "testKey", "newValue");
      }).toThrow("testKey is already set in the context.data.");

      // Data should remain unchanged
      expect(context.data).toEqual({ testKey: "existingValue" });
    });

    it("should overwrite existing key when overwrite flag is true", () => {
      const context = {
        data: { testKey: "existingValue" },
        componentName: "test-component",
        viewName: "test-view",
      } as ComponentContext<any, ComponentParams>;

      const result = addToHydration(context, "testKey", "newValue", true);

      expect(result).toEqual({ testKey: "newValue" });
      expect(context.data).toEqual({ testKey: "newValue" });
    });

    it("should handle complex data types", () => {
      const context = {
        data: {},
        componentName: "test-component",
        viewName: "test-view",
      } as ComponentContext<any, ComponentParams>;

      const complexValue = {
        nested: {
          array: [1, 2, 3],
          value: true,
        },
      };

      const result = addToHydration(context, "complex", complexValue);

      expect(result).toEqual({ complex: complexValue });
      expect(context.data).toEqual({ complex: complexValue });
    });
  });

  describe("safeFetch", () => {
    it("should return data for successful fetch", async () => {
      const mockData = { success: true };
      const fetchFn = jest.fn().mockResolvedValue(mockData);

      const result = await safeFetch(fetchFn);

      expect(result).toBe(mockData);
      expect(fetchFn).toHaveBeenCalled();
    });

    it("should handle error with response from API", async () => {
      const axiosError = {
        response: {
          status: 404,
          data: { message: "Resource not found" },
        },
        config: {
          url: "/api/resource/123",
        },
      };

      const fetchFn = jest.fn().mockRejectedValue(axiosError);

      try {
        await safeFetch(fetchFn, "Failed to get resource");
        fail("Should have thrown error");
      } catch (error) {
        const httpError = error as HttpError;
        expect(httpError).toBeInstanceOf(HttpError);
        expect(httpError.statusCode).toBe(404);
        expect(httpError.message).toBe("Failed to get resource");
        expect(httpError.details).toEqual({
          details: { message: "Resource not found" },
          url: "/api/resource/123",
        });
      }
    });

    it("should handle error with request but no response", async () => {
      const axiosError = {
        request: {},
        config: {
          url: "/api/timeout",
        },
      };

      const fetchFn = jest.fn().mockRejectedValue(axiosError);

      try {
        await safeFetch(fetchFn);
        fail("Should have thrown error");
      } catch (error) {
        const httpError = error as HttpError;
        expect(httpError).toBeInstanceOf(HttpError);
        expect(httpError.statusCode).toBe(408); // Request timeout
        expect(httpError.message).toBe(
          "Request timed out or no response received"
        );
        expect(httpError.details).toEqual({
          url: "/api/timeout",
        });
      }
    });

    it("should handle generic errors", async () => {
      const genericError = {
        message: "Network error",
        stack: "Error stack trace",
      };

      const fetchFn = jest.fn().mockRejectedValue(genericError);

      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      try {
        await safeFetch(fetchFn, "Data fetch failed");
        fail("Should have thrown error");
      } catch (error) {
        const httpError = error as HttpError;
        expect(httpError).toBeInstanceOf(HttpError);
        expect(httpError.statusCode).toBe(500);
        expect(httpError.message).toBe("Data fetch failed");
        expect(httpError.details).toEqual({
          message: "Network error",
          stack: "Error stack trace",
        });
      }

      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should not include stack trace in production", async () => {
      const genericError = {
        message: "Network error",
        stack: "Error stack trace",
      };

      const fetchFn = jest.fn().mockRejectedValue(genericError);

      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        await safeFetch(fetchFn);
        fail("Should have thrown error");
      } catch (error) {
        const httpError = error as HttpError;
        expect(httpError).toBeInstanceOf(HttpError);
        expect(httpError.details).toEqual({
          message: "Network error",
          stack: undefined, // Stack should be undefined in production
        });
      }

      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe("isStaticAsset", () => {
    it("should identify JavaScript files as static assets", () => {
      expect(isStaticAsset("/assets/script.js")).toBe(true);
      expect(isStaticAsset("https://example.com/bundle.js")).toBe(true);
    });

    it("should identify CSS files as static assets", () => {
      expect(isStaticAsset("/styles/main.css")).toBe(true);
      expect(isStaticAsset("https://example.com/styles.css")).toBe(true);
    });

    it("should identify image files as static assets", () => {
      expect(isStaticAsset("/images/logo.png")).toBe(true);
      expect(isStaticAsset("/assets/banner.jpg")).toBe(true);
      expect(isStaticAsset("/assets/icon.svg")).toBe(true);
      expect(isStaticAsset("/favicon.ico")).toBe(true);
    });

    it("should identify font files as static assets", () => {
      expect(isStaticAsset("/fonts/roboto.woff")).toBe(true);
      expect(isStaticAsset("/fonts/opensans.woff2")).toBe(true);
      expect(isStaticAsset("/fonts/material.ttf")).toBe(true);
      expect(isStaticAsset("/fonts/legacy.eot")).toBe(true);
    });

    it("should not identify non-static asset URLs", () => {
      expect(isStaticAsset("/api/data")).toBe(false);
      expect(isStaticAsset("/components/user-profile")).toBe(false);
      expect(isStaticAsset("/blueprints/dashboard")).toBe(false);
      expect(isStaticAsset("/about")).toBe(false);
    });

    it("should handle static extensions correctly", () => {
      // The implementation checks for exact extension endings,
      // not including query params or fragments
      expect(isStaticAsset("/script.js")).toBe(true);
      expect(isStaticAsset("/styles.css")).toBe(true);
      expect(isStaticAsset("/api/data.json")).toBe(false);
    });
  });

  describe("getComponentCache", () => {
    it("should create a namespaced cache for the component", () => {
      const { createNamespacedCache } = require("../../utils/cache.utils");

      const cache = getComponentCache("test-component-123");

      expect(createNamespacedCache).toHaveBeenCalledWith(
        "component:test-component-123"
      );
      expect(cache).toBeDefined();
      expect(typeof cache.get).toBe("function");
      expect(typeof cache.set).toBe("function");
      expect(typeof cache.delete).toBe("function");
      expect(typeof cache.clear).toBe("function");
    });

    it("should use different namespaces for different components", () => {
      const { createNamespacedCache } = require("../../utils/cache.utils");

      // Clear mock call history
      (createNamespacedCache as jest.Mock).mockClear();

      getComponentCache("component-1");
      getComponentCache("component-2");

      // Verify the correct namespaces were used
      expect(createNamespacedCache).toHaveBeenCalledTimes(2);
      expect(createNamespacedCache).toHaveBeenNthCalledWith(
        1,
        "component:component-1"
      );
      expect(createNamespacedCache).toHaveBeenNthCalledWith(
        2,
        "component:component-2"
      );
    });
  });
});
