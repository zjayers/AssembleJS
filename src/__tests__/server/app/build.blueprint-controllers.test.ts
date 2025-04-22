import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { buildBlueprintControllers } from "../../../server/app/build.blueprint-controllers";
import { ASSEMBLEJS } from "../../../server/config/blueprint.config";
import { ManifestController } from "../../../server/controllers/manifest.controller";
import { ContentController } from "../../../server/controllers/content.controller";
import { HealthController } from "../../../server/controllers/health.controller";
import { HydrationController } from "../../../server/controllers/hydration.controller";
import { DeveloperController } from "../../../server/controllers/developer.controller";
import { assertFileExists } from "../../../utils/file.utils";
import path from "path";
import fs from "fs";
import fastifyStatic from "@fastify/static";

// Mock dependencies
jest.mock("../../../server/config/blueprint.config", () => ({
  ASSEMBLEJS: {
    root: "/mock/root",
    isLocal: jest.fn().mockReturnValue(true),
  },
}));

jest.mock("../../../constants/blueprint.constants", () => ({
  CONSTANTS: {
    buildOutputFolder: "dist",
  },
}));

jest.mock("path", () => ({
  join: jest
    .fn()
    .mockImplementation((...args) => args.join("/").replace(/\/+/g, "/")),
}));

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
}));

jest.mock("@fastify/static", () => jest.fn());

jest.mock("../../../utils/file.utils", () => ({
  assertFileExists: jest.fn(),
}));

// Mock controllers
jest.mock("../../../server/controllers/manifest.controller", () => ({
  ManifestController: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    constructor: { name: "ManifestController" },
  })),
}));

jest.mock("../../../server/controllers/content.controller", () => ({
  ContentController: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    constructor: { name: "ContentController" },
  })),
}));

jest.mock("../../../server/controllers/health.controller", () => ({
  HealthController: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    constructor: { name: "HealthController" },
  })),
}));

jest.mock("../../../server/controllers/hydration.controller", () => ({
  HydrationController: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    constructor: { name: "HydrationController" },
  })),
}));

jest.mock("../../../server/controllers/developer.controller", () => ({
  DeveloperController: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    constructor: { name: "DeveloperController" },
  })),
}));

