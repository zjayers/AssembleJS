import type { OnErrorHook } from "../../../server/hooks/on.error";

describe("OnErrorHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes request, reply, and error parameters", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const mockError = { code: "TEST_ERROR", message: "Test error" } as any;

    let hookWasCalled = false;

    // Create a function that satisfies the OnErrorHook type
    const errorHook: OnErrorHook = async (request, reply, error) => {
      // Verify the parameters
      expect(request).toBe(mockRequest);
      expect(reply).toBe(mockReply);
      expect(error).toBe(mockError);

      // Mark the hook as called
      hookWasCalled = true;
    };

    // Act
    await errorHook(mockRequest, mockReply, mockError);

    // Assert
    expect(hookWasCalled).toBe(true);
  });

  it("should allow async operations", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const mockError = { code: "TEST_ERROR", message: "Test error" } as any;

    // Create an async hook function
    const errorHook: OnErrorHook = async (request, reply, error) => {
      // Simulate an async operation
      await new Promise((resolve) => setTimeout(resolve, 10));
      return;
    };

    // Act & Assert - should not throw
    await expect(
      errorHook(mockRequest, mockReply, mockError)
    ).resolves.toBeUndefined();
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const mockError = { code: "TEST_ERROR", message: "Test error" } as any;
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const errorHook: OnErrorHook = async (request, reply, error) => {
      throw hookError;
    };

    // Act & Assert
    await expect(errorHook(mockRequest, mockReply, mockError)).rejects.toThrow(
      hookError
    );
  });
});
