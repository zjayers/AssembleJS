import fs from "fs";
import path from "path";
import {
  ensureDirectoryExistence,
  getServerRoot,
} from "../../utils/directory.utils";

// Mock the filesystem modules
jest.mock("fs");
jest.mock("path");

describe("directory.utils", () => {
  describe("ensureDirectoryExistence", () => {
    beforeEach(() => {
      // Reset all mocks before each test
      jest.resetAllMocks();
    });

    it("should do nothing if directory already exists", () => {
      // Mock implementation for this test
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (path.dirname as jest.Mock).mockReturnValue("/test/dir");

      ensureDirectoryExistence("/test/dir/file.txt");

      expect(fs.existsSync).toHaveBeenCalledWith("/test/dir");
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it("should create directory if it does not exist", () => {
      // Set up the mocks for a scenario where the directory doesn't exist
      (path.dirname as jest.Mock)
        .mockReturnValueOnce("/test/dir") // First call
        .mockReturnValueOnce("/test"); // Second call (recursion)

      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // /test/dir doesn't exist
        .mockReturnValueOnce(true); // /test exists

      ensureDirectoryExistence("/test/dir/file.txt");

      expect(fs.existsSync).toHaveBeenCalledWith("/test/dir");
      expect(fs.mkdirSync).toHaveBeenCalledWith("/test/dir");
    });

    it("should create nested directories recursively", () => {
      // Mock multiple levels of directories that don't exist
      (path.dirname as jest.Mock)
        .mockReturnValueOnce("/nested/test/dir") // First call
        .mockReturnValueOnce("/nested/test") // Second call
        .mockReturnValueOnce("/nested") // Third call
        .mockReturnValueOnce("/"); // Fourth call

      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // /nested/test/dir doesn't exist
        .mockReturnValueOnce(false) // /nested/test doesn't exist
        .mockReturnValueOnce(false) // /nested doesn't exist
        .mockReturnValueOnce(true); // / exists

      ensureDirectoryExistence("/nested/test/dir/file.txt");

      // Should create directories from the deepest to the shallowest
      expect(fs.mkdirSync).toHaveBeenCalledTimes(3);
      expect(fs.mkdirSync).toHaveBeenNthCalledWith(1, "/nested");
      expect(fs.mkdirSync).toHaveBeenNthCalledWith(2, "/nested/test");
      expect(fs.mkdirSync).toHaveBeenNthCalledWith(3, "/nested/test/dir");
    });
  });

  describe("getServerRoot", () => {
    it("should return the current working directory", () => {
      // Save the original process.cwd
      const originalCwd = process.cwd;

      // Mock process.cwd
      process.cwd = jest.fn().mockReturnValue("/server/root");

      expect(getServerRoot()).toBe("/server/root");
      expect(process.cwd).toHaveBeenCalled();

      // Restore the original process.cwd
      process.cwd = originalCwd;
    });
  });
});
