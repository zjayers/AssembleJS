import axios from "axios";
import { checkVersion, formatUpdateMessage } from "../../utils/version.utils";
import { getPackageJsonKey } from "../../utils/pkg.utils.";

// Mock the dependencies
jest.mock("axios");
jest.mock("../../utils/pkg.utils.");

// Helper to save original env and restore after tests
const originalEnv = process.env;

describe("version.utils", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Restore env but with a new object to avoid affecting other tests
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Fully restore original env
    process.env = originalEnv;
  });

  describe("checkVersion", () => {
    it("should return correct version info when latest version matches current", async () => {
      // Mock package version
      (getPackageJsonKey as jest.Mock).mockReturnValue("1.0.0");
      // Mock API response
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          "dist-tags": {
            latest: "1.0.0",
          },
        },
      });

      const result = await checkVersion();

      expect(result).toEqual({
        isLatest: true,
        latestVersion: "1.0.0",
        currentVersion: "1.0.0",
        updateAvailable: false,
      });

      expect(axios.get).toHaveBeenCalled();
      expect(getPackageJsonKey).toHaveBeenCalledWith("version");
    });

    it("should return correct version info when newer version is available", async () => {
      // Mock package version
      (getPackageJsonKey as jest.Mock).mockReturnValue("1.0.0");
      // Mock API response with newer version
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          "dist-tags": {
            latest: "2.0.0",
          },
        },
      });

      const result = await checkVersion();

      expect(result).toEqual({
        isLatest: false,
        latestVersion: "2.0.0",
        currentVersion: "1.0.0",
        updateAvailable: true,
      });
    });

    it("should use cached result if check was performed recently", async () => {
      // Mock package version
      (getPackageJsonKey as jest.Mock).mockReturnValue("1.0.0");

      // Set up cache with a recent timestamp
      process.env.assemblejs_version_check = JSON.stringify({
        isLatest: false,
        latestVersion: "3.0.0",
        timestamp: Date.now() - 1000, // 1 second ago
      });

      const result = await checkVersion();

      // Should use cached values
      expect(result).toEqual({
        isLatest: false,
        latestVersion: "3.0.0",
        currentVersion: "1.0.0",
        updateAvailable: true,
      });

      // Should not make API call since using cache
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("should ignore cached result if too old", async () => {
      // Mock package version
      (getPackageJsonKey as jest.Mock).mockReturnValue("1.0.0");

      // Set up cache with an old timestamp (25 hours ago)
      process.env.assemblejs_version_check = JSON.stringify({
        isLatest: false,
        latestVersion: "3.0.0",
        timestamp: Date.now() - 25 * 60 * 60 * 1000,
      });

      // Mock API response
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          "dist-tags": {
            latest: "4.0.0",
          },
        },
      });

      const result = await checkVersion();

      // Should use new API response, not cached values
      expect(result).toEqual({
        isLatest: false,
        latestVersion: "4.0.0",
        currentVersion: "1.0.0",
        updateAvailable: true,
      });

      // Should make API call since cache is expired
      expect(axios.get).toHaveBeenCalled();
    });

    it("should handle API errors gracefully", async () => {
      // Mock package version
      (getPackageJsonKey as jest.Mock).mockReturnValue("1.0.0");

      // Mock API failure
      (axios.get as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await checkVersion();

      // Should default to assuming current version is latest
      expect(result).toEqual({
        isLatest: true,
        latestVersion: "1.0.0",
        currentVersion: "1.0.0",
        updateAvailable: false,
      });
    });
  });

  describe("formatUpdateMessage", () => {
    it("should format message for current version", () => {
      const message = formatUpdateMessage({
        isLatest: true,
        latestVersion: "1.0.0",
        currentVersion: "1.0.0",
      });

      expect(message).toContain("You are using the latest version");
      expect(message).toContain("1.0.0");
    });

    it("should format update available message", () => {
      const message = formatUpdateMessage({
        isLatest: false,
        latestVersion: "2.0.0",
        currentVersion: "1.0.0",
      });

      expect(message).toContain("Update available");
      expect(message).toContain("Current version: 1.0.0");
      expect(message).toContain("Latest version:  2.0.0");
      expect(message).toContain("npm install -g asmbl@latest");
    });
  });
});
