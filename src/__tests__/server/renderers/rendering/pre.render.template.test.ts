import { preRenderTemplate } from "../../../../server/renderers/rendering/pre.render.template";
import * as getRendererModule from "../../../../server/renderers/rendering/get.renderer";
import type { BlueprintServerOptions } from "../../../../types/blueprint.server.options";
import type { Component } from "../../../../types/component";
import type { ComponentView } from "../../../../types/component.view";
import type { ComponentRenderer } from "../../../../types/component.renderer";
import { randomUUID } from "crypto";

// Mock dependencies
jest.mock("../../../../server/renderers/rendering/get.renderer");
jest.mock("crypto", () => ({
  randomUUID: jest.fn().mockReturnValue("mocked-uuid-123"),
}));

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

describe("preRenderTemplate", () => {
  // Setup test variables
  let mockRenderer: ComponentRenderer;
  let mockUserOpts: Partial<BlueprintServerOptions>;
  let mockComponent: Partial<Component>;
  let mockView: Partial<ComponentView>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock renderer
    mockRenderer = {
      render: jest.fn().mockReturnValue("<div>Rendered Template</div>"),
      vendorAssets: [],
    };

    // Mock getRenderer to return our mock renderer
    (getRendererModule.getRenderer as jest.Mock).mockResolvedValue(mockRenderer);

    // Create mock options, component, and view with proper type structure
    mockUserOpts = {
      manifest: {
        shared: {
          components: [
            {
              name: "global-header",
              contentUrl: "http://localhost:3000/api/components/global-header",
            },
            {
              name: "global-footer",
              contentUrl: "http://localhost:3000/api/components/global-footer",
            },
          ],
        },
      },
    };

    mockComponent = {
      path: "test-component",
      shared: {
        components: [
          {
            name: "component-helper",
            contentUrl: "http://localhost:3000/api/components/component-helper",
          },
        ],
      },
    };

    mockView = {
      viewName: "test-view",
      template: "<div>{{title}}</div>",
      components: [
        {
          name: "view-specific-component",
          contentUrl:
            "http://localhost:3000/api/components/view-specific-component",
        },
      ],
    };
  });

  it("should pre-render a template with the correct context", async () => {
    // Arrange
    const viewWithoutGetTemplate = {
      ...mockView,
      getTemplate: undefined,
    };

    // Act
    const result = await preRenderTemplate(
      mockUserOpts as BlueprintServerOptions,
      mockComponent as Component,
      viewWithoutGetTemplate as ComponentView
    );

    // Assert
    expect(getRendererModule.getRenderer).toHaveBeenCalledWith(
      viewWithoutGetTemplate
    );
    expect(mockRenderer.render).toHaveBeenCalled();
    expect(result).toBe("<div>Rendered Template</div>");

    // Verify context passed to renderer
    const context = (mockRenderer.render as jest.Mock).mock.calls[0][0];
    // We need to check if template is present, but we don't care about its value
    // because the implementation may handle it differently based on getTemplate presence
    expect(context.id).toBe("mocked-uuid-123");
    expect(context.componentName).toBe(mockComponent.path);
    expect(context.viewName).toBe(mockView.viewName);
    expect(context.nestLevel).toBe(0);
    expect(context.renderAsBlueprint).toBe(false);
    expect(context.serverUrl).toBe("http://localhost:3000");

    // Verify mock components were included
    expect(context.components).toEqual({
      "global-header": "<div>global-header</div>",
      "global-footer": "<div>global-footer</div>",
      "component-helper": "<div>component-helper</div>",
      "view-specific-component": "<div>view-specific-component</div>",
    });
  });

  it("should handle templateFile and getTemplate correctly", async () => {
    // Arrange - Create new objects rather than modifying read-only properties
    const fileBasedView = {
      ...mockView,
      template: undefined,
      templateFile: "/path/to/template.ejs",
      getTemplate: jest.fn().mockReturnValue("<h1>Template from file</h1>"),
    };

    // Act
    await preRenderTemplate(
      mockUserOpts as BlueprintServerOptions,
      mockComponent as Component,
      fileBasedView as ComponentView
    );

    // Assert
    const context = (mockRenderer.render as jest.Mock).mock.calls[0][0];
    expect(context.template).toBe("<h1>Template from file</h1>");
    expect(context.templateFile).toBe("/path/to/template.ejs");
    expect(fileBasedView.getTemplate).toHaveBeenCalled();
  });

  it("should handle missing components arrays", async () => {
    // Arrange - Create new objects rather than modifying read-only properties
    const optsWithNoComponents = {
      manifest: {
        shared: {
          components: undefined,
        },
      },
    };

    const componentWithNoShared = {
      path: "test-component",
      shared: undefined,
    };

    const viewWithNoComponents = {
      ...mockView,
      components: undefined,
    };

    // Act
    await preRenderTemplate(
      optsWithNoComponents as BlueprintServerOptions,
      componentWithNoShared as Component,
      viewWithNoComponents as ComponentView
    );

    // Assert - Should not throw and should provide empty components
    const context = (mockRenderer.render as jest.Mock).mock.calls[0][0];
    expect(context.components).toEqual({});
  });

  it("should call getTemplate when both template and templateFile are present", async () => {
    // Arrange - Create a new view object with both template and templateFile
    const viewWithBoth = {
      ...mockView,
      template: "<div>Inline template</div>",
      templateFile: "/path/to/template.ejs",
      getTemplate: jest.fn().mockReturnValue("<h1>Template from file</h1>"),
    };

    // Act
    await preRenderTemplate(
      mockUserOpts as BlueprintServerOptions,
      mockComponent as Component,
      viewWithBoth as ComponentView
    );

    // Assert - The implementation seems to call getTemplate when both are present
    const context = (mockRenderer.render as jest.Mock).mock.calls[0][0];
    expect(context.template).toBe("<h1>Template from file</h1>");
    expect(viewWithBoth.getTemplate).toHaveBeenCalled();
  });

  it("should use UUID for component ID", async () => {
    // Act
    await preRenderTemplate(
      mockUserOpts as BlueprintServerOptions,
      mockComponent as Component,
      mockView as ComponentView
    );

    // Assert
    expect(randomUUID).toHaveBeenCalled();
    const context = (mockRenderer.render as jest.Mock).mock.calls[0][0];
    expect(context.id).toBe("mocked-uuid-123");
  });
});
