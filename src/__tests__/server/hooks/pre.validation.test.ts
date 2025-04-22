import type { PreValidationHook } from "../../../server/hooks/pre.validation";

describe("PreValidationHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes request and reply parameters", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;

    let hookWasCalled = false;

    // Create a function that satisfies the PreValidationHook type
    const preValidationHook: PreValidationHook = async (request, reply) => {
      // Verify the parameters
      expect(request).toBe(mockRequest);
      expect(reply).toBe(mockReply);

      // Mark the hook as called
      hookWasCalled = true;
    };

    // Act
    await preValidationHook(mockRequest, mockReply);

    // Assert
    expect(hookWasCalled).toBe(true);
  });

  it("should allow async operations", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    let asyncOperationCompleted = false;

    // Create an async hook function
    const preValidationHook: PreValidationHook = async (request, reply) => {
      // Simulate an async operation
      await new Promise((resolve) =>
        setTimeout(() => {
          asyncOperationCompleted = true;
          resolve(undefined);
        }, 10)
      );
    };

    // Act
    await preValidationHook(mockRequest, mockReply);

    // Assert
    expect(asyncOperationCompleted).toBe(true);
  });

  it("should propagate errors from the hook function", async () => {
    // Arrange
    const mockRequest = {} as any;
    const mockReply = {} as any;
    const hookError = new Error("Hook failed");

    // Create a hook function that throws
    const preValidationHook: PreValidationHook = async (request, reply) => {
      throw hookError;
    };

    // Act & Assert
    await expect(preValidationHook(mockRequest, mockReply)).rejects.toThrow(
      hookError
    );
  });

  it("should support modifying request body", async () => {
    // Arrange
    const mockRequest = {
      body: {
        name: "Test User",
        email: "test@example.com",
      },
    } as any;

    const mockReply = {} as any;

    // Create a hook function that adds fields to the request body
    const preValidationHook: PreValidationHook = async (request, reply) => {
      // Add timestamp to request body
      const body = request.body as {
        name: string;
        email: string;
        timestamp?: number;
        normalized?: { name: string; email: string };
      };

      request.body = {
        ...body,
        timestamp: Date.now(),
        normalized: {
          name: body.name.toLowerCase(),
          email: body.email.toLowerCase(),
        },
      };
    };

    // Act
    await preValidationHook(mockRequest, mockReply);

    // Assert
    expect(mockRequest.body).toHaveProperty("timestamp");
    expect(mockRequest.body).toHaveProperty("normalized");
    expect(mockRequest.body.normalized).toEqual({
      name: "test user",
      email: "test@example.com",
    });
  });

  it("should support data sanitization use case", async () => {
    // Arrange
    const mockRequest = {
      body: {
        name: "  Test User  ",
        email: "TEST@EXAMPLE.COM",
        age: "25",
        role: '<script>alert("XSS")</script>admin',
      },
    } as any;

    const mockReply = {} as any;

    // Create a hook function that sanitizes input
    const preValidationHook: PreValidationHook = async (request, reply) => {
      const body = request.body as {
        name?: string;
        email?: string;
        age?: string | number;
        role?: string;
      };

      const sanitized = {
        // Trim strings
        name: typeof body.name === "string" ? body.name.trim() : body.name,

        // Lowercase email
        email:
          typeof body.email === "string"
            ? body.email.toLowerCase()
            : body.email,

        // Convert string numbers to actual numbers
        age:
          typeof body.age === "string" && !isNaN(Number(body.age))
            ? Number(body.age)
            : body.age,

        // Remove potentially harmful HTML tags - only keep the content inside
        role:
          typeof body.role === "string"
            ? body.role.replace(/<[^>]*>?/gm, "")
            : body.role,
      };

      request.body = sanitized;
    };

    // Act
    await preValidationHook(mockRequest, mockReply);

    // Assert
    expect(mockRequest.body).toEqual({
      name: "Test User",
      email: "test@example.com",
      age: 25,
      role: 'alert("XSS")admin',
    });
  });
});
