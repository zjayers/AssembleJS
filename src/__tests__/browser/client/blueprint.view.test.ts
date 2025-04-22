/**
 * @jest-environment jsdom
 */

import { Blueprint } from "../../../browser/client/blueprint.view";
import axios from "axios";

// Create a simplified test suite focusing only on essential functionality
// This avoids deep mocking of the Blueprint class internals

describe("Blueprint basic functionality", () => {
  let mockConsoleError: jest.SpyInstance;
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Mock console.error
    mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Set up basic DOM structure
    document.body.innerHTML = "";
    mockElement = document.createElement("div");
    mockElement.id = "test-id";
    document.body.appendChild(mockElement);

    // Mock axios
    jest.spyOn(axios, "create").mockImplementation(
      () =>
        ({
          get: jest.fn(),
          post: jest.fn(),
        } as any)
    );
  });

  afterEach(() => {
    // Clean up mocks
    mockConsoleError.mockRestore();
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  // Abstract class can't be directly instantiated, so we'll test only what we can
  // by observing side effects and error logging

  // Test error rendering
  it("should render error messages when root element is missing", () => {
    // Create a minimal subclass to test with
    class TestClass extends Blueprint<any, any> {}

    // Clear DOM
    document.body.innerHTML = "";

    // Mock document.createElement to capture usage
    const createElementSpy = jest.spyOn(document, "createElement");

    // Try to create instance with missing element
    new TestClass("non-existent-id");

    // Verify error was logged
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        "Unable to locate element with id non-existent-id"
      )
    );

    // Verify error div was created
    expect(createElementSpy).toHaveBeenCalledWith("div");
    expect(document.querySelector("[data-assemblejs-error]")).not.toBeNull();
  });

  // Test error rendering for missing data script
  it("should render error messages when data script is missing", () => {
    // Create a minimal subclass to test with
    class TestClass extends Blueprint<any, any> {}

    // Try to create instance with element but no data script
    new TestClass("test-id");

    // Verify error was logged
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        "Unable to locate component data payload for test-id"
      )
    );

    // Verify error div was created
    expect(document.querySelector("[data-assemblejs-error]")).not.toBeNull();
  });

  // Test with mocked exports to verify type definitions
  it("should have expected method signatures and types", () => {
    // Verify Blueprint class has expected structure
    expect(typeof Blueprint).toBe("function");

    // Verify Blueprint prototype has expected methods
    const proto = Blueprint.prototype;
    expect(typeof proto.dispose).toBe("function");
    expect(typeof proto.toComponents).toBe("function");
    expect(typeof proto.toBlueprint).toBe("function");
    expect(typeof proto.toAll).toBe("function");
    expect(typeof proto.subscribe).toBe("function");
  });
});
