import fs from "fs";
import glob from "glob";
import path from "path";
import sass, { StringOptions } from "sass";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { ensureDirectoryExistence } from "../../utils/directory.utils";

/**
 * SCSS BASE OPTIONS
 * @type {StringOptions<"sync">}
 */
const SCSS_BASE_OPTIONS: StringOptions<"sync"> = {
  style: "compressed",
  sourceMapIncludeSources: true,
  sourceMap: true,
  verbose: true,
};

/**
 * Build the injector string to prefix transformed files.
 * @description This is normally used to add the component identifiers to a css scope.
 * @param {string} serverRoot - The server root path.
 * @param {string} fullPath - The full path to the file.
 * @return {{node: string, view: string, scopeClass: string, injector: string}} - The injector object with details.
 * @author Zach Ayers
 */
function buildCssScopeInjector(serverRoot: string, fullPath: string) {
  const scopeClass = CONSTANTS.componentClassIdentifier;

  // Relative to the CWD
  const relativePath = path.relative(serverRoot, fullPath);
  const relativePathParts = relativePath.split(path.sep);
  const relativePathPartsWithoutFile = relativePathParts.slice(0, -1);

  // Get last three elements of the array
  const [parentDir, node, view] = relativePathPartsWithoutFile.slice(-3);

  // Return all parts of the injector
  return {
    fullPath,
    scopeClass,
    parentDir,
    node,
    view,
    injector: `.${scopeClass}.${node}.${view}`,
  };
}

/**
 * Compile a style file given an arbitraty path.
 * This will compile the file and place it in the dist folder, with a source map alongside.
 * @param {string} serverRoot - The server root path.
 * @param {string} fullPath - The full path to the file.
 * @return {{css: string, outputPath: string}} - The css and output path.
 * @author Zach Ayers
 */
function compileStyleByPath(serverRoot: string, fullPath: string) {
  // TODO: Handle sourcemaps for dev mode vs build mode
  // TODO: Gracefully display errors to user and don't exit dev server
  const fileContent = fs.readFileSync(fullPath, "utf8");
  const scopeInjector = buildCssScopeInjector(serverRoot, fullPath);
  const wrappedContent = scopeInjector.injector + "{" + fileContent + "}";
  const outputPath: string = fullPath
    .replaceAll("src", CONSTANTS.buildOutputFolder)
    .replace(".scss", ".css");
  const result = sass.compileString(wrappedContent, SCSS_BASE_OPTIONS);
  const sm = JSON.stringify(result.sourceMap);
  const smBase64 = (Buffer.from(sm, "utf8") || "").toString("base64");
  const smComment =
    "/*# sourceMappingURL=data:application/json;charset=utf-8;base64," +
    smBase64 +
    " */";
  const rootedCss = result.css.replaceAll(
    `${scopeInjector.injector} :root`,
    scopeInjector.injector
  );
  const css = rootedCss + "\n".repeat(2) + smComment;

  return {
    css,
    outputPath,
    srcPath: fullPath,
  };
}

/**
 * Write a file to the local system.
 * @param {ReturnType<any>} compileResult - The result of the compile.
 * @author Zach Ayers
 */
function emitFile(compileResult: ReturnType<typeof compileStyleByPath>) {
  const { css, outputPath } = compileResult;
  ensureDirectoryExistence(outputPath);
  console.log("Compiling: " + path.basename(outputPath));
  fs.writeFileSync(outputPath, css);
}

/**
 * Start the CSS,SCSS compiler.
 * @description The compiler will watch any SCSS files currently in the project on startup.
 * @todo Add ability to auto pickup new files and compile them. This can likely be done with fs.watch() surrounding this island watcher. Possibly make this file a single flow and wrap in a watcher instead. This will allow for more flexibility in the future.
 * @param {string} serverRoot - The server root path.
 * @author Zach Ayers
 */
export function startStyleIslandWatcher(serverRoot: string) {
  // Gather SCSS files
  glob
    .sync(`./src/**/*.{scss,css}`, {
      cwd: serverRoot,
    })
    .map((file) => compileStyleByPath(serverRoot, path.join(serverRoot, file)))
    .forEach((compileResult) => {
      emitFile(compileResult);

      // Add a watch on the file to handle next change
      fs.watch(compileResult.srcPath, { persistent: true }, () => {
        // write the changes to disk
        const newCompile = compileStyleByPath(
          serverRoot,
          compileResult.srcPath
        );
        emitFile(newCompile);
      });
    });
}
