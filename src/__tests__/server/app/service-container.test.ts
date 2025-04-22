import { ServiceContainer } from "../../../server/app/service-container";
import { Service } from "../../../server/abstract/service";

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

// Create mock service classes for testing
class MockService extends Service {
  public override async initialize(): Promise<void> {
    return Promise.resolve();
  }
}

class AnotherMockService extends Service {
  public override async initialize(): Promise<void> {
    return Promise.resolve();
  }
}

describe("ServiceContainer", () => {
  beforeEach(() => {
    // Reset the container between tests to ensure isolation
    // This is necessary because ServiceContainer is a singleton
    (ServiceContainer as any)._instance = null;
  });

  describe("getInstance", () => {
    it("should return the singleton instance", () => {
      // Act
      const instance1 = ServiceContainer.getInstance();
      const instance2 = ServiceContainer.getInstance();

      // Assert
      expect(instance1).toBeDefined();
      expect(instance1).toBe(instance2); // Same instance (singleton pattern)
    });
  });

  describe("register", () => {
    it("should register a service with a token", () => {
      // Arrange
      const container = ServiceContainer.getInstance();
      const service = new MockService();

      // Act
      container.register("mockService", service);

      // Assert
      expect(container.has("mockService")).toBe(true);
    });

    it("should register a service with a token that already exists", () => {
      // Arrange
      const container = ServiceContainer.getInstance();
      const service1 = new MockService();
      const service2 = new AnotherMockService();

      // Act
      container.register("mockService", service1);
      container.register("mockService", service2);

      // Assert - Should replace the existing service
      expect(container.has("mockService")).toBe(true);
      expect(container.get("mockService")).toBe(service2);
    });
  });

  describe("has", () => {
    it("should return true when service exists", () => {
      // Arrange
      const container = ServiceContainer.getInstance();
      const service = new MockService();
      container.register("mockService", service);

      // Act & Assert
      expect(container.has("mockService")).toBe(true);
    });

    it("should return false when service does not exist", () => {
      // Arrange
      const container = ServiceContainer.getInstance();

      // Act & Assert
      expect(container.has("nonExistentService")).toBe(false);
    });
  });

  describe("get", () => {
    it("should return registered service", () => {
      // Arrange
      const container = ServiceContainer.getInstance();
      const service = new MockService();
      container.register("mockService", service);

      // Act
      const retrievedService = container.get<MockService>("mockService");

      // Assert
      expect(retrievedService).toBe(service);
    });

    it("should throw when getting non-existent service", () => {
      // Arrange
      const container = ServiceContainer.getInstance();

      // Act & Assert
      expect(() => {
        container.get("nonExistentService");
      }).toThrow("Service with token 'nonExistentService' not registered");
    });
  });

  describe("clear", () => {
    it("should clear all registered services", () => {
      // Arrange
      const container = ServiceContainer.getInstance();
      const service1 = new MockService();
      const service2 = new AnotherMockService();

      container.register("service1", service1);
      container.register("service2", service2);

      expect(container.has("service1")).toBe(true);
      expect(container.has("service2")).toBe(true);

      // Act
      container.clear();

      // Assert
      expect(container.has("service1")).toBe(false);
      expect(container.has("service2")).toBe(false);
    });
  });
});
