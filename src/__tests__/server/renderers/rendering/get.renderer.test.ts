import { getRenderer } from "../../../../server/renderers/rendering/get.renderer";
import { EJS } from "../../../../server/renderers/ejs.renderer";
import { STRING } from "../../../../server/renderers/string.renderer";
import { PREACT } from "../../../../server/renderers/preact.renderer";
import { MARKDOWN } from "../../../../server/renderers/markdown.renderer";
import type { ComponentContext } from "../../../../types/component.context";
import type { AnyObject } from "../../../../types/object.any";
import type { ComponentParams } from "../../../../types/component.params";

// Mock the renderers that will be imported
jest.mock("../../../../server/renderers/ejs.renderer", () => ({
  EJS: { render: jest.fn(), vendorAssets: [] }
}));
jest.mock("../../../../server/renderers/string.renderer", () => ({
  STRING: { render: jest.fn(), vendorAssets: [] }
}));
jest.mock("../../../../server/renderers/preact.renderer", () => ({
  PREACT: { render: jest.fn(), vendorAssets: [] }
}));
jest.mock("../../../../server/renderers/markdown.renderer", () => ({
  MARKDOWN: { render: jest.fn(), vendorAssets: [] }
}));

// Mock dynamic imports
jest.mock("../../../../server/renderers/handlebars.renderer", () => ({
  HANDLEBARS: { render: jest.fn(), vendorAssets: [] }
}), { virtual: true });

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

describe("getRenderer", () => {
  describe("templateFile handling", () => {
    it("should return EJS renderer for .ejs files", async () => {
      // Arrange
      const context: Partial<
        Pick<
          ComponentContext<AnyObject, ComponentParams>,
          "template" | "templateFile" | "renderer"
        >
      > = {
        templateFile: "/path/to/template.ejs",
      };

      // Act
      const renderer = await getRenderer(context);

      // Assert
      expect(renderer).toBe(EJS);
      expect(context.renderer).toBe("EJS");
    });

    it("should return STRING renderer for .html files", async () => {
      // Arrange
      const context: Partial<
        Pick<
          ComponentContext<AnyObject, ComponentParams>,
          "template" | "templateFile" | "renderer"
        >
      > = {
        templateFile: "/path/to/template.html",
      };

      // Act
      const renderer = await getRenderer(context);

      // Assert
      expect(renderer).toBe(STRING);
      expect(context.renderer).toBe("HTML");
    });

    it("should return MARKDOWN renderer for .md files", async () => {
      // Arrange
      const context: Partial<
        Pick<
          ComponentContext<AnyObject, ComponentParams>,
          "template" | "templateFile" | "renderer"
        >
      > = {
        templateFile: "/path/to/template.md",
      };

      // Act
      const renderer = await getRenderer(context);

      // Assert
      expect(renderer).toBe(MARKDOWN);
      expect(context.renderer).toBe("MARKDOWN");
    });

    it("should throw error for unsupported file extensions", async () => {
      // Arrange
      const context: Partial<
        Pick<
          ComponentContext<AnyObject, ComponentParams>,
          "template" | "templateFile" | "renderer"
        >
      > = {
        templateFile: "/path/to/template.unsupported",
      };

      // Act & Assert
      await expect(getRenderer(context)).rejects.toThrow(
        "No renderer found for file type: '.unsupported'"
      );
    });
  });

  describe("template handling", () => {
    it("should return STRING renderer for string templates", async () => {
      // Arrange
      const context: Partial<
        Pick<
          ComponentContext<AnyObject, ComponentParams>,
          "template" | "templateFile" | "renderer"
        >
      > = {
        template: "<div>Hello World</div>",
      };

      // Act
      const renderer = await getRenderer(context);

      // Assert
      expect(renderer).toBe(STRING);
      expect(context.renderer).toBe("STRING");
    });

    it("should return PREACT renderer for function templates", async () => {
      // Arrange - Create a mock function component that meets the ComponentTemplate type
      const jsxFn = function () {
        return { type: "div", props: {} };
      };
      const context: Partial<
        Pick<
          ComponentContext<AnyObject, ComponentParams>,
          "template" | "templateFile" | "renderer"
        >
      > = {
        template: jsxFn as any,
      };

      // Act
      const renderer = await getRenderer(context);

      // Assert
      expect(renderer).toBe(PREACT);
      expect(context.renderer).toBe("PREACT");
    });

    it("should throw error for unsupported template types", async () => {
      // Arrange
      const context: Partial<
        Pick<
          ComponentContext<AnyObject, ComponentParams>,
          "template" | "templateFile" | "renderer"
        >
      > = {
        template: 123 as any, // Deliberately using a number which is unsupported
      };

      // Act & Assert
      await expect(getRenderer(context)).rejects.toThrow(
        "No renderer found for variable type: 'number'"
      );
    });
  });

  it("should throw error when no template or templateFile is provided", async () => {
    // Arrange
    const context: Partial<
      Pick<
        ComponentContext<AnyObject, ComponentParams>,
        "template" | "templateFile" | "renderer"
      >
    > = {};

    // Act & Assert
    await expect(getRenderer(context)).rejects.toThrow(
      "No render-able template or templateFile was provided to the rendering engine."
    );
  });

  it("should dynamically load HANDLEBARS renderer for .hbs files", async () => {
    // Arrange
    const context: Partial<
      Pick<
        ComponentContext<AnyObject, ComponentParams>,
        "template" | "templateFile" | "renderer"
      >
    > = {
      templateFile: "/path/to/template.hbs",
    };

    // Setup mock for dynamic import
    const mockHandlebarsRenderer = { HANDLEBARS: { render: jest.fn(), vendorAssets: [] } };
    jest.mock("../../../../server/renderers/handlebars.renderer", () => mockHandlebarsRenderer, { virtual: true });

    // Act
    await getRenderer(context);

    // Assert
    expect(context.renderer).toBe("HANDLEBARS");
  });
});
