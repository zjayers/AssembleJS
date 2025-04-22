import { HealthController } from "../../../server/controllers/health.controller";
import type { Component } from "../../../types/component";
import type { Assembly } from "../../../types/blueprint.simple.types";
import type { BlueprintServerOptions } from "../../../types/blueprint.server.options";
import type { ComponentView } from "../../../types/component.view";

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

describe("HealthController", () => {
  // Setup test variables
  let controller: HealthController;
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
    };

    mockUserOpts = {};

    // Create a new instance for each test
    controller = new HealthController();
  });

  describe("register", () => {
    it("should register a GET route for health status", () => {
      // Act
      controller.register(
        mockApp as Assembly,
        mockUserOpts as BlueprintServerOptions,
        mockComponent as Component,
        mockView as ComponentView
      );

      // Assert
      expect(mockApp.get).toHaveBeenCalledWith(
        "/test-component/test-view/health-status/",
        expect.any(Function)
      );
    });

    it("should return status OK when health route is called", () => {
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
      expect(mockReply.send).toHaveBeenCalledWith({ status: "ok" });
    });
  });
});
