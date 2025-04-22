import axios from "axios";
import { http } from "../../../browser/client/blueprint.http";
import { statusCodes } from "../../../browser/common/http.status.codes";
import type { ViewContext } from "../../../types/component.context";
import type { ComponentPublicData } from "../../../types/component.simple.types";
import type { ComponentParams } from "../../../types/component.params";
// We need the ViewContext type but not ComponentDevice directly
// import type { ComponentDevice } from '../../../types/component.device';

// Mock axios
jest.mock("axios", () => {
  return {
    create: jest.fn().mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
});

describe("blueprint.http", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("http object", () => {
    it("should extend axios with additional properties", () => {
      // Assert that http has all the expected axios methods
      expect(http.get).toBeDefined();
      expect(http.post).toBeDefined();
      expect(http.put).toBeDefined();
      expect(http.delete).toBeDefined();

      // Assert that http has the custom properties
      expect(http.useApi).toBeDefined();
      expect(http.statusCodes).toBeDefined();
    });

    it("should export statusCodes", () => {
      // Assert
      expect(http.statusCodes).toEqual(statusCodes);
    });
  });

  describe("useApi", () => {
    it("should create an axios instance with the correct baseURL", () => {
      // Arrange
      const context = {
        serverUrl: "http://example.com/component/view/",
        components: {},
        componentName: "test-component",
        viewName: "test-view",
        id: "test-id",
        data: {},
        params: { headers: {}, path: {}, query: {}, body: {} },
        nestLevel: 0,
        renderAsBlueprint: false,
        deviceType: "DESKTOP",
        title: "Test Page",
      };

      // Act
      http.useApi(
        context as unknown as ViewContext<ComponentPublicData, ComponentParams>
      );

      // Assert
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "http://example.com",
        withCredentials: true,
      });
    });

    it("should merge custom options with defaults", () => {
      // Arrange
      const context = {
        serverUrl: "http://example.com/component/view/",
        components: {},
        componentName: "test-component",
        viewName: "test-view",
        id: "test-id",
        data: {},
        params: { headers: {}, path: {}, query: {}, body: {} },
        nestLevel: 0,
        renderAsBlueprint: false,
        deviceType: "DESKTOP",
        title: "Test Page",
      };
      const customOptions = {
        timeout: 5000,
        headers: { "X-Custom-Header": "test" },
      };

      // Act
      http.useApi(
        context as unknown as ViewContext<ComponentPublicData, ComponentParams>,
        customOptions
      );

      // Assert
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: "http://example.com",
        withCredentials: true,
        timeout: 5000,
        headers: { "X-Custom-Header": "test" },
      });
    });

    it("should handle serverUrl with various path depths", () => {
      // Arrange
      const baseContext = {
        components: {},
        componentName: "test-component",
        viewName: "test-view",
        id: "test-id",
        data: {},
        params: { headers: {}, path: {}, query: {}, body: {} },
        nestLevel: 0,
        renderAsBlueprint: false,
        deviceType: "DESKTOP",
        title: "Test Page",
      };

      const contexts = [
        { ...baseContext, serverUrl: "http://example.com/component/view/" },
        { ...baseContext, serverUrl: "http://example.com/a/b/c/d/" },
        { ...baseContext, serverUrl: "http://example.com/" },
      ];

      // Act & Assert
      contexts.forEach((context) => {
        // Reset mock
        jest.clearAllMocks();

        // Call useApi
        http.useApi(
          context as unknown as ViewContext<
            ComponentPublicData,
            ComponentParams
          >
        );

        // Extract the expected baseURL
        const pathParts = context.serverUrl.split("/");
        const expectedBaseURL =
          pathParts.length >= 4
            ? pathParts.slice(0, -3).join("/")
            : context.serverUrl.replace(/\/$/, "");

        // Assert
        expect(axios.create).toHaveBeenCalledWith({
          baseURL: expectedBaseURL,
          withCredentials: true,
        });
      });
    });
  });
});
