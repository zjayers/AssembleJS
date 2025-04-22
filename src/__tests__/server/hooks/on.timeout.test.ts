import type { OnTimeoutHook } from "../../../server/hooks/on.timeout";

describe("OnTimeoutHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes request and reply parameters", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;

    let hookWasCalled = false;

    // Create a function that satisfies the OnTimeoutHook type
    const timeoutHook: OnTimeoutHook = async (request, reply) => {
      // Verify the parameters
      expect(request).toBe(mockRequest);
      expect(reply).toBe(mockReply);

      // Mark the hook as called
      hookWasCalled = true;
    };

    // Act
    await timeoutHook(mockRequest, mockReply);

    // Assert
    expect(hookWasCalled).toBe(true);
  });

  it("should allow async operations", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    let asyncOperationCompleted = false;

    // Create an async hook function
    const timeoutHook: OnTimeoutHook = async (request, reply) => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );
    };

    // Act
    await timeoutHook(mockRequest, mockReply);

    // Assert
    expect(asyncOperationCompleted).toBe(true);
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const timeoutHook: OnTimeoutHook = async (request, reply) => {
      throw hookError;
    };

    // Act & Assert
    await expect(timeoutHook(mockRequest, mockReply)).rejects.toThrow(
      hookError
    );
  });

  it("should support logging timeout information", async () => {
    // Arrange
    const mockRequest = {
      id: "req-123",
      url: "/api/slow-resource",
      method: "GET",
      ip: "127.0.0.1",
      headers: {
        "user-agent": "test-agent",
      },
    } as any;

    const mockReply = {} as any;

    const mockLogger = {
      warn: jest.fn(),
    };

    // Create a hook function that logs timeout
    const timeoutHook: OnTimeoutHook = async (request, reply) => {
      // Log timeout information
      mockLogger.warn(
        `Request timed out: ${request.id} ${request.method} ${request.url} from ${request.ip}`
      );

      // In a real implementation, this might send a metric to a monitoring system
    };

    // Act
    await timeoutHook(mockRequest, mockReply);

    // Assert
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Request timed out: req-123 GET /api/slow-resource from 127.0.0.1"
    );
  });

  it("should support reporting metrics", async () => {
    // Arrange
    const mockRequest = {
      id: "req-123",
      url: "/api/slow-resource",
      method: "GET",
    } as any;

    const mockReply = {} as any;

    const mockMetricsClient = {
      incrementCounter: jest.fn(),
      recordEvent: jest.fn(),
    };

    // Create a hook function that reports metrics
    const timeoutHook: OnTimeoutHook = async (request, reply) => {
      // Increment timeout counter
      mockMetricsClient.incrementCounter("request_timeouts");

      // Record detailed event
      mockMetricsClient.recordEvent("timeout", {
        requestId: request.id,
        endpoint: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      });
    };

    // Act
    await timeoutHook(mockRequest, mockReply);

    // Assert
    expect(mockMetricsClient.incrementCounter).toHaveBeenCalledWith(
      "request_timeouts"
    );
    expect(mockMetricsClient.recordEvent).toHaveBeenCalledWith(
      "timeout",
      expect.objectContaining({
        requestId: "req-123",
        endpoint: "/api/slow-resource",
        method: "GET",
      })
    );
  });
});
