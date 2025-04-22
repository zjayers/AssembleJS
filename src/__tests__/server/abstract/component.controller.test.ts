/**
 * @jest-environment node
 */
import { ComponentController } from "../../../server/abstract/component.controller";
import { ASSEMBLEJS } from "../../../server/config/blueprint.config";

jest.mock("../../../server/config/blueprint.config", () => ({
  ASSEMBLEJS: {
    isLocal: jest.fn().mockReturnValue(false),
    blueprintIdHeader: "x-assemblejs-blueprint-id",
    componentIdHeader: "x-assemblejs-component-id",
    nestLevelHeader: "x-assemblejs-nest-level",
  },
}));

// Create a testable implementation of the abstract class
class TestComponentController extends ComponentController {
  register(
    app: any,
    userOpts?: any,
    component?: any,
    view?: any,
    devServer?: any
  ): void {
    // Implementation for testing
  }

  // Expose protected methods for testing
  public async testRunFactories(context: any, factories: any): Promise<void> {
    return this.runFactories(context, factories);
  }

  public async testInjectDevelopmentItems(
    context: any,
    component: any,
    view: any
  ): Promise<any> {
    // This method can return different types (ComponentTemplate or string or undefined)
    // Use any to bypass the type error
    return this.injectDevelopmentItems(context, component, view);
  }
}

describe("ComponentController", () => {
  let componentController: TestComponentController;

  beforeEach(() => {
    jest.clearAllMocks();
    (ASSEMBLEJS.isLocal as jest.Mock).mockReset();
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(false);
    componentController = new TestComponentController();
  });

  describe("runFactories", () => {
    it("should run factories in correct order: view, component, global", async () => {
      // Arrange
      const mockContext = { data: {} };
      const mockFactories = {
        view: [{ factory: jest.fn().mockResolvedValue(undefined) }],
        component: [{ factory: jest.fn().mockResolvedValue(undefined) }],
        global: [{ factory: jest.fn().mockResolvedValue(undefined) }],
      };

      // Act
      await componentController.testRunFactories(mockContext, mockFactories);

      // Assert - check execution order
      const viewCall =
        mockFactories.view[0].factory.mock.invocationCallOrder[0];
      const compCall =
        mockFactories.component[0].factory.mock.invocationCallOrder[0];
      const globCall =
        mockFactories.global[0].factory.mock.invocationCallOrder[0];

      expect(viewCall).toBeLessThan(compCall);
      expect(compCall).toBeLessThan(globCall);
    });
  });

  describe("injectDevelopmentItems", () => {
    it("should not modify template when not in local mode", async () => {
      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(false);
      const mockContext = {
        template: "<div>Original Template</div>",
        renderAsBlueprint: true,
      };
      const mockComponent = {};
      const mockView = { getTemplate: () => "<div>Original Template</div>" };

      // Act
      const result = await componentController.testInjectDevelopmentItems(
        mockContext,
        mockComponent,
        mockView
      );

      // Assert
      expect(result).toBe("<div>Original Template</div>");
    });

    it("should handle undefined getTemplate", async () => {
      // Arrange
      const mockContext = {
        template: "<div>Original Template</div>",
        renderAsBlueprint: true,
      };
      const mockComponent = {};
      const mockView = {}; // No getTemplate

      // Act
      const result = await componentController.testInjectDevelopmentItems(
        mockContext,
        mockComponent,
        mockView
      );

      // Assert
      expect(result).toBe("<div>Original Template</div>");
    });

    it("should apply component content wrapper", async () => {
      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      const mockContext = {
        template: "<div>Original Template</div>",
        renderAsBlueprint: true,
      };
      const mockComponent = {
        developmentOptions: {
          contentWrapper: (content: string) => `<wrapper>${content}</wrapper>`,
        },
      };
      const mockView = { getTemplate: () => "<div>Original Template</div>" };

      // Act
      const result = await componentController.testInjectDevelopmentItems(
        mockContext,
        mockComponent,
        mockView
      );

      // Assert
      expect(result).toBe("<wrapper><div>Original Template</div></wrapper>");
    });

    it("should apply view content wrapper", async () => {
      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      const mockContext = {
        template: "<div>Original Template</div>",
        renderAsBlueprint: true,
      };
      const mockComponent = {};
      const mockView = {
        getTemplate: () => "<div>Original Template</div>",
        developmentOptions: {
          contentWrapper: (content: string) =>
            `<viewWrapper>${content}</viewWrapper>`,
        },
      };

      // Act
      const result = await componentController.testInjectDevelopmentItems(
        mockContext,
        mockComponent,
        mockView
      );

      // Assert
      expect(result).toBe(
        "<viewWrapper><div>Original Template</div></viewWrapper>"
      );
    });

    it("should apply both wrappers in correct order", async () => {
      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      const mockContext = {
        template: "<div>Original Template</div>",
        renderAsBlueprint: true,
      };
      const mockComponent = {
        developmentOptions: {
          contentWrapper: (content: string) => `<wrapper>${content}</wrapper>`,
        },
      };
      const mockView = {
        getTemplate: () => "<div>Original Template</div>",
        developmentOptions: {
          contentWrapper: (content: string) =>
            `<viewWrapper>${content}</viewWrapper>`,
        },
      };

      // Act
      const result = await componentController.testInjectDevelopmentItems(
        mockContext,
        mockComponent,
        mockView
      );

      // Assert - view wrapper should be applied first, then component wrapper
      expect(result).toBe(
        "<wrapper><viewWrapper><div>Original Template</div></viewWrapper></wrapper>"
      );
    });

    it("should handle function templates", async () => {
      // Arrange
      (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);
      const templateFunction = () => "<div>Function Template</div>";
      const mockContext = {
        template: templateFunction,
        renderAsBlueprint: true,
      };
      const mockComponent = {};
      const mockView = {
        getTemplate: () => templateFunction,
      };

      // Act
      const result = await componentController.testInjectDevelopmentItems(
        mockContext,
        mockComponent,
        mockView
      );

      // Assert - should return the function and set a flag
      expect(result).toBe(templateFunction);
      expect((mockContext as any).__injectDevPanel).toBe(true);
    });
  });
});
