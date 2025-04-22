import type { OnReadyHook } from "../../../server/hooks/on.ready";

describe("OnReadyHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes no parameters", async () => {
    // Arrange
    let hookWasCalled = false;

    // Create a function that satisfies the OnReadyHook type
    const readyHook: OnReadyHook = async () => {
      // Mark the hook as called
      hookWasCalled = true;
    };

    // Act
    await readyHook();

    // Assert
    expect(hookWasCalled).toBe(true);
  });

  it("should allow async operations", async () => {
    // Arrange
    let asyncOperationCompleted = false;

    // Create an async hook function
    const readyHook: OnReadyHook = async () => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );
    };

    // Act
    await readyHook();

    // Assert
    expect(asyncOperationCompleted).toBe(true);
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const readyHook: OnReadyHook = async () => {
      throw hookError;
    };

    // Act & Assert
    await expect(readyHook()).rejects.toThrow(hookError);
  });

  it("should support typical use cases like resource initialization", async () => {
    // Arrange
    const resources: Record<string, any> = {};

    // Create a hook function that initializes resources
    const readyHook: OnReadyHook = async () => {
      // Simulate loading resources
      resources.database = { connected: true };
      resources.cache = { initialized: true };
      resources.metrics = { started: true };
    };

    // Act
    await readyHook();

    // Assert
    expect(resources.database).toEqual({ connected: true });
    expect(resources.cache).toEqual({ initialized: true });
    expect(resources.metrics).toEqual({ started: true });
  });
});
