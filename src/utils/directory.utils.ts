import path from "path";
import fs from "fs";

/**
 * Check if a directory exists, if it does not exist, create it.
 * @param {string} filePath - The path to the directory to check/create.
 * @author Zach Ayers
 */
export function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

/**
 * Get the current woking directory. Typically the server root of a project.
 * @return {string} - The current working directory.
 * @author Zach Ayers
 */
export const getServerRoot = () => process.cwd();
