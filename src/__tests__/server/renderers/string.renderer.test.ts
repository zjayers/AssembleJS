import { StringRenderer } from "../../../server/renderers/string.renderer";
import type { ComponentContext } from "../../../types/component.context";
import type { ComponentPublicData } from "../../../types/component.simple.types";
import type { ComponentParams } from "../../../types/component.params";
import type { ComponentDevice } from "../../../types/component.device";

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

describe("StringRenderer", () => {
  let renderer: StringRenderer;
  let mockContext: Partial<
    ComponentContext<ComponentPublicData, ComponentParams>
  >;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new instance for each test
    renderer = new StringRenderer();

    // Create mock context with required properties
    mockContext = {
      template: "<div>This is a raw string template</div>",
      title: "String Test",
      components: {},
      id: "string-component-123",
      viewName: "string-view",
      componentName: "string-component",
      params: {
        headers: {},
        body: {},
        query: {},
        path: {},
      },
      data: { content: "Sample content" },
      renderAsBlueprint: false,
      deviceType: "DESKTOP" as ComponentDevice,
      nestLevel: 0,
      serverUrl: "http://localhost:3000",
    };
  });

  it("should initialize with empty vendor assets", () => {
    expect(renderer.vendorAssets).toEqual([]);
  });

  it("should return the template string directly without processing", () => {
    // Act
    const result = renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(result).toBe(mockContext.template);
  });

  it("should return a fallback message if template is null or undefined", () => {
    // Arrange
    mockContext.template = undefined;

    // Act
    const result = renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(result).toBe("No template found!");
  });

  it("should handle empty string templates", () => {
    // Arrange
    mockContext.template = "";

    // Act
    const result = renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(result).toBe("");
  });
});
