import { getEnv } from "../../utils/env.utils";

describe("env.utils", () => {
  describe("getEnv", () => {
    // Store original variables for cleanup
    const originalGlobalImport = (global as any).import;
    const originalProcessEnv = process.env;
    const originalWindow = (global as any).window;

    // Mock environment variables
    beforeEach(() => {
      // Create mock for import.meta.env in global
      (global as any).import = {
        meta: {
          env: {
            NODE_ENV: "test",
            ASSEMBLEJS_TEST: "test-value",
            VITE_SOME_VAR: "vite-value",
          },
        },
      };

      // Reset process.env
      process.env = {
        NODE_ENV: "test-process",
        ASSEMBLEJS_PROCESS: "process-value",
      };

      // Create mock for browser environment
      (global as any).window = {
        __ENV__: {
          NODE_ENV: "test-browser",
          ASSEMBLEJS_BROWSER: "browser-value",
        },
      };
    });

    // Restore original values
    afterEach(() => {
      (global as any).import = originalGlobalImport;
      process.env = originalProcessEnv;
      (global as any).window = originalWindow;
    });

    it("should return value from process.env when available", () => {
      // Simulate server environment
      (global as any).window = undefined;

      expect(getEnv("NODE_ENV")).toBe("test-process");
      expect(getEnv("ASSEMBLEJS_PROCESS")).toBe("process-value");
    });

    it("should return value from window.__ENV__ in browser environment", () => {
      // Mock process.env as undefined to simulate browser
      process.env = undefined as any;
      (global as any).import = undefined;

      expect(getEnv("NODE_ENV")).toBe("test-browser");
      expect(getEnv("ASSEMBLEJS_BROWSER")).toBe("browser-value");
    });

    it("should return value from import.meta.env as fallback", () => {
      // Make process.env and window.__ENV__ unavailable
      process.env = undefined as any;
      (global as any).window = undefined;

      expect(getEnv("NODE_ENV")).toBe("test");
      expect(getEnv("ASSEMBLEJS_TEST")).toBe("test-value");
      expect(getEnv("VITE_SOME_VAR")).toBe("vite-value");
    });

    it("should return undefined for non-existent env vars", () => {
      expect(getEnv("DOES_NOT_EXIST")).toBeUndefined();
    });

    it("should handle errors accessing environment variables", () => {
      // Create scenario where accessing env throws
      Object.defineProperty((global as any).import.meta, "env", {
        get: () => {
          throw new Error("Not available");
        },
      });

      // Also make process.env and window inaccessible
      process.env = undefined as any;
      (global as any).window = undefined;

      // Should return undefined when access throws
      expect(getEnv("ANY_VAR")).toBeUndefined();
    });
  });
});
