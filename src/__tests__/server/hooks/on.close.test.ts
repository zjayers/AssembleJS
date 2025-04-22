import type { OnCloseHook } from "../../../server/hooks/on.close";

describe("OnCloseHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes app parameter", async () => {
    // Arrange
    const mockApp = {} as any;

    let hookWasCalled = false;

    // Create a function that satisfies the OnCloseHook type
    const closeHook: OnCloseHook = async (app) => {
      // Verify the parameter
      expect(app).toBe(mockApp);

      // Mark the hook as called
      hookWasCalled = true;
    };

    // Act
    await closeHook(mockApp);

    // Assert
    expect(hookWasCalled).toBe(true);
  });

  it("should allow async operations", async () => {
    // Arrange
    const mockApp = {} as any;
    let asyncOperationCompleted = false;

    // Create an async hook function
    const closeHook: OnCloseHook = async (app) => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );
    };

    // Act
    await closeHook(mockApp);

    // Assert
    expect(asyncOperationCompleted).toBe(true);
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockApp = {} as any;
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const closeHook: OnCloseHook = async (app) => {
      throw hookError;
    };

    // Act & Assert
    await expect(closeHook(mockApp)).rejects.toThrow(hookError);
  });

  it("should support typical use cases like database connection cleanup", async () => {
    // Arrange
    const mockApp = {
      log: { info: jest.fn() },
    } as any;

    const mockResources = {
      database: {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
      },
      cache: {
        initialized: true,
        clear: jest.fn().mockResolvedValue(undefined),
      },
      pubsub: {
        active: true,
        disconnect: jest.fn().mockResolvedValue(undefined),
      },
    };

    // Create a hook function that cleans up resources
    const closeHook: OnCloseHook = async (app) => {
      // Simulate cleanup operations
      app.log.info("Cleaning up resources before server shutdown");

      // Close database connections
      await mockResources.database.close();
      mockResources.database.connected = false;

      // Clear caches
      await mockResources.cache.clear();
      mockResources.cache.initialized = false;

      // Disconnect from message broker
      await mockResources.pubsub.disconnect();
      mockResources.pubsub.active = false;
    };

    // Act
    await closeHook(mockApp);

    // Assert
    expect(mockApp.log.info).toHaveBeenCalledWith(
      "Cleaning up resources before server shutdown"
    );
    expect(mockResources.database.close).toHaveBeenCalled();
    expect(mockResources.database.connected).toBe(false);
    expect(mockResources.cache.clear).toHaveBeenCalled();
    expect(mockResources.cache.initialized).toBe(false);
    expect(mockResources.pubsub.disconnect).toHaveBeenCalled();
    expect(mockResources.pubsub.active).toBe(false);
  });
});
