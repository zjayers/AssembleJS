import path from "path";
import fs from "fs";
import jsonFile from "jsonfile";
// import { logger } from "./logger.utils"; // Removed unused import
import { fileURLToPath } from "url";

export interface PackageJson {
  version: string;
  scripts: { [key: string]: string };

  [key: string]: unknown;
}

/**
 * Get the current project's package.json file path.
 * @param {boolean | undefined} useCwd - Use the current working directory.
 * Defaults to 'false'.
 * If this is not passed in,
 * the package.json file will be resolved to the '@assemble' project.
 * @return {string} - The package.json file path.
 * @author Zach Ayers
 */
function getPkgFilePath(useCwd = false): string {
  let pkgFilePath: string;

  if (useCwd) {
    pkgFilePath = path.join(process.cwd(), "package.json");
  } else {
    // Check if we're in a test environment
    if (process.env.NODE_ENV === "test") {
      // In tests, use a simpler path resolution
      pkgFilePath = path.join(process.cwd(), "package.json");
    } else {
      try {
        const moduleUrl =
          typeof __filename !== "undefined"
            ? __filename
            : typeof require.main?.filename !== "undefined"
            ? require.main.filename
            : typeof (global as any).import?.meta?.url !== "undefined"
            ? fileURLToPath((global as any).import.meta.url)
            : process.cwd();

        pkgFilePath = path.join(
          path.dirname(moduleUrl),
          "..",
          "..",
          "package.json"
        );
      } catch (error) {
        // Fallback to current directory
        pkgFilePath = path.join(process.cwd(), "package.json");
      }
    }
  }

  if (!fs.existsSync(pkgFilePath)) {
    // Just throw error without console output
    throw new Error(
      `No 'package.json' file was found in directory: ${pkgFilePath}`
    );
  }

  return pkgFilePath;
}

/**
 * Read the user's package.json file.
 * @category (Utilities) [Project Readers]
 * @param {boolean} useCwd - Use the current working directory.
 * @return {PackageJson} - The package.json file.
 * @author Zach Ayers
 */
function readPackageJson(useCwd = false): PackageJson {
  // Read the users package.json file
  const pkgFilePath = getPkgFilePath(useCwd);
  // Read the project type from the file
  return jsonFile.readFileSync(pkgFilePath) as PackageJson;
}

/**
 * Read the user's package.json file.
 * @category (Utilities) [Project Readers]
 * @param {PackageJson} packageJson - The package.json file.
 * @param {boolean} useCwd - Use the current working directory.
 * @return {void} - Nothing.
 * @author Zach Ayers
 */
function writePackageJson(packageJson: PackageJson, useCwd = false): void {
  // Read the users package.json file
  const pkgFilePath = getPkgFilePath(useCwd);
  // Read the project type from the file
  jsonFile.writeFileSync(pkgFilePath, packageJson, { spaces: 2 });
}

/**
 * Add a new script to the package.json file
 * @param {string} scriptName - The name of the script to add.
 * @param {string} script - The script to add.
 * @param {boolean} cwd - Use the current working directory.
 * @author Zach Ayers
 */
export function addPackageJsonScript(
  scriptName: string,
  script: string,
  cwd = false
): void {
  const packageJson = readPackageJson(cwd);
  if (packageJson.scripts[scriptName] !== undefined) {
    return;
  }
  packageJson.scripts[scriptName] = script;
  writePackageJson(packageJson, cwd);
}

/**
 * Add a new key to the package.json file
 * @param {string} key - The name of the key to add.
 * @param {unknown} value - The value to add.
 * @param {boolean} cwd - Use the current working directory.
 * @author Zach Ayers
 */
export function addPackageJsonKey(
  key: string,
  value: unknown,
  cwd = false
): void {
  const packageJson = readPackageJson(cwd);
  packageJson[key] = value;
  writePackageJson(packageJson, cwd);
}

/**
 * Add a new key to the package.json file
 * @param {string} key - The name of the key to add.
 * @param {boolean} cwd - Use the current working directory.
 * @return {T} - The value of the key.
 * @author Zach Ayers
 */
export function getPackageJsonKey<T>(key: string, cwd = false): T {
  const packageJson = readPackageJson(cwd);
  return packageJson[key] as T;
}
