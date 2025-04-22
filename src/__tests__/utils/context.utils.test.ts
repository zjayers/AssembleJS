import { getSafeContext } from "../../utils/context.utils";
import type { ComponentContext } from "../../types/component.context";
import type { ComponentPublicData } from "../../types/component.simple.types";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentDevice } from "../../types/component.device";

describe("context.utils", () => {
  describe("getSafeContext", () => {
    it("should return a sanitized view context with all required fields", () => {
      // Prepare test data - Create mock context with proper types
      const mockContext: Partial<
        ComponentContext<ComponentPublicData, ComponentParams>
      > = {
        viewName: "test-view",
        componentName: "test-component",
        id: "test-id-123",
        params: {
          headers: {},
          body: {},
          query: { page: "1" },
          path: { id: "123" },
        },
        data: { count: 5 },
        renderAsBlueprint: true,
        deviceType: "DESKTOP" as ComponentDevice,
        components: {} as Record<string, Buffer>,
        nestLevel: 2,
        title: "Test Page",
        serverUrl: "http://localhost:3000",
        renderer: "EJS",
      };

      // Execute
      const fullContext = mockContext as ComponentContext<
        ComponentPublicData,
        ComponentParams
      >;
      const result = getSafeContext(fullContext);

      // Verify all expected fields are present
      expect(result).toEqual({
        viewName: "test-view",
        componentName: "test-component",
        id: "test-id-123",
        params: {
          headers: {},
          body: {},
          query: { page: "1" },
          path: { id: "123" },
        },
        data: { count: 5 },
        renderAsBlueprint: true,
        deviceType: "DESKTOP",
        components: {},
        nestLevel: 2,
        title: "Test Page",
        serverUrl: "http://localhost:3000",
        renderer: "EJS",
      });
    });

    it("should provide default renderer when not specified", () => {
      // Create a context without a renderer
      const contextWithoutRenderer: Partial<
        ComponentContext<ComponentPublicData, ComponentParams>
      > = {
        viewName: "test-view",
        componentName: "test-component",
        id: "test-id",
        params: {
          headers: {},
          body: {},
          query: {},
          path: {},
        },
        data: {},
        renderAsBlueprint: false,
        deviceType: "MOBILE" as ComponentDevice,
        components: {} as Record<string, Buffer>,
        nestLevel: 1,
        title: "",
        serverUrl: "",
      };

      // Execute
      const fullContext = contextWithoutRenderer as ComponentContext<
        ComponentPublicData,
        ComponentParams
      >;
      const result = getSafeContext(fullContext);

      // Renderer should default to HTML
      expect(result.renderer).toBe("HTML");
    });

    it("should handle empty data fields", () => {
      // Create a minimal context
      const minimalContext: Partial<
        ComponentContext<ComponentPublicData, ComponentParams>
      > = {
        viewName: "minimal",
        componentName: "minimal",
        id: "min-id",
        params: {
          headers: {},
          body: {},
          query: {},
          path: {},
        },
        data: {},
        renderAsBlueprint: false,
        deviceType: "MOBILE" as ComponentDevice,
        components: {} as Record<string, Buffer>,
        nestLevel: 0,
        title: "",
        serverUrl: "",
      };

      // Execute
      const fullContext = minimalContext as ComponentContext<
        ComponentPublicData,
        ComponentParams
      >;
      const result = getSafeContext(fullContext);

      // Should not throw and should return with all fields including empty ones
      expect(result).toEqual({
        viewName: "minimal",
        componentName: "minimal",
        id: "min-id",
        params: {
          headers: {},
          body: {},
          query: {},
          path: {},
        },
        data: {},
        renderAsBlueprint: false,
        deviceType: "MOBILE",
        components: {},
        nestLevel: 0,
        title: "",
        serverUrl: "",
        renderer: "HTML",
      });
    });
  });
});
