import axios from "axios";
import { getPackageJsonKey } from "./pkg.utils.";

const NPM_REGISTRY_URL = "https://registry.npmjs.org/asmbl";
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const VERSION_CHECK_KEY = "assemblejs_version_check";

/**
 * Check if the current version is the latest
 * Compares local version with npm registry version and caches results for 24 hours
 * @return {Promise<{isLatest: boolean, latestVersion: string, currentVersion: string}>}
 */
export async function checkVersion(): Promise<{
  isLatest: boolean;
  latestVersion: string;
  currentVersion: string;
  updateAvailable: boolean;
}> {
  const currentVersion = getPackageJsonKey<string>("version");

  // Check if we've already checked recently
  const lastCheck = getLastVersionCheck();
  if (lastCheck && Date.now() - lastCheck.timestamp < CHECK_INTERVAL) {
    return {
      isLatest: lastCheck.isLatest,
      latestVersion: lastCheck.latestVersion,
      currentVersion,
      updateAvailable: !lastCheck.isLatest,
    };
  }

  try {
    // Fetch the latest version from npm
    const response = await axios.get(NPM_REGISTRY_URL);
    const latestVersion = response.data["dist-tags"].latest;

    // Compare versions (simple string comparison works for semver)
    const isLatest = currentVersion === latestVersion;

    // Save the result
    setLastVersionCheck({
      isLatest,
      latestVersion,
      timestamp: Date.now(),
    });

    return {
      isLatest,
      latestVersion,
      currentVersion,
      updateAvailable: !isLatest,
    };
  } catch (error) {
    // If there's an error, assume we're on the latest version
    return {
      isLatest: true,
      latestVersion: currentVersion,
      currentVersion,
      updateAvailable: false,
    };
  }
}

/**
 * Get the last version check from localStorage or null
 * @return {Object|null} Last version check data or null if not found
 */
function getLastVersionCheck(): {
  isLatest: boolean;
  latestVersion: string;
  timestamp: number;
} | null {
  try {
    // In Node.js env we use a simulated local storage
    // If deployed to web, could use localStorage
    const cached = process.env[VERSION_CHECK_KEY];
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

/**
 * Save the version check results
 * @param {Object} check - The version check results
 * @param {boolean} check.isLatest - Whether the current version is the latest
 * @param {string} check.latestVersion - The latest version available
 * @param {number} check.timestamp - When the check was performed
 * @return {void}
 */
function setLastVersionCheck(check: {
  isLatest: boolean;
  latestVersion: string;
  timestamp: number;
}): void {
  try {
    // In Node.js env we use a simulated local storage
    process.env[VERSION_CHECK_KEY] = JSON.stringify(check);
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Format a version update message for the console
 * @param {Object} versionInfo - The version information
 * @param {boolean} versionInfo.isLatest - Whether the current version is the latest
 * @param {string} versionInfo.latestVersion - The latest version available
 * @param {string} versionInfo.currentVersion - The currently installed version
 * @return {string} Formatted message for display
 */
export function formatUpdateMessage(versionInfo: {
  isLatest: boolean;
  latestVersion: string;
  currentVersion: string;
}): string {
  if (versionInfo.isLatest) {
    return `You are using the latest version of AssembleJS (${versionInfo.currentVersion})`;
  }

  return `
📢 Update available! 
   Current version: ${versionInfo.currentVersion}
   Latest version:  ${versionInfo.latestVersion}
   
   Run 'npm install -g asmbl@latest' to update
  `;
}
