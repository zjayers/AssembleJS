import { renderTemplate } from "../../../../server/renderers/rendering/render.template";
import * as getRendererModule from "../../../../server/renderers/rendering/get.renderer";
import * as componentUtils from "../../../../utils/component.utils";
import type { ComponentContext } from "../../../../types/component.context";
import type { ComponentParams } from "../../../../types/component.params";
import type { ComponentDevice } from "../../../../types/component.device";
import type { AnyObject } from "../../../../types/object.any";

// Mock dependencies
jest.mock("../../../../server/renderers/rendering/get.renderer");
jest.mock("../../../../utils/component.utils");

// Mock logger.utils.ts
jest.mock("../../../../utils/logger.utils", () => {
  return {
    logger: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
    ConsoleLogger: jest.fn().mockImplementation(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  };
});

describe("renderTemplate", () => {
  // Setup test variables
  let mockRenderer: any;
  let mockContext: ComponentContext<AnyObject, ComponentParams>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock renderer
    mockRenderer = {
      render: jest.fn().mockResolvedValue("<div>Test template</div>"),
      vendorAssets: [],
    };

    // Mock getRenderer to return our mock renderer
    (getRendererModule.getRenderer as jest.Mock).mockResolvedValue(mockRenderer);

    // Mock mutateBlueprint to return a modified template
    (componentUtils.mutateBlueprint as jest.Mock).mockReturnValue(
      "<blueprint>Modified template</blueprint>"
    );

    // Create a mock context directly without using the ComponentContext constructor
    mockContext = {
      template: "<div>Test template</div>",
      id: "test-component-123",
      componentName: "test-component",
      viewName: "test-view",
      data: { test: "data" },
      params: {
        headers: {},
        body: {},
        query: {},
        path: {},
      },
      components: {},
      deviceType: "DESKTOP" as ComponentDevice,
      nestLevel: 0,
      renderAsBlueprint: false,
      serverUrl: "http://localhost:3000",
      title: "Test Title",

      // Add required fields
      api: {} as any,
      request: {} as any,
      reply: {} as any,
      helpers: {},
    } as any; // Cast to proper type
  });

  it("should render a template with the correct renderer", async () => {
    // Act
    const result = await renderTemplate(mockContext);

    // Assert
    expect(getRendererModule.getRenderer).toHaveBeenCalledWith(mockContext);
    expect(mockRenderer.render).toHaveBeenCalledWith(mockContext);
    expect(result).toBe("<div>Test template</div>");

    // Verify request and reply are reset to empty objects
    expect(mockContext.request).toEqual({});
    expect(mockContext.reply).toEqual({});
  });

  it("should mutate the template when renderAsBlueprint is true", async () => {
    // Arrange
    mockContext.renderAsBlueprint = true;

    // Act
    const result = await renderTemplate(mockContext);

    // Assert
    expect(getRendererModule.getRenderer).toHaveBeenCalledWith(mockContext);
    expect(mockRenderer.render).toHaveBeenCalledWith(mockContext);
    expect(componentUtils.mutateBlueprint).toHaveBeenCalledWith(
      "<div>Test template</div>",
      mockContext
    );
    expect(result).toBe("<blueprint>Modified template</blueprint>");
  });

  it("should not mutate the template when renderAsBlueprint is false", async () => {
    // Act
    const result = await renderTemplate(mockContext);

    // Assert
    expect(getRendererModule.getRenderer).toHaveBeenCalledWith(mockContext);
    expect(mockRenderer.render).toHaveBeenCalledWith(mockContext);
    expect(componentUtils.mutateBlueprint).not.toHaveBeenCalled();
    expect(result).toBe("<div>Test template</div>");
  });

  it("should handle Buffer return types from renderers", async () => {
    // Arrange
    const bufferContent = Buffer.from("<div>Buffer content</div>");
    mockRenderer.render.mockResolvedValue(bufferContent);

    // Act
    const result = await renderTemplate(mockContext);

    // Assert
    expect(getRendererModule.getRenderer).toHaveBeenCalledWith(mockContext);
    expect(mockRenderer.render).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(bufferContent);
  });
});
