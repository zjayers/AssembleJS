import { BlueprintClient } from "../../../browser/client/blueprint.client";
import {
  BlueprintClientRegistry,
  getAssembleJSClientRegistry,
} from "../../../browser/client/blueprint.client.registry";
import { CONSTANTS } from "../../../constants/blueprint.constants";
import { Blueprint } from "../../../browser/client/blueprint.view";
import type { BlueprintConstructor } from "../../../browser/client/blueprint.view";
import type { EMPTY_NODE_PARAMS } from "../../../types/component.context";
import type { AnyObject } from "../../../types/object.any";

// Mock dependencies
jest.mock("../../../browser/client/blueprint.client.registry", () => ({
  getAssembleJSClientRegistry: jest.fn(),
}));

// Mock Blueprint class to avoid full initialization
jest.mock("../../../browser/client/blueprint.view", () => {
  const mockBlueprint = jest.fn().mockImplementation((id) => ({
    id,
    _events: { subscribe: jest.fn(), publish: jest.fn() },
    _api: { get: jest.fn() },
    _root: document.createElement("div"),
    _context: {
      id,
      componentName: "test",
      viewName: "test",
      data: {},
      params: {},
      nestLevel: 0,
      renderAsBlueprint: false,
      deviceType: "DESKTOP",
      serverUrl: "http://localhost:3000",
      components: {},
      title: "Test",
    },
    onMount: jest.fn(),
  }));

  return {
    Blueprint: mockBlueprint,
  };
});

// Mock document Object since we're in Jest (a Node.js environment)
Object.defineProperty(global, "document", {
  value: {
    currentScript: {
      getAttribute: jest.fn(),
    },
    createElement: () => ({
      style: {},
      appendChild: jest.fn(),
      setAttribute: jest.fn(),
    }),
  },
  writable: true,
});

// Mock console methods to prevent noise during tests
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleError = console.error;

describe("BlueprintClient", () => {
  let mockRegistry: Partial<BlueprintClientRegistry>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Silence console outputs during tests
    console.log = jest.fn();
    console.info = jest.fn();
    console.error = jest.fn();

    // Reset loaded flag for each test
    (BlueprintClient as any)._loaded = false;

    // Setup mock registry
    mockRegistry = {
      components: {},
    };
    (getAssembleJSClientRegistry as jest.Mock).mockReturnValue(mockRegistry);
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.error = originalConsoleError;
  });

  describe("getBlueprintClientRegistry", () => {
    it("should return the global registry singleton", () => {
      // Act
      const result = BlueprintClient.getBlueprintClientRegistry();

      // Assert
      expect(getAssembleJSClientRegistry).toHaveBeenCalled();
      expect(result).toBe(mockRegistry);
    });
  });

  describe("registerComponentCodeBehind", () => {
    it("should register component with the registry", () => {
      // Arrange
      class TestComponent extends Blueprint<AnyObject, EMPTY_NODE_PARAMS> {}

      // Mock the DOM attribute
      document.currentScript!.getAttribute = jest
        .fn()
        .mockReturnValue("component-123");

      // Act
      BlueprintClient.registerComponentCodeBehind(
        TestComponent as BlueprintConstructor
      );

      // Assert
      expect(document.currentScript!.getAttribute).toHaveBeenCalledWith(
        CONSTANTS.componentDataIdentifier
      );
      expect(mockRegistry.components!["component-123"]).toBeDefined();
    });

    it("should print welcome banner only once", () => {
      // Arrange
      class TestComponent1 extends Blueprint<AnyObject, EMPTY_NODE_PARAMS> {}
      class TestComponent2 extends Blueprint<AnyObject, EMPTY_NODE_PARAMS> {}

      // Mock the DOM attribute for two different components
      document.currentScript!.getAttribute = jest
        .fn()
        .mockReturnValueOnce("component-1")
        .mockReturnValueOnce("component-2");

      // Act - Register two components
      BlueprintClient.registerComponentCodeBehind(
        TestComponent1 as BlueprintConstructor
      );
      BlueprintClient.registerComponentCodeBehind(
        TestComponent2 as BlueprintConstructor
      );

      // Assert - Banner should be printed only once
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith(
        "/ ~ %cWelcome to AssembleJS!%c ~",
        "color:default",
        "color:default"
      );
    });

    it("should log error when no component pointer is found", () => {
      // Arrange
      class TestComponent extends Blueprint<AnyObject, EMPTY_NODE_PARAMS> {}

      // Mock missing DOM attribute
      document.currentScript!.getAttribute = jest.fn().mockReturnValue(null);

      // Act
      BlueprintClient.registerComponentCodeBehind(
        TestComponent as BlueprintConstructor
      );

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        "Error: Unable to locate component data pointer!"
      );
      expect(mockRegistry.components).toEqual({});
    });
  });

  describe("printWelcomeBanner", () => {
    it("should log welcome messages to console", () => {
      // Directly invoke private method for testing
      (BlueprintClient as any).printWelcomeBanner();

      // Assert
      expect(console.log).toHaveBeenCalledWith(CONSTANTS.welcomeBanner);
      expect(console.info).toHaveBeenCalledWith(
        "/ ~ %cWelcome to AssembleJS!%c ~",
        "color:default",
        "color:default"
      );
      expect(console.info).toHaveBeenCalledWith(
        "\\ ~ Below you will find contextual information about registered components ~"
      );
      expect(console.info).toHaveBeenCalledWith(
        CONSTANTS.welcomeBannerConsoleSeparator
      );
    });
  });
});
