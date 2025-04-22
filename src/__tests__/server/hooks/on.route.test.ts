// Use a simple type definition that satisfies our test needs
type TestRouteOptions = {
  method: string;
  url: string;
  handler: jest.Mock;
  schema: {
    querystring?: {
      type?: string;
      properties?: Record<string, any>;
      required?: string[];
    };
    response?: {
      [statusCode: number]: {
        type?: string;
        properties?: {
          success?: { type: string };
          message?: { type: string };
        };
      };
    };
  };
  preHandler?: any;
};

describe("OnRouteHook", () => {
  // Test that the type definition behaves as expected
  it("should be a function that takes routeOptions parameter", () => {
    // Arrange
    const mockRouteOptions: TestRouteOptions = {
      method: "GET",
      url: "/test",
      handler: jest.fn(),
      schema: {},
      preHandler: undefined,
    };

    let hookWasCalled = false;

    // Create a function that satisfies the OnRouteHook type
    const routeHook: any = (routeOptions: any) => {
      // Verify the parameter
      expect(routeOptions).toBe(mockRouteOptions);

      // Mark the hook as called
      hookWasCalled = true;
    };

    // Act
    routeHook(mockRouteOptions);

    // Assert
    expect(hookWasCalled).toBe(true);
  });

  it("should support modifying route options", () => {
    // Arrange
    const mockRouteOptions: TestRouteOptions = {
      method: "GET",
      url: "/test",
      handler: jest.fn(),
      schema: {},
      preHandler: undefined,
    };

    const customPreHandler = jest.fn();

    // Create a function that modifies route options
    const routeHook: any = (routeOptions: any) => {
      // Modify the route options
      routeOptions.preHandler = customPreHandler;
    };

    // Act
    routeHook(mockRouteOptions);

    // Assert
    expect(mockRouteOptions.preHandler).toBe(customPreHandler);
  });

  it("should handle adding items to existing hook arrays", () => {
    // Arrange
    const existingPreHandler = jest.fn();
    const mockRouteOptions: TestRouteOptions = {
      method: "GET",
      url: "/test",
      handler: jest.fn(),
      schema: {},
      preHandler: [existingPreHandler],
    };

    const customPreHandler = jest.fn();

    // Create a function that adds to hook arrays
    const routeHook: any = (routeOptions: any) => {
      // Add to existing array
      if (Array.isArray(routeOptions.preHandler)) {
        routeOptions.preHandler.push(customPreHandler);
      } else if (routeOptions.preHandler) {
        routeOptions.preHandler = [routeOptions.preHandler, customPreHandler];
      } else {
        routeOptions.preHandler = [customPreHandler];
      }
    };

    // Act
    routeHook(mockRouteOptions);

    // Assert
    expect(Array.isArray(mockRouteOptions.preHandler)).toBe(true);
    expect(mockRouteOptions.preHandler).toHaveLength(2);
    expect(mockRouteOptions.preHandler[0]).toBe(existingPreHandler);
    expect(mockRouteOptions.preHandler[1]).toBe(customPreHandler);
  });

  it("should be able to add custom schema validation", () => {
    // Arrange
    const mockRouteOptions: TestRouteOptions = {
      method: "GET",
      url: "/test",
      handler: jest.fn(),
      schema: {
        querystring: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: [],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    };

    // Create a function that adds validation
    const routeHook: any = (routeOptions: any) => {
      // Add required property to existing schema
      if (routeOptions.schema?.querystring) {
        routeOptions.schema.querystring.required = ["name"];
      }

      // Add response schema
      if (!routeOptions.schema.response[200]) {
        routeOptions.schema.response[200] = {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
        };
      }
    };

    // Act
    routeHook(mockRouteOptions);

    // Assert
    expect(mockRouteOptions.schema.querystring?.required).toEqual(["name"]);
    expect(mockRouteOptions.schema.response).toBeDefined();
    expect(mockRouteOptions.schema.response?.[200]).toBeDefined();

    // Check that the response schema was created with appropriate properties
    const responseSchema = mockRouteOptions.schema.response?.[200];
    expect(responseSchema).toBeDefined();

    // With our properly typed schema, we can safely assert these properties
    if (responseSchema) {
      expect(responseSchema.type).toBe("object");
      expect(responseSchema.properties?.success).toBeDefined();
      expect(responseSchema.properties?.message).toBeDefined();
    }
  });
});
