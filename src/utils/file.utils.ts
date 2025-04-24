import fs from "fs";

/**
 * Check if a file exists at a given path. If it does not, throw an error to the console.
 * @param {string} path - The path to the file to check.
 * @param {string} paths - The paths to report that make up the file path.
 * @throws {Error} If the file does not exist.
 * @return {void}
 * @author Zachariah Ayers
 * @category Utils
 * @public
 */
export function assertFileExists(path: string, ...paths: string[]) {
  if (!fs.existsSync(path)) {
    throw new Error(
      `[ ${paths.join(" -> ")} ] does not exist at address: [ ${path} ]`
    );
  }
}

/**
 * Check if a file exists at a given path.
 * @param {string} path - The path to the file to check.
 * @return {boolean} True if the file exists, false otherwise.
 * @author Zachariah Ayers
 * @category Utils
 * @public
 */
export function checkFileExists(path: string): boolean {
  return fs.existsSync(path);
}
