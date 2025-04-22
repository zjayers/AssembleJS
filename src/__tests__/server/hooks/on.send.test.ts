import type { OnSendHook } from "../../../server/hooks/on.send";

describe("OnSendHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes request, reply, and payload parameters", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const mockPayload = "original-payload";

    let hookWasCalled = false;

    // Create a function that satisfies the OnSendHook type
    const sendHook: OnSendHook<string> = async (request, reply, payload) => {
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
    const result = await sendHook(mockRequest, mockReply, mockPayload);

    // Assert
    expect(hookWasCalled).toBe(true);
    expect(result).toBe(mockPayload);
  });

  it("should allow modifying the payload", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = "original-payload";
    const modifiedPayload = "modified-payload";

    // Create a hook function that modifies the payload
    const sendHook: OnSendHook<string> = async (request, reply, payload) => {
      // Modify the payload
      return modifiedPayload;
    };

    // Act
    const result = await sendHook(mockRequest, mockReply, originalPayload);

    // Assert
    expect(result).toBe(modifiedPayload);
  });

  it("should support async operations", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = "original-payload";
    let asyncOperationCompleted = false;

    // Create an async hook function
    const sendHook: OnSendHook<string> = async (request, reply, payload) => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );

      return `${payload}-async`;
    };

    // Act
    const result = await sendHook(mockRequest, mockReply, originalPayload);

    // Assert
    expect(asyncOperationCompleted).toBe(true);
    expect(result).toBe("original-payload-async");
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalPayload = "original-payload";
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const sendHook: OnSendHook<string> = async (request, reply, payload) => {
      throw hookError;
    };

    // Act & Assert
    await expect(
      sendHook(mockRequest, mockReply, originalPayload)
    ).rejects.toThrow(hookError);
  });

  it("should handle different payload types", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;

    // Test with Buffer payload
    const bufferPayload = Buffer.from("test-buffer");
    const bufferSendHook: OnSendHook<Buffer> = async (
      request,
      reply,
      payload
    ) => {
      expect(payload).toBe(bufferPayload);
      return payload;
    };

    // Test with null payload
    const nullSendHook: OnSendHook<null> = async (request, reply, payload) => {
      expect(payload).toBeNull();
      return payload;
    };

    // Act & Assert
    const bufferResult = await bufferSendHook(
      mockRequest,
      mockReply,
      bufferPayload
    );
    expect(bufferResult).toBe(bufferPayload);

    const nullResult = await nullSendHook(mockRequest, mockReply, null);
    expect(nullResult).toBeNull();
  });

  it("should support text replacement use case", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const originalHtml = "<html><body>Hello {{name}}</body></html>";

    // Create a hook function that replaces placeholders
    const sendHook: OnSendHook<string> = async (request, reply, payload) => {
      return payload.replace("{{name}}", "World");
    };

    // Act
    const result = await sendHook(mockRequest, mockReply, originalHtml);

    // Assert
    expect(result).toBe("<html><body>Hello World</body></html>");
  });
});
