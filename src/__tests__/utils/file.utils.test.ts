import fs from "fs";
import { assertFileExists, checkFileExists } from "../../utils/file.utils";

// Mock fs module
jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

describe("File Utilities", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("assertFileExists", () => {
    it("should not throw an error when file exists", () => {
      // Setup fs.existsSync to return true
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // This should not throw
      expect(() =>
        assertFileExists("/path/to/file", "path", "to", "file")
      ).not.toThrow();

      // Verify fs.existsSync was called with the correct path
      expect(fs.existsSync).toHaveBeenCalledWith("/path/to/file");
    });

    it("should throw an error when file does not exist", () => {
      // Setup fs.existsSync to return false
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // This should throw with the expected error message
      expect(() =>
        assertFileExists("/path/to/nonexistent", "path", "to", "nonexistent")
      ).toThrow(
        "[ path -> to -> nonexistent ] does not exist at address: [ /path/to/nonexistent ]"
      );

      // Verify fs.existsSync was called with the correct path
      expect(fs.existsSync).toHaveBeenCalledWith("/path/to/nonexistent");
    });

    it("should work with a single path segment", () => {
      // Setup fs.existsSync to return false
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // This should throw with the expected error message (single path segment)
      expect(() => assertFileExists("/file.txt", "file.txt")).toThrow(
        "[ file.txt ] does not exist at address: [ /file.txt ]"
      );
    });

    it("should work with no path segments", () => {
      // Setup fs.existsSync to return false
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // This should throw, but the error message will have empty brackets for the path parts
      expect(() => assertFileExists("/file.txt")).toThrow(
        "[  ] does not exist at address: [ /file.txt ]"
      );
    });
  });

  describe("checkFileExists", () => {
    it("should return true when file exists", () => {
      // Setup fs.existsSync to return true
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Function should return true
      expect(checkFileExists("/path/to/file")).toBe(true);

      // Verify fs.existsSync was called with the correct path
      expect(fs.existsSync).toHaveBeenCalledWith("/path/to/file");
    });

    it("should return false when file does not exist", () => {
      // Setup fs.existsSync to return false
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Function should return false
      expect(checkFileExists("/path/to/nonexistent")).toBe(false);

      // Verify fs.existsSync was called with the correct path
      expect(fs.existsSync).toHaveBeenCalledWith("/path/to/nonexistent");
    });
  });
});
