import { ManifestController } from "../../../server/controllers/manifest.controller";
import type { Component } from "../../../types/component";
import type { Assembly } from "../../../types/blueprint.simple.types";
import type { BlueprintServerOptions } from "../../../types/blueprint.server.options";
import type { ComponentView } from "../../../types/component.view";
import * as objectUtils from "../../../utils/object.utils";

// Mock dependencies
jest.mock("../../../utils/object.utils", () => {
  return {
    omit: jest.fn((obj, ...keysToOmit) => {
      // Simple implementation of omit for testing
      const result = { ...obj };
      keysToOmit.forEach((key) => {
        delete result[key];
      });
      return result;
    }),
  };
});

// Mock logger.utils to avoid chalk import issues
jest.mock("../../../utils/logger.utils", () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  return {
    logger: jest.fn().mockReturnValue(mockLogger),
    ConsoleLogger: jest.fn().mockImplementation(() => mockLogger),
  };
});

describe("ManifestController", () => {
  // Setup test variables
  let controller: ManifestController;
  let mockApp: Partial<Assembly>;
  let mockRequest: any;
  let mockReply: any;
  let mockComponent: Partial<Component>;
  let mockView: Partial<ComponentView>;
  let mockUserOpts: Partial<BlueprintServerOptions>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a mock Fastify app
    mockReply = {
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockApp = {
      get: jest.fn().mockImplementation((path, handler) => {
        // Store the handler so we can call it in tests
        (mockApp as any).registeredHandler = handler;
        return mockApp;
      }),
    };

    // Create mock component and view
    mockComponent = {
      path: "test-component",
    };

    mockView = {
      viewName: "test-view",
      title: "Test View",
      template: "<div>Test Template</div>",
      factories: [
        {
          priority: 1,
          factory: jest.fn(),
        },
      ],
      developmentOptions: {
        contentWrapper: (content: string) =>
          `<div class="wrapper">${content}</div>`,
      },
    };

    mockUserOpts = {};

    // Create a new instance for each test
    controller = new ManifestController();
  });

  describe("register", () => {
    it("should register a GET route for manifest", () => {
      // Act
      controller.register(
        mockApp as Assembly,
        mockUserOpts as BlueprintServerOptions,
        mockComponent as Component,
        mockView as ComponentView
      );

      // Assert
      expect(mockApp.get).toHaveBeenCalledWith(
        "/test-component/test-view/manifest/",
        expect.any(Function)
      );
    });

    it("should return view object with sensitive fields omitted", () => {
      // Arrange
      controller.register(
        mockApp as Assembly,
        mockUserOpts as BlueprintServerOptions,
        mockComponent as Component,
        mockView as ComponentView
      );

      // Get the handler that was registered
      const handler = (mockApp as any).registeredHandler;

      // Act
      handler(mockRequest, mockReply);

      // Assert
      expect(objectUtils.omit).toHaveBeenCalledWith(
        mockView,
        "factories",
        "template",
        "developmentOptions"
      );

      expect(mockReply.type).toHaveBeenCalledWith("application/json");
      expect(mockReply.send).toHaveBeenCalled();
    });
  });
});
