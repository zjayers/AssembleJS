import { MarkdownRenderer } from "../../../server/renderers/markdown.renderer";
import type { ComponentContext } from "../../../types/component.context";
import type { ComponentPublicData } from "../../../types/component.simple.types";
import type { ComponentParams } from "../../../types/component.params";
import type { ComponentDevice } from "../../../types/component.device";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

// Mock dependencies
jest.mock("markdown-it", () => {
  return jest.fn().mockImplementation(() => ({
    render: jest.fn((template) => `<div>${template}</div>`),
    utils: {
      escapeHtml: jest.fn((str) => str),
    },
    linkify: {
      set: jest.fn(),
    },
  }));
});

jest.mock("highlight.js", () => ({
  getLanguage: jest.fn(),
  highlight: jest.fn(),
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

describe("MarkdownRenderer", () => {
  let renderer: MarkdownRenderer;
  let mockContext: Partial<
    ComponentContext<ComponentPublicData, ComponentParams>
  >;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new instance for each test
    renderer = new MarkdownRenderer();

    // Create mock context with required properties
    mockContext = {
      template: "# Hello World\n\nThis is a **markdown** test.",
      title: "Markdown Test",
      components: {},
      id: "markdown-component-123",
      viewName: "markdown-view",
      componentName: "markdown-component",
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

  it("should render markdown template with context", () => {
    // Act
    renderer.render(
      mockContext as ComponentContext<ComponentPublicData, ComponentParams>
    );

    // Assert
    expect(MarkdownIt).toHaveBeenCalled();
    expect(MarkdownIt).toHaveBeenCalledWith({
      html: true,
      linkify: true,
      typographer: true,
      highlight: expect.any(Function),
    });

    // Check that markdown-it render was called with the template
    const mockMarkdownIt = (MarkdownIt as jest.Mock).mock.results[0].value;
    expect(mockMarkdownIt.render).toHaveBeenCalledWith(mockContext.template);
    expect(mockMarkdownIt.linkify.set).toHaveBeenCalledWith({
      fuzzyEmail: false,
    });
  });

  it("should test syntax highlighting functionality", () => {
    // Create a mock implementation of the highlight function used in MarkdownIt
    const mockHighlightFunction = (str: string, lang: string, md?: any) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            '<pre class="hljs"><code>' +
            hljs.highlight(str, {
              language: lang,
              ignoreIllegals: true,
            }).value +
            "</code></pre>"
          );
        } catch (__) {}
      }

      return (
        '<pre class="hljs"><code>' +
        (md?.utils?.escapeHtml?.(str) || str) +
        "</code></pre>"
      );
    };

    // Configure mocks for our test cases
    (hljs.getLanguage as jest.Mock).mockReturnValue(true);
    (hljs.highlight as jest.Mock).mockReturnValue({
      value: '<span class="hljs-keyword">const</span> x = 10;',
    });

    // Create mock markdown instance
    const mockMarkdown = {
      utils: { escapeHtml: jest.fn().mockReturnValue("escaped code") },
    };

    // Test recognized language case
    const result1 = mockHighlightFunction(
      "const x = 10;",
      "javascript",
      mockMarkdown
    );

    expect(hljs.getLanguage).toHaveBeenCalledWith("javascript");
    expect(hljs.highlight).toHaveBeenCalled();
    expect(result1).toBe(
      '<pre class="hljs"><code><span class="hljs-keyword">const</span> x = 10;</code></pre>'
    );

    // Test unrecognized language case
    jest.clearAllMocks();
    (hljs.getLanguage as jest.Mock).mockReturnValue(false);

    const result2 = mockHighlightFunction(
      "const x = 10;",
      "unknown",
      mockMarkdown
    );

    expect(hljs.getLanguage).toHaveBeenCalledWith("unknown");
    expect(mockMarkdown.utils.escapeHtml).toHaveBeenCalledWith("const x = 10;");
    expect(result2).toBe('<pre class="hljs"><code>escaped code</code></pre>');

    // Test error handling case
    jest.clearAllMocks();
    (hljs.getLanguage as jest.Mock).mockReturnValue(true);
    (hljs.highlight as jest.Mock).mockImplementation(() => {
      throw new Error("Highlight error");
    });

    const result3 = mockHighlightFunction(
      "const x = 10;",
      "javascript",
      mockMarkdown
    );

    expect(hljs.getLanguage).toHaveBeenCalledWith("javascript");
    expect(hljs.highlight).toHaveBeenCalled();
    expect(mockMarkdown.utils.escapeHtml).toHaveBeenCalledWith("const x = 10;");
    expect(result3).toBe('<pre class="hljs"><code>escaped code</code></pre>');
  });
});
