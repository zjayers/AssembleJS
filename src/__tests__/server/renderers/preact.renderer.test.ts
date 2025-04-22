import { PreactRenderer } from "../../../server/renderers/preact.renderer";
import type { ComponentContext } from "../../../types/component.context";
import type { ComponentPublicData } from "../../../types/component.simple.types";
import type { ComponentParams } from "../../../types/component.params";
import type { ComponentDevice } from "../../../types/component.device";
import * as preactRender from "preact-render-to-string";
import { h } from "preact";

// Mock preact
jest.mock("preact", () => ({
  h: jest.fn((type, props) => ({
    type,
    props,
    __isVNode: true,
  })),
}));

// Mock dependencies
jest.mock("preact-render-to-string", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock html utils
jest.mock("../../../utils/html.utils", () => ({
  convertExtsToDistPointer: jest.fn((html) => html),
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

describe("PreactRenderer", () => {
  let renderer: PreactRenderer;
  // Create a custom type that makes components writable for testing purposes
  type TestContext = Omit<
    ComponentContext<ComponentPublicData, ComponentParams>,
    "components" | "template"
  > & {
    components: Record<string, Buffer>;
    template: any;
  };

  let mockContext: Partial<TestContext>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock template function (simulating a JSX component)
    const mockTemplateFunction = (props: any) => {
      return h("div", { className: "container" }, [
        h("h1", null, props.title),
        h("div", { className: "content" }, [
          props.components?.header,
          h("p", null, "Hello " + (props.data.name || "World")),
          props.components?.footer,
        ]),
      ]);
    };

    // Create a new instance for each test
    renderer = new PreactRenderer();

    // Create mock context with required properties
    mockContext = {
      template: mockTemplateFunction,
      title: "Preact Test",
      components: {},
      id: "preact-component-123",
      viewName: "preact-view",
      componentName: "preact-component",
      params: {
        headers: {},
        body: {},
        query: {},
        path: {},
      },
      data: { name: "User", count: 5 },
      renderAsBlueprint: false,
      deviceType: "DESKTOP" as ComponentDevice,
      nestLevel: 0,
      serverUrl: "http://localhost:3000",
    };

    // Mock preact-render-to-string
    (preactRender.default as jest.Mock).mockReturnValue(
      '<div class="container"><h1>Preact Test</h1><div class="content"><p>Hello User</p></div></div>'
    );
  });

  it("should initialize with empty vendor assets", () => {
    expect(renderer.vendorAssets).toEqual([]);
  });

  it("should render JSX template with context", async () => {
    // Act
    const result = await renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(h).toHaveBeenCalled();
    expect(preactRender.default).toHaveBeenCalled();
    expect(result).toBe(
      '<div class="container"><h1>Preact Test</h1><div class="content"><p>Hello User</p></div></div>'
    );

    // Check that h was called with the template function and props
    const hCall = (h as jest.Mock).mock.calls[0];
    expect(hCall[0]).toBe(mockContext.template);
    expect(hCall[1]).toMatchObject({
      id: "preact-component-123",
      data: { name: "User", count: 5 },
    });
  });

  it("should pass component data to template", async () => {
    // Arrange
    mockContext.data = { name: "Alice", role: "admin" };
    (preactRender.default as jest.Mock).mockReturnValue(
      '<div class="container"><h1>Preact Test</h1><div class="content"><p>Hello Alice</p></div></div>'
    );

    // Act
    const result = await renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(h).toHaveBeenCalled();
    const hCall = (h as jest.Mock).mock.calls[0];
    expect(hCall[1].data).toEqual({ name: "Alice", role: "admin" });
    expect(result).toBe(
      '<div class="container"><h1>Preact Test</h1><div class="content"><p>Hello Alice</p></div></div>'
    );
  });

  it("should convert component buffers to strings in context", async () => {
    // Arrange
    mockContext.components = {
      header: Buffer.from("<header>Page Header</header>"),
      footer: Buffer.from("<footer>Page Footer</footer>"),
    };

    // Act
    await renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(h).toHaveBeenCalled();
    const hCall = (h as jest.Mock).mock.calls[0];
    expect(hCall[1].components).toEqual({
      header: "<header>Page Header</header>",
      footer: "<footer>Page Footer</footer>",
    });
  });

  it("should handle non-function templates", async () => {
    // Arrange - simulate a non-function template
    mockContext.template = "<div>Static HTML</div>";
    console.error = jest.fn();

    // Act
    const result = await renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(result).toBe("<div>Error: Invalid template type</div>");
    expect(console.error).toHaveBeenCalledWith(
      "Template is not a function:",
      "string"
    );
  });

  it("should handle errors during rendering", async () => {
    // Arrange
    (preactRender.default as jest.Mock).mockImplementation(() => {
      throw new Error("Render error");
    });
    console.error = jest.fn();

    // Act
    const result = await renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(result).toBe("<div>Error rendering component: Render error</div>");
    expect(console.error).toHaveBeenCalledWith(
      "Error rendering Preact component:",
      expect.any(Error)
    );
  });

  it("should handle empty render results", async () => {
    // Arrange
    (preactRender.default as jest.Mock).mockReturnValue("");
    console.error = jest.fn();

    // Act
    const result = await renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(result).toBe("<div>Error: Empty render result</div>");
    expect(console.error).toHaveBeenCalledWith(
      "Preact render returned empty result"
    );
  });
});
