import type { PreSerializationHook } from "../../../server/hooks/pre.serialization";

describe("PreSerializationHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes request, reply, and payload parameters", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const mockPayload = { data: "test-data" };

    let hookWasCalled = false;

    // Create a function that satisfies the PreSerializationHook type
    const preSerializationHook: PreSerializationHook<
      typeof mockPayload
    > = async (request, reply, payload) => {
      // Verify the parameters
      expect(request).toBe(mockRequest);
      expect(reply).toBe(mockReply);
      expect(payload).toBe(mockPayload);

      // Mark the hook as called
      hookWasCalled = true;

      // Return the payload unmodified
      return payload;
    };

    // Act
    const result = await preSerializationHook(
      mockRequest,
      mockReply,
      mockPayload
    );

    // Assert
    expect(hookWasCalled).toBe(true);
    expect(result).toBe(mockPayload);
  });

  it("should allow modifying the payload", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = { data: "original-data" };
    const modifiedPayload = { data: "modified-data" };

    // Create a hook function that modifies the payload
    const preSerializationHook: PreSerializationHook<
      typeof originalPayload
    > = async (request, reply, payload) => {
      // Modify the payload
      return modifiedPayload;
    };

    // Act
    const result = await preSerializationHook(
      mockRequest,
      mockReply,
      originalPayload
    );

    // Assert
    expect(result).toBe(modifiedPayload);
  });

  it("should support async operations", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = { data: "original-data" };
    let asyncOperationCompleted = false;

    // Create an async hook function
    const preSerializationHook: PreSerializationHook<
      typeof originalPayload
    > = async (request, reply, payload) => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );

      return { data: `${payload.data}-async` };
    };

    // Act
    const result = await preSerializationHook(
      mockRequest,
      mockReply,
      originalPayload
    );

    // Assert
    expect(asyncOperationCompleted).toBe(true);
    expect(result).toEqual({ data: "original-data-async" });
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = { data: "original-data" };
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const preSerializationHook: PreSerializationHook<
      typeof originalPayload
    > = async (request, reply, payload) => {
      throw hookError;
    };

    // Act & Assert
    await expect(
      preSerializationHook(mockRequest, mockReply, originalPayload)
    ).rejects.toThrow(hookError);
  });

  it("should support wrapping response data", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = { name: "Test User", email: "test@example.com" };

    // Create a hook function that wraps data in a standard response format
    const preSerializationHook: PreSerializationHook<
      typeof originalPayload
    > = async (request, reply, payload) => {
      return {
        success: true,
        data: payload,
        meta: {
          timestamp: expect.any(Number),
          requestId: request.id,
        },
      };
    };

    // Act
    const result = await preSerializationHook(
      mockRequest,
      mockReply,
      originalPayload
    );

    // Assert
    expect(result).toEqual({
      success: true,
      data: { name: "Test User", email: "test@example.com" },
      meta: {
        timestamp: expect.any(Number),
        requestId: undefined,
      },
    });
  });

  it("should support filtering sensitive data", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      creditCard: "1234-5678-9012-3456",
      ssn: "123-45-6789",
    };

    // Create a hook function that removes sensitive fields
    const preSerializationHook: PreSerializationHook<
      typeof originalPayload
    > = async (request, reply, payload) => {
      // Create a new object without sensitive fields
      const { password, creditCard, ssn, ...safeData } = payload;
      return safeData;
    };

    // Act
    const result = await preSerializationHook(
      mockRequest,
      mockReply,
      originalPayload
    );

    // Assert
    expect(result).toEqual({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
    });

    // Ensure sensitive fields are removed
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("creditCard");
    expect(result).not.toHaveProperty("ssn");
  });
});
