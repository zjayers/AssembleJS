import ejs from "ejs";
import { EjsRenderer } from "../../../server/renderers/ejs.renderer";
import type { ComponentContext } from "../../../types/component.context";
import type { ComponentPublicData } from "../../../types/component.simple.types";
import type { ComponentParams } from "../../../types/component.params";
import type { ComponentDevice } from "../../../types/component.device";

// Mock dependencies
jest.mock("ejs", () => ({
  render: jest.fn(),
}));

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

describe("EjsRenderer", () => {
  let renderer: EjsRenderer;
  // Create a custom type that makes components writable for testing purposes
  type TestContext = Omit<
    ComponentContext<ComponentPublicData, ComponentParams>,
    "components"
  > & {
    components: Record<string, Buffer>;
  };

  let mockContext: Partial<TestContext>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new instance for each test
    renderer = new EjsRenderer();

    // Create mock context with minimum required properties
    mockContext = {
      template: "<div><%= context.title %></div>",
      title: "Test Title",
      components: {},
      id: "test-component-123",
      viewName: "test-view",
      componentName: "test-component",
      params: {
        headers: {},
        body: {},
        query: {},
        path: {},
      },
      data: { count: 5 },
      renderAsBlueprint: false,
      deviceType: "DESKTOP" as ComponentDevice,
      nestLevel: 0,
      serverUrl: "http://localhost:3000",
    };
  });

  it("should initialize with empty vendor assets", () => {
    expect(renderer.vendorAssets).toEqual([]);
  });

  it("should render template with context", () => {
    // Arrange
    (ejs.render as jest.Mock).mockReturnValue("<div>Test Title</div>");

    // Act
    renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(ejs.render).toHaveBeenCalledWith(
      mockContext.template,
      expect.objectContaining({
        context: expect.objectContaining({
          title: "Test Title",
          components: {},
        }),
      }),
      { localsName: "context" }
    );
  });

  it("should convert buffer components to strings", () => {
    // Arrange
    (ejs.render as jest.Mock).mockReturnValue(
      "<div>Test Title with child</div>"
    );
    mockContext.components = {
      testChild: Buffer.from("<p>Child Component</p>"),
    };

    // Act
    renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(ejs.render).toHaveBeenCalledWith(
      mockContext.template,
      expect.objectContaining({
        testChild: "<p>Child Component</p>",
        context: expect.objectContaining({
          components: { testChild: "<p>Child Component</p>" },
        }),
      }),
      { localsName: "context" }
    );
  });

  it("should return rendered template string", () => {
    // Arrange
    const expectedOutput = "<div>Rendered Content</div>";
    (ejs.render as jest.Mock).mockReturnValue(expectedOutput);

    // Act
    const result = renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(result).toBe(expectedOutput);
  });

  it("should handle multiple components", () => {
    // Arrange
    (ejs.render as jest.Mock).mockReturnValue(
      "<div>Test with multiple components</div>"
    );
    mockContext.components = {
      header: Buffer.from("<header>Page Header</header>"),
      footer: Buffer.from("<footer>Page Footer</footer>"),
    };

    // Act
    renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(ejs.render).toHaveBeenCalledWith(
      mockContext.template,
      expect.objectContaining({
        header: "<header>Page Header</header>",
        footer: "<footer>Page Footer</footer>",
        context: expect.objectContaining({
          components: {
            header: "<header>Page Header</header>",
            footer: "<footer>Page Footer</footer>",
          },
        }),
      }),
      { localsName: "context" }
    );
  });

  it("should pass context public data to template", () => {
    // Arrange
    (ejs.render as jest.Mock).mockReturnValue("<div>Test with data</div>");
    mockContext.data = { user: { name: "John", id: 123 }, items: [1, 2, 3] };

    // Act
    renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(ejs.render).toHaveBeenCalledWith(
      mockContext.template,
      expect.objectContaining({
        context: expect.objectContaining({
          data: { user: { name: "John", id: 123 }, items: [1, 2, 3] },
        }),
      }),
      { localsName: "context" }
    );
  });
});
