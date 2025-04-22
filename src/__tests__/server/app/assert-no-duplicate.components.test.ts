import { describe, it, expect } from "@jest/globals";
import { assertNoDuplicateComponents } from "../../../server/app/assert-no-duplicate.components";

describe("assertNoDuplicateComponents", () => {
  it("should not throw an error for unique components", () => {
    const mockUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: [
          {
            path: "component-1",
            views: [{ viewName: "desktop" }, { viewName: "mobile" }],
          },
          {
            path: "component-2",
            views: [{ viewName: "desktop" }, { viewName: "tablet" }],
          },
        ],
      },
    };

    // Should not throw any errors
    expect(() => assertNoDuplicateComponents(mockUserOpts)).not.toThrow();
  });

  it("should throw an error for duplicate component paths", () => {
    const mockUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: [
          {
            path: "component-1",
            views: [{ viewName: "desktop" }],
          },
          {
            path: "component-1", // Duplicate path
            views: [{ viewName: "mobile" }],
          },
        ],
      },
    };

    // Should throw an error about duplicate component path
    expect(() => assertNoDuplicateComponents(mockUserOpts)).toThrow(
      "[ component-1 ] declared more than once in component manifest!"
    );
  });

  it("should throw an error for duplicate view names within the same component", () => {
    const mockUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: [
          {
            path: "component-1",
            views: [
              { viewName: "desktop" },
              { viewName: "desktop" }, // Duplicate view name
            ],
          },
        ],
      },
    };

    // Should throw an error about duplicate view name
    expect(() => assertNoDuplicateComponents(mockUserOpts)).toThrow(
      "[ component-1 -> desktop ] declared more than once in component manifest!"
    );
  });

  it("should handle components with the same view name but different component paths", () => {
    const mockUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: [
          {
            path: "component-1",
            views: [{ viewName: "desktop" }],
          },
          {
            path: "component-2",
            views: [
              { viewName: "desktop" }, // Same view name but different component path
            ],
          },
        ],
      },
    };

    // Should not throw any errors
    expect(() => assertNoDuplicateComponents(mockUserOpts)).not.toThrow();
  });

  it("should handle empty components array gracefully", () => {
    const mockUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: [],
      },
    };

    // Should not throw any errors
    expect(() => assertNoDuplicateComponents(mockUserOpts)).not.toThrow();
  });

  it("should handle undefined components gracefully", () => {
    const mockUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: undefined,
      },
    };

    // Should not throw any errors
    expect(() => assertNoDuplicateComponents(mockUserOpts)).not.toThrow();
  });

  it("should handle complex component hierarchies correctly", () => {
    const mockUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: [
          {
            path: "component-1",
            views: [
              { viewName: "desktop" },
              { viewName: "mobile" },
              { viewName: "tablet" },
            ],
          },
          {
            path: "component-2",
            views: [{ viewName: "desktop" }, { viewName: "mobile" }],
          },
          {
            path: "component-3",
            views: [{ viewName: "desktop" }],
          },
        ],
      },
    };

    // Should not throw any errors
    expect(() => assertNoDuplicateComponents(mockUserOpts)).not.toThrow();
  });
});