describe("buildBlueprintControllers", () => {
  let mockApp: any;
  let mockUserOpts: any;
  let mockDevServer: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock app
    mockApp = {
      register: jest.fn(),
      log: {
        debug: jest.fn(),
      },
    };

    // Mock user options
    mockUserOpts = {
      manifest: {
        assetDirectoryRoots: [
          { path: "./assets", opts: { prefix: "/assets" } },
        ],
        components: [
          {
            path: "test-component",
            views: [
              {
                viewName: "desktop",
                templateFile: "desktop.view.ejs",
                exposeAsBlueprint: true,
              },
            ],
          },
        ],
        controllers: [function MockCustomController() {}],
      },
    };

    // Setup MockCustomController prototype
    mockUserOpts.manifest.controllers[0].prototype = {
      register: jest.fn(),
      constructor: { name: "MockCustomController" },
    };

    // Mock dev server
    mockDevServer = {
      middlewares: {
        use: jest.fn(),
      },
    };

    // Reset ASSEMBLEJS mock functions
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
  });

  it("should register asset directories from manifest", () => {
    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that static assets were registered
    expect(path.join).toHaveBeenCalledWith("/mock/root", "./assets");
    expect(mockApp.register).toHaveBeenCalledWith(fastifyStatic, {
      root: "/mock/root/./assets",
      decorateReply: false,
      prefix: "/assets",
    });
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Registering static assets")
    );
  });

  it("should register static paths for components and blueprints", () => {
    // Setup fs.existsSync to return true for blueprint path
    (fs.existsSync as jest.Mock)
      .mockReturnValueOnce(true) // First call for blueprint path check
      .mockReturnValueOnce(true); // Second call for static path check

    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that path.join was called for blueprint path
    expect(path.join).toHaveBeenCalledWith(
      expect.stringContaining("/mock/root"),
      "blueprints",
      "test-component",
      "desktop"
    );

    // Check that static path was registered
    expect(mockApp.register).toHaveBeenCalledWith(fastifyStatic, {
      root: expect.any(String),
      prefix: "/test-component/desktop/",
      decorateReply: false,
    });

    // Check that assertFileExists was called
    expect(assertFileExists).toHaveBeenCalled();
  });

  it("should fallback to component path if blueprint path does not exist", () => {
    // Setup fs.existsSync to return false for blueprint path, true for component path
    (fs.existsSync as jest.Mock)
      .mockReturnValueOnce(false) // First call for blueprint path check
      .mockReturnValueOnce(true) // Second call for component path check
      .mockReturnValueOnce(true); // Third call for static path check

    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that path.join was called for component path after blueprint path failed
    expect(path.join).toHaveBeenCalledWith(
      expect.stringContaining("/mock/root"),
      "components",
      "test-component",
      "desktop"
    );

    // Check that static path was registered with component path
    expect(mockApp.register).toHaveBeenCalledWith(fastifyStatic, {
      root: expect.any(String),
      prefix: "/test-component/desktop/",
      decorateReply: false,
    });
  });

  it("should handle case when neither blueprint nor component path exists", () => {
    // Setup fs.existsSync to return false for all paths
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that path.join was called for both paths
    expect(path.join).toHaveBeenCalledWith(
      expect.stringContaining("/mock/root"),
      "blueprints",
      "test-component",
      "desktop"
    );
    expect(path.join).toHaveBeenCalledWith(
      expect.stringContaining("/mock/root"),
      "components",
      "test-component",
      "desktop"
    );

    // Check that static path was not registered
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("No static path found")
    );
  });

  it("should register core controllers for each component view", () => {
    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that controllers were registered
    expect(HydrationController).toHaveBeenCalled();
    expect(HealthController).toHaveBeenCalled();
    expect(ManifestController).toHaveBeenCalled();
    expect(ContentController).toHaveBeenCalled();

    // Get the instances created
    const hydrationController = (HydrationController as jest.Mock).mock
      .results[0].value;
    const healthController = (HealthController as jest.Mock).mock.results[0]
      .value;
    const manifestController = (ManifestController as jest.Mock).mock.results[0]
      .value;
    const contentController = (ContentController as jest.Mock).mock.results[0]
      .value;

    // Check register methods were called
    expect(hydrationController.register).toHaveBeenCalledWith(
      mockApp,
      mockUserOpts,
      mockUserOpts.manifest.components[0],
      mockUserOpts.manifest.components[0].views[0]
    );

    expect(healthController.register).toHaveBeenCalledWith(
      mockApp,
      mockUserOpts,
      mockUserOpts.manifest.components[0],
      mockUserOpts.manifest.components[0].views[0]
    );

    expect(manifestController.register).toHaveBeenCalledWith(
      mockApp,
      mockUserOpts,
      mockUserOpts.manifest.components[0],
      mockUserOpts.manifest.components[0].views[0]
    );

    expect(contentController.register).toHaveBeenCalledWith(
      mockApp,
      mockUserOpts,
      mockUserOpts.manifest.components[0],
      mockUserOpts.manifest.components[0].views[0],
      mockDevServer
    );
  });

  it("should register custom controllers from manifest", () => {
    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that custom controller was instantiated and registered
    const mockController = new mockUserOpts.manifest.controllers[0]();
    expect(mockController.register).toHaveBeenCalledWith(mockApp);
  });

  it("should register the developer controller in development mode", () => {
    // Ensure isLocal returns true
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that developer controller was registered
    expect(DeveloperController).toHaveBeenCalled();
    const developerController = (DeveloperController as jest.Mock).mock
      .results[0].value;
    expect(developerController.register).toHaveBeenCalledWith(mockApp);

    // Check that debug log contains the controller names
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Controllers")
    );
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("DeveloperController")
    );
  });

  it("should not register the developer controller in production mode", () => {
    // Set isLocal to return false to simulate production
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(false);

    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that developer controller was not registered
    expect(DeveloperController).not.toHaveBeenCalled();
  });

  it("should handle empty controllers array in manifest", () => {
    // Create new user options with empty controllers array
    const userOptsWithoutControllers = {
      ...mockUserOpts,
      manifest: {
        ...mockUserOpts.manifest,
        controllers: undefined,
      },
    };

    // Should not throw error
    expect(() => {
      buildBlueprintControllers(
        mockApp,
        userOptsWithoutControllers,
        mockDevServer
      );
    }).not.toThrow();
  });

  it("should handle empty components array in manifest", () => {
    // Create new user options with empty components array
    const userOptsWithoutComponents = {
      ...mockUserOpts,
      manifest: {
        ...mockUserOpts.manifest,
        components: undefined,
      },
    };

    // Should not throw error
    expect(() => {
      buildBlueprintControllers(
        mockApp,
        userOptsWithoutComponents,
        mockDevServer
      );
    }).not.toThrow();
  });

  it("should attach the manifest to the app instance", () => {
    buildBlueprintControllers(mockApp, mockUserOpts, mockDevServer);

    // Check that manifest was attached to app
    expect(mockApp.manifest).toBe(mockUserOpts.manifest);
  });

  it("should handle component with custom root property", () => {
    // Create component with custom root
    const componentWithCustomRoot = {
      ...mockUserOpts.manifest.components[0],
      root: "custom-root",
    };

    const userOptsWithCustomRoot = {
      ...mockUserOpts,
      manifest: {
        ...mockUserOpts.manifest,
        components: [componentWithCustomRoot],
      },
    };

    buildBlueprintControllers(mockApp, userOptsWithCustomRoot, mockDevServer);

    // Check that path.join was called with custom root
    expect(path.join).toHaveBeenCalledWith(
      expect.anything(),
      "custom-root",
      "test-component",
      "desktop"
    );
  });
});
