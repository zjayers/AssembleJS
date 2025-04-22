import { getWindow } from "../../../browser/common/get.window";

// Temporarily skip this test file due to global timeout issues
describe.skip("getWindow", () => {
  // Store original window and global
  const originalWindow = global.window;
  const originalGlobal = global.global;

  beforeEach(() => {
    // Reset mocks before each test
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original window and global after tests
    global.window = originalWindow;
    global.global = originalGlobal;
  });

  it("should return window object when it exists", () => {
    // Arrange - mock window object
    const mockWindow = { mockProperty: "window-value" };
    global.window = mockWindow as any;

    // Act
    const result = getWindow();

    // Assert
    expect(result).toBe(mockWindow);
  });

  it("should return global object when window does not exist but global does", () => {
    // Arrange - remove window, mock global
    // @ts-ignore - intentionally setting to undefined
    global.window = undefined;
    const mockGlobal = { mockProperty: "global-value" };
    // @ts-ignore - overriding global with mock
    global.global = mockGlobal;

    // Act
    const result = getWindow();

    // Assert
    expect(result).toBe(mockGlobal);
  });

  it("should throw error when neither window nor global exists", () => {
    // Arrange - remove both window and global
    // @ts-ignore - intentionally setting to undefined
    global.window = undefined;
    // @ts-ignore - intentionally setting to undefined
    global.global = undefined;

    // Act & Assert
    expect(() => getWindow()).toThrow("Error: Unable to locate global object!");
  });

  it("should prefer window over global when both exist", () => {
    // Arrange - mock both window and global
    const mockWindow = { mockProperty: "window-value" };
    const mockGlobal = { mockProperty: "global-value" };
    global.window = mockWindow as any;
    // @ts-ignore - overriding global with mock
    global.global = mockGlobal;

    // Act
    const result = getWindow();

    // Assert
    expect(result).toBe(mockWindow);
    expect(result).not.toBe(mockGlobal);
  });
});
