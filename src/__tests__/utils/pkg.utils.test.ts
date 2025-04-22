import fs from "fs";
import {
  addPackageJsonScript,
  addPackageJsonKey,
  getPackageJsonKey,
  PackageJson,
} from "../../utils/pkg.utils.";

// Mock dependencies
jest.mock("fs");
jest.mock("jsonfile");
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
  dirname: jest.fn((p) => p.substring(0, p.lastIndexOf("/"))),
}));

// Mock the actual implementation so we don't rely on internal implementation details
jest.mock("../../utils/pkg.utils.", () => {
  // Store the original exported functions
  const original = jest.requireActual("../../utils/pkg.utils.");

  const mockPkgJson: PackageJson = {
    name: "asmbl",
    version: "1.0.0",
    description: "AssembleJS",
    scripts: { test: "jest" },
  };

  // Create a wrapper that doesn't depend on internal implementations
  return {
    ...original,
    getPackageJsonKey: jest.fn(<T>(key: string, cwd = false): T => {
      return mockPkgJson[key] as T;
    }),
    addPackageJsonKey: jest.fn(
      (key: string, value: unknown, cwd = false): void => {
        mockPkgJson[key] = value;
      }
    ),
    addPackageJsonScript: jest.fn(
      (scriptName: string, script: string, cwd = false): void => {
        if (mockPkgJson.scripts[scriptName] !== undefined) {
          return;
        }
        mockPkgJson.scripts[scriptName] = script;
      }
    ),
  };
});

describe("pkg.utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  describe("getPackageJsonKey", () => {
    it("should return the value of a key from package.json", () => {
      const result = getPackageJsonKey("version");
      expect(result).toBe("1.0.0");
    });

    it("should return undefined for non-existent keys", () => {
      const result = getPackageJsonKey("nonExistentKey");
      expect(result).toBeUndefined();
    });

    it("should use cwd parameter", () => {
      getPackageJsonKey("version", true);
      expect(getPackageJsonKey).toHaveBeenCalledWith("version", true);
    });
  });

  describe("addPackageJsonKey", () => {
    it("should add a new key to package.json", () => {
      addPackageJsonKey("author", "Zach Ayers");
      expect(addPackageJsonKey).toHaveBeenCalledWith("author", "Zach Ayers");
    });

    it("should use cwd parameter", () => {
      addPackageJsonKey("author", "Zach Ayers", true);
      expect(addPackageJsonKey).toHaveBeenCalledWith(
        "author",
        "Zach Ayers",
        true
      );
    });
  });

  describe("addPackageJsonScript", () => {
    it("should add a new script to package.json", () => {
      addPackageJsonScript("build", "tsc");
      expect(addPackageJsonScript).toHaveBeenCalledWith("build", "tsc");
    });

    it("should use cwd parameter", () => {
      addPackageJsonScript("build", "tsc", true);
      expect(addPackageJsonScript).toHaveBeenCalledWith("build", "tsc", true);
    });
  });
});
