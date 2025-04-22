import { BlueprintController } from "../../../server/abstract/blueprint.controller";
import { ServiceContainer } from "../../../server/app/service-container";
import type { Service } from "../../../server/abstract/service";
import type { Assembly } from "../../../types/blueprint.simple.types";

// Mock ServiceContainer
jest.mock("../../../server/app/service-container", () => ({
  ServiceContainer: {
    getInstance: jest.fn().mockReturnValue({
      get: jest.fn(),
      has: jest.fn(),
    }),
  },
}));

// Mock logger to avoid chalk import issues
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

// Create concrete implementation to test abstract class
class TestController extends BlueprintController {
  // Expose protected methods for testing
  public testGetService<T extends Service>(token: string): T {
    return this.getService<T>(token);
  }

  public testHasService(token: string): boolean {
    return this.hasService(token);
  }

  // Implement abstract method
  register(app: Assembly): void {
    // Implementation for testing
  }
}

describe("BlueprintController", () => {
  let controller: TestController;
  let mockServiceContainer: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create test instance
    controller = new TestController();

    // Get mock service container instance
    mockServiceContainer = ServiceContainer.getInstance();
  });

  describe("getService", () => {
    it("should retrieve service from service container", () => {
      // Arrange
      const mockService = { name: "TestService" };
      mockServiceContainer.get.mockReturnValue(mockService);

      // Act
      const result = controller.testGetService("testService");

      // Assert
      expect(ServiceContainer.getInstance).toHaveBeenCalled();
      expect(mockServiceContainer.get).toHaveBeenCalledWith("testService");
      expect(result).toBe(mockService);
    });

    it("should return undefined when service is not found", () => {
      // Arrange
      mockServiceContainer.get.mockReturnValue(undefined);

      // Act
      const result = controller.testGetService("nonExistentService");

      // Assert
      expect(mockServiceContainer.get).toHaveBeenCalledWith(
        "nonExistentService"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("hasService", () => {
    it("should return true when service exists", () => {
      // Arrange
      mockServiceContainer.has.mockReturnValue(true);

      // Act
      const result = controller.testHasService("existingService");

      // Assert
      expect(ServiceContainer.getInstance).toHaveBeenCalled();
      expect(mockServiceContainer.has).toHaveBeenCalledWith("existingService");
      expect(result).toBe(true);
    });

    it("should return false when service does not exist", () => {
      // Arrange
      mockServiceContainer.has.mockReturnValue(false);

      // Act
      const result = controller.testHasService("nonExistentService");

      // Assert
      expect(mockServiceContainer.has).toHaveBeenCalledWith(
        "nonExistentService"
      );
      expect(result).toBe(false);
    });
  });

  // Since register is abstract and implementation-specific, we can't test it directly
});
