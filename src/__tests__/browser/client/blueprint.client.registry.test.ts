import {
  getAssembleJSClientRegistry,
  BlueprintClientRegistry,
} from "../../../browser/client/blueprint.client.registry";
import * as getWindowModule from "../../../browser/common/get.window";

jest.mock("../../../browser/common/get.window");

describe("blueprint.client.registry", () => {
  // Test fixtures
  let mockWindow: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock window
    mockWindow = {};
    (getWindowModule.getWindow as jest.Mock).mockReturnValue(mockWindow);
  });

  describe("getAssembleJSClientRegistry", () => {
    it("should create a new registry if one does not exist on the window", () => {
      // Act
      const result = getAssembleJSClientRegistry();

      // Assert
      expect(getWindowModule.getWindow).toHaveBeenCalled();
      expect(result).toEqual({ components: {} });

      // Should be stored on the window
      expect(mockWindow.ASSEMBLEJS_CLIENT_REGISTRY).toBe(result);
    });

    it("should return the existing registry if one exists on the window", () => {
      // Arrange
      const existingRegistry: BlueprintClientRegistry = {
        components: {
          "test-component": { id: "test-component" } as any,
        },
      };
      mockWindow.ASSEMBLEJS_CLIENT_REGISTRY = existingRegistry;

      // Act
      const result = getAssembleJSClientRegistry();

      // Assert
      expect(getWindowModule.getWindow).toHaveBeenCalled();
      expect(result).toBe(existingRegistry);
    });

    it("should handle errors from getWindow by propagating them", () => {
      // Arrange
      const error = new Error("Unable to locate global object!");
      (getWindowModule.getWindow as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => getAssembleJSClientRegistry()).toThrow(error);
    });
  });
});
