/**
 * @jest-environment node
 */
import { ContentController } from "../../../server/controllers/content.controller";
import { ASSEMBLEJS } from "../../../server/config/blueprint.config";
import * as componentUtils from "../../../utils/component.utils";
import * as contextUtils from "../../../utils/context.utils";
import * as htmlUtils from "../../../utils/html.utils";
import * as jsonUtils from "../../../utils/json.utils";

/**
 * Simple test implementation of the content controller
 */
class TestableContentController extends ContentController {
  public buildComponentContextCalled = false;
  public runFactoriesCalled = false;
  public injectDevItemsCalled = false;
  public renderCalled = false;
  public overrideTemplateCalled = false;

  // Store the values for inspection
  public lastContext: any = null;
  public lastComponent: any = null;
  public lastView: any = null;
  public lastFactories: any = null;

  // Mock versions of the original methods
  protected override async buildComponentContext(
    view: any,
    app: any,
    userOpts: any,
    component: any,
    request: any,
    reply: any,
    dataOnly?: boolean
  ): Promise<any> {
    this.buildComponentContextCalled = true;

    // Return a simple context
    const context = {
      id: "test-id",
      viewName: view.viewName || "test-view",
      componentName: component.path || "test-component",
      data: new Map([["testData", "test"]]),
      params: { testParam: "test" },
      serverUrl: `/test-component/${view.viewName || "test-view"}/`,
      nestLevel: 0,
      renderAsBlueprint: view.exposeAsBlueprint || false,
      template: view.template || "<div>Test template</div>",
      overrideTemplate: (template: string) => {
        this.overrideTemplateCalled = true;
        context.template = template;
      },
    };

    this.lastContext = context;
    return context;
  }

  protected override async runFactories(
    context: any,
    factories: any
  ): Promise<void> {
    this.runFactoriesCalled = true;
    this.lastFactories = factories;
    // No need to do anything here
  }

  protected override async injectDevelopmentItems(
    context: any,
    component: any,
    view: any
  ): Promise<string> {
    this.injectDevItemsCalled = true;
    this.lastComponent = component;
    this.lastView = view;
    return "<div>Injected template</div>";
  }

  protected override render(context: any): Promise<string> {
    this.renderCalled = true;
    return Promise.resolve("<div>Rendered content</div>");
  }
}

// Mock dependencies
jest.mock("../../../server/config/blueprint.config", () => {
  const originalModule = jest.requireActual(
    "../../../server/config/blueprint.config"
  );

  // Create a deep copy with mocked isLocal function
  return {
    ASSEMBLEJS: {
      ...originalModule.ASSEMBLEJS,
      isLocal: jest.fn().mockReturnValue(false),
      dataIdPrefix: "__ASSEMBLEJS_DATA__",
      htmlWrapperTag: "section",
      componentUrlIdentifier: "data-component-url",
      componentIdIdentifier: "id",
      componentNameIdentifier: "data-component-name",
      componentViewIdentifier: "data-component-view",
      componentNestIdentifier: "data-component-nest-level",
      componentDataIdentifier: "data-component-target",
      componentClassIdentifier: "assemblejs-component",
      blueprintIdHeader: "x-assemblejs-blueprint-id",
      componentIdHeader: "x-assemblejs-component-id",
      nestLevelHeader: "x-assemblejs-nest-level",
    },
  };
});

jest.mock("../../../utils/component.utils");
jest.mock("../../../utils/context.utils");
jest.mock("../../../utils/html.utils");
jest.mock("../../../utils/json.utils");

