import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { logLocalInformation } from "../../../server/app/log.local-information";
import { ASSEMBLEJS } from "../../../server/config/blueprint.config";

// Mock dependencies
jest.mock("../../../server/config/blueprint.config", () => ({
  ASSEMBLEJS: {
    isLocal: jest.fn(),
  },
}));

describe("logLocalInformation", () => {
  let mockApp: any;
  let mockUserOpts: any;
  let mockBaseAddress: string;
  let originalIsLocal: typeof ASSEMBLEJS.isLocal;

  beforeEach(() => {
    jest.clearAllMocks();

    // Store original method
    originalIsLocal = ASSEMBLEJS.isLocal;

    // Mock app
    mockApp = {
      log: {
        debug: jest.fn(),
      },
      routes: new Map([
        ["/api/users", {}],
        ["/api/auth", {}],
        ["/component/view", {}],
      ]),
    };

    // Mock user options
    mockUserOpts = {
      manifest: {
        components: [
          {
            path: "component-1",
            views: [
              {
                viewName: "desktop",
                exposeAsBlueprint: true,
              },
              {
                viewName: "mobile",
                exposeAsBlueprint: false,
              },
            ],
          },
          {
            path: "component-2",
            views: [
              {
                viewName: "desktop",
                exposeAsBlueprint: false,
              },
            ],
          },
        ],
      },
    };

    // Mock base address
    mockBaseAddress = "http://localhost:3000";
  });

  afterEach(() => {
    // Restore original method
    ASSEMBLEJS.isLocal = originalIsLocal;
  });

  it("should log routes and components when in local mode", () => {
    // Set isLocal to return true
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

    logLocalInformation(mockApp, mockUserOpts, mockBaseAddress);

    // Check that routes were logged
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Routes:")
    );
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("/api/users")
    );
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth")
    );
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("/component/view")
    );

    // Check that components were logged
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Components:")
    );

    // Check blueprint log format
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining(
        "BLUEPRINT:  [ http://localhost:3000/component-1/desktop/ ]"
      )
    );

    // Check component log format with authentication note
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining(
        "COMPONENT: [ http://localhost:3000/component-1/mobile/ ] (!!! Default Authentication Removed While Running Locally !!!)"
      )
    );

    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining(
        "COMPONENT: [ http://localhost:3000/component-2/desktop/ ] (!!! Default Authentication Removed While Running Locally !!!)"
      )
    );
  });

  it("should not log anything when not in local mode", () => {
    // Set isLocal to return false
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(false);

    logLocalInformation(mockApp, mockUserOpts, mockBaseAddress);

    // Check that no logs were made
    expect(mockApp.log.debug).not.toHaveBeenCalled();
  });

  it("should handle empty components array gracefully", () => {
    // Set isLocal to return true
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

    // Create options with empty components array
    const emptyUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: [],
      },
    };

    logLocalInformation(mockApp, emptyUserOpts, mockBaseAddress);

    // Check that routes were still logged
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Routes:")
    );

    // Check that empty components array was logged
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Components: []")
    );
  });

  it("should handle undefined components gracefully", () => {
    // Set isLocal to return true
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

    // Create options with undefined components
    const undefinedUserOpts = {
      serverRoot: "file:///mock/path/server.ts", // Add required serverRoot property
      manifest: {
        components: undefined,
      },
    };

    logLocalInformation(mockApp, undefinedUserOpts, mockBaseAddress);

    // Check that routes were still logged
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Routes:")
    );

    // Check that empty components array was logged
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Components: []")
    );
  });

  it("should sort routes and components alphabetically", () => {
    // Set isLocal to return true
    (ASSEMBLEJS.isLocal as jest.Mock).mockReturnValue(true);

    // Mock app with unordered routes
    mockApp.routes = new Map([
      ["/z-route", {}],
      ["/a-route", {}],
      ["/m-route", {}],
    ]);

    logLocalInformation(mockApp, mockUserOpts, mockBaseAddress);

    // Get the routes debug call
    const routesCall = mockApp.log.debug.mock.calls.find((call: any) =>
      call[0].includes("Routes:")
    )[0];

    // Check that routes were sorted
    const routesJson = JSON.parse(
      routesCall.substring(routesCall.indexOf("["))
    );
    expect(routesJson[0]).toBe("/a-route");
    expect(routesJson[1]).toBe("/m-route");
    expect(routesJson[2]).toBe("/z-route");

    // Get the components debug call
    const componentsCall = mockApp.log.debug.mock.calls.find((call: any) =>
      call[0].includes("Components:")
    )[0];

    // Components should be sorted as well
    expect(componentsCall.indexOf("component-1/desktop")).toBeLessThan(
      componentsCall.indexOf("component-1/mobile")
    );
  });
});
