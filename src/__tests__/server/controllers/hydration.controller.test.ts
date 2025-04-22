import { HydrationController } from "../../../server/controllers/hydration.controller";
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

describe("HydrationController", () => {
  // Setup test variables
  let controller: HydrationController;
  let mockApp: Partial<Assembly> & { inject: jest.Mock };
  let mockRequest: any;
  let mockReply: any;
  let mockComponent: Partial<Component>;
  let mockView: Partial<ComponentView>;
  let mockUserOpts: Partial<BlueprintServerOptions>;
  let mockInjectResponse: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock inject chain
    mockInjectResponse = {
      get: jest.fn().mockReturnThis(),
      payload: '{"data": "hydrated content"}',
    };

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
      inject: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue(mockInjectResponse),
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
    controller = new HydrationController();
  });

  describe("register", () => {
    it("should register a GET route for data hydration", () => {
      // Act
      controller.register(
        mockApp as Assembly,
        mockUserOpts as BlueprintServerOptions,
        mockComponent as Component,
        mockView as ComponentView
      );

      // Assert
      expect(mockApp.get).toHaveBeenCalledWith(
        "/test-component/test-view/data/",
        expect.any(Function)
      );
    });

    it("should inject a request to the content route with DATA_ONLY parameter", async () => {
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
      await handler(mockRequest, mockReply);

      // Assert
      expect(mockApp.inject).toHaveBeenCalled();
      const mockGet = mockApp.inject().get;
      expect(mockGet).toHaveBeenCalledWith(
        "/test-component/test-view/?DATA_ONLY=true"
      );
      expect(mockReply.send).toHaveBeenCalledWith(mockInjectResponse.payload);
    });
  });
});