describe("ContentController", () => {
  let mockApp: any;
  let mockUserOpts: any;
  let mockComponent: any;
  let mockView: any;
  let mockDevServer: any;
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset all mock configurations
    (ASSEMBLEJS.isLocal as jest.Mock).mockReset();
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(false);

    // Setup mocks
    mockApp = {
      get: jest.fn(),
      log: {
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      auth: jest.fn().mockReturnValue("auth-handler"),
      basicAuth: "basic-auth",
      caches: {
        localCache: new Map(),
        renderedView: new Map(),
      },
    };

    mockUserOpts = {
      manifest: {
        shared: {
          factories: [],
          paramsSchema: {
            path: {},
            headers: {},
            query: {},
          },
          routeOpts: {},
        },
      },
    };

    mockComponent = {
      path: "test-component",
      shared: {
        factories: [],
        paramsSchema: {
          path: {},
          headers: {},
          query: {},
        },
        routeOpts: {},
      },
    };

    mockView = {
      viewName: "test-view",
      factories: [],
      paramsSchema: {
        path: {},
        headers: {},
        query: {},
      },
      routeOpts: {},
      template: "<div>Test template</div>",
      getTemplate: jest
        .fn()
        .mockReturnValue("<div>Test template (local)</div>"),
      htmlContainerCssClassNames: ["test-class-1", "test-class-2"],
      htmlContainerAttributes: ['attr1="value1"', 'attr2="value2"'],
      exposeAsBlueprint: false,
    };

    mockDevServer = {
      transformIndexHtml: jest.fn().mockImplementation((url, html) => {
        return Promise.resolve(`${html}<!-- HMR injected -->`);
      }),
    };

    mockRequest = {
      url: "/test-component/test-view/",
      protocol: "http:",
      hostname: "localhost",
      query: {},
      headers: {},
      params: {},
    };

    mockReply = {
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
    };

    // Mock component utils functions
    (componentUtils.isStaticAsset as jest.Mock).mockReturnValue(false);
    (componentUtils.getCachedRenderedComponent as jest.Mock).mockReturnValue(
      null
    );
    (componentUtils.cacheRenderedComponent as jest.Mock).mockImplementation(
      () => {}
    );

    // Mock context utils
    (contextUtils.getSafeContext as jest.Mock).mockImplementation(
      (context) => ({
        id: context.id,
        viewName: context.viewName,
        componentName: context.componentName || "test-component",
        data: context.data || {},
        params: context.params || {},
        serverUrl: context.serverUrl || "/test-component/test-view/",
        nestLevel: context.nestLevel || 0,
        renderAsBlueprint: context.renderAsBlueprint || false,
      })
    );

    // Mock html and json utils
    (htmlUtils.encodeHtml as jest.Mock).mockImplementation((str) => str);
    (jsonUtils.encodeJson as jest.Mock).mockImplementation((obj) =>
      JSON.stringify(obj)
    );
  });

  describe("register", () => {
    it("should register a GET route for the component view", () => {
      // Create controller
      const controller = new TestableContentController();

      // Act
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );

      // Assert
      expect(mockApp.get).toHaveBeenCalledWith(
        "/test-component/test-view/",
        expect.any(Object),
        expect.any(Function)
      );
    });

    it("should set up authentication for production when not a blueprint", () => {
      // Create controller
      const controller = new TestableContentController();

      // Act
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );

      // Assert
      const routeOptions = mockApp.get.mock.calls[0][1];
      expect(routeOptions).toHaveProperty("preHandler", "auth-handler");
      expect(mockApp.auth).toHaveBeenCalledWith([mockApp.basicAuth]);
    });

    it("should not set up authentication for blueprints", () => {
      // Create controller
      const controller = new TestableContentController();

      // Arrange
      mockView.exposeAsBlueprint = true;

      // Act
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );

      // Assert
      const routeOptions = mockApp.get.mock.calls[0][1];
      expect(routeOptions).not.toHaveProperty("preHandler");
    });

    it("should not set up authentication in local development", () => {
      // Create controller
      const controller = new TestableContentController();

      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

      // Act
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );

      // Assert
      const routeOptions = mockApp.get.mock.calls[0][1];
      expect(routeOptions).not.toHaveProperty("preHandler");
    });
  });

  describe("route handler", () => {
    it("should handle static assets by returning empty content", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup
      (componentUtils.isStaticAsset as jest.Mock).mockReturnValue(true);
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.type).toHaveBeenCalledWith("text/html");
      expect(mockReply.send).toHaveBeenCalledWith("");
      expect(controller.buildComponentContextCalled).toBe(false);
    });

    it("should return cached content when available", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup
      const cachedHtml = "<div>Cached content</div>";
      (componentUtils.getCachedRenderedComponent as jest.Mock).mockReturnValue(
        cachedHtml
      );
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.header).toHaveBeenCalledWith("X-Cache", "HIT");
      expect(mockReply.type).toHaveBeenCalledWith("text/html");
      expect(mockReply.send).toHaveBeenCalledWith(Buffer.from(cachedHtml));
      expect(controller.buildComponentContextCalled).toBe(false);
    });

    it("should build component context and run factories", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Register the route to get the handler
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(controller.buildComponentContextCalled).toBe(true);
      expect(controller.runFactoriesCalled).toBe(true);
      expect(controller.renderCalled).toBe(true);
    });

    it("should return JSON data for DATA_ONLY requests", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup
      mockRequest.query.DATA_ONLY = true;
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.type).toHaveBeenCalledWith("application/json");
      expect(mockReply.send).toHaveBeenCalled();
      expect(controller.renderCalled).toBe(false);
    });

    it("should inject development items for blueprints", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup for blueprint rendering
      mockView.exposeAsBlueprint = true;

      // Register and get handler
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(controller.injectDevItemsCalled).toBe(true);
      expect(controller.overrideTemplateCalled).toBe(true);
      expect(controller.lastView).toBe(mockView);
      expect(controller.lastComponent).toBe(mockComponent);
    });

    it("should get latest template in local development", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup for local development
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

      // Register and get handler
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockView.getTemplate).toHaveBeenCalled();
      expect(controller.overrideTemplateCalled).toBe(true);
    });

    it("should apply HMR transformation for blueprints in local development", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup for blueprint in local development
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      mockView.exposeAsBlueprint = true;

      // Register and get handler
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockDevServer.transformIndexHtml).toHaveBeenCalled();
    });

    it("should throw error if dev server is not available for HMR", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup for blueprint in local development without dev server
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      mockView.exposeAsBlueprint = true;

      // Register with undefined dev server
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        undefined
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "AssembleJS Dev server not found!"
      );
    });

    it("should cache rendered content when caching is enabled", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Register and get handler
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(componentUtils.cacheRenderedComponent).toHaveBeenCalledWith(
        mockApp,
        "test-component:test-view:/test-component/test-view/",
        expect.any(String),
        300000
      );
    });

    it("should respect view cacheTtl setting", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup custom cacheTtl
      mockView.cacheTtl = 60000; // 1 minute

      // Register and get handler
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(componentUtils.cacheRenderedComponent).toHaveBeenCalledWith(
        mockApp,
        "test-component:test-view:/test-component/test-view/",
        expect.any(String),
        60000
      );
    });

    it("should not cache in local development", async () => {
      // Create controller
      const controller = new TestableContentController();

      // Setup for local development
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

      // Register and get handler
      controller.register(
        mockApp,
        mockUserOpts,
        mockComponent,
        mockView,
        mockDevServer
      );
      const routeHandler = mockApp.get.mock.calls[0][2];

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(componentUtils.cacheRenderedComponent).not.toHaveBeenCalled();
    });
  });
});
