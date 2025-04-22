import type { PreHandlerHook } from "../../../server/hooks/pre.handler";

describe("PreHandlerHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes request and reply parameters", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;

    let hookWasCalled = false;

    // Create a function that satisfies the PreHandlerHook type
    const preHandlerHook: PreHandlerHook = async (request, reply) => {
      // Verify the parameters
      expect(request).toBe(mockRequest);
      expect(reply).toBe(mockReply);

      // Mark the hook as called
      hookWasCalled = true;
    };

    // Act
    await preHandlerHook(mockRequest, mockReply);

    // Assert
    expect(hookWasCalled).toBe(true);
  });

  it("should allow async operations", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    let asyncOperationCompleted = false;

    // Create an async hook function
    const preHandlerHook: PreHandlerHook = async (request, reply) => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );
    };

    // Act
    await preHandlerHook(mockRequest, mockReply);

    // Assert
    expect(asyncOperationCompleted).toBe(true);
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const preHandlerHook: PreHandlerHook = async (request, reply) => {
      throw hookError;
    };

    // Act & Assert
    await expect(preHandlerHook(mockRequest, mockReply)).rejects.toThrow(
      hookError
    );
  });

  it("should support authentication use case", async () => {
    // Arrange
    const mockRequest = {
      headers: {
        authorization: "Bearer valid-token",
      },
      user: undefined,
    } as any;

    const mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    const mockAuthService = {
      verifyToken: jest.fn().mockImplementation((token) => {
        if (token === "valid-token") {
          return { id: "user-123", role: "admin" };
        }
        throw new Error("Invalid token");
      }),
    };

    // Create a hook function for authentication
    const authHook: any = async (request: any, reply: any) => {
      try {
        // Extract token
        const authHeader = request.headers.authorization || "";
        const token = authHeader.split(" ")[1];

        if (!token) {
          reply.code(401).send({ error: "Authentication required" });
          return;
        }

        // Verify token
        const user = await mockAuthService.verifyToken(token);

        // Set user on request for handlers to use
        request.user = user;
      } catch (error) {
        reply.code(401).send({ error: "Invalid authentication" });
      }
    };

    // Act
    await authHook(mockRequest, mockReply);

    // Assert
    expect(mockAuthService.verifyToken).toHaveBeenCalledWith("valid-token");
    expect(mockRequest.user).toEqual({ id: "user-123", role: "admin" });
    expect(mockReply.code).not.toHaveBeenCalled();
  });

  it("should support authorization use case", async () => {
    // Arrange
    const mockRequest = {
      user: { id: "user-123", role: "user" },
      url: "/admin/dashboard",
    } as any;

    const mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    // Create a hook function for authorization
    const authzHook: any = async (request: any, reply: any) => {
      // Check for admin-only paths
      if (
        request.url?.startsWith("/admin/") &&
        request.user?.role !== "admin"
      ) {
        reply.code(403).send({ error: "Forbidden: Insufficient permissions" });
      }
    };

    // Act
    await authzHook(mockRequest, mockReply);

    // Assert
    expect(mockReply.code).toHaveBeenCalledWith(403);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Forbidden: Insufficient permissions",
    });
  });
});
