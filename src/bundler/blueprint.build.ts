#!/usr/bin/env node
/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import { getServerRoot } from "../utils/directory.utils";
import path from "path";
import { build } from "vite";
import preact from "@preact/preset-vite";
import { CONSTANTS } from "../constants/blueprint.constants";
import glob from "glob";
import rimraf from "rimraf";
import fs from "fs";
import sass from "sass";
import chalk from "chalk";
import {
  logWithBadge,
  logProgress,
  printHeaderBox,
  createServerTransformPlugin,
} from "./common/visual.utils";
import { ensureDirectoryExistence } from "../utils/directory.utils";

// Get the server root
const serverRoot = getServerRoot();

// Style processing functions from style.island.watcher.ts
function buildCssScopeInjector(serverRoot: string, fullPath: string) {
  const scopeClass = CONSTANTS.componentClassIdentifier;
  const relativePath = path.relative(serverRoot, fullPath);
  const relativePathParts = relativePath.split(path.sep);
  const relativePathPartsWithoutFile = relativePathParts.slice(0, -1);
  const [parentDir, node, view] = relativePathPartsWithoutFile.slice(-3);

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
 * Compiles a SCSS/CSS file with proper scope injection
 * @param serverRoot The server root directory path
 * @param fullPath The full path to the style file
 * @returns Object containing compiled CSS, output path, and source path
 */
function compileStyleByPath(serverRoot: string, fullPath: string) {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(fullPath, "utf8");

    // Generate scope injector for CSS isolation
    const scopeInjector = buildCssScopeInjector(serverRoot, fullPath);
    const wrappedContent = scopeInjector.injector + "{" + fileContent + "}";

    // Determine the output path
    const outputPath = fullPath
      .replaceAll("src", CONSTANTS.buildOutputFolder)
      .replace(".scss", ".css");

    // Compile the SCSS
    const result = sass.compileString(wrappedContent, {
      style: "compressed",
      sourceMapIncludeSources: true,
      sourceMap: true,
      verbose: true,
      loadPaths: [path.dirname(fullPath), serverRoot], // Allow imports from style file location and server root
    });

    // Generate source map
    const sm = JSON.stringify(result.sourceMap);
    const smBase64 = (Buffer.from(sm, "utf8") || "").toString("base64");
    const smComment =
      "/*# sourceMappingURL=data:application/json;charset=utf-8;base64," +
      smBase64 +
      " */";

    // Fix :root selector scope
    const rootedCss = result.css.replaceAll(
      `${scopeInjector.injector} :root`,
      scopeInjector.injector
    );

    // Combine CSS with source map
    const css = rootedCss + "\n".repeat(2) + smComment;

    return {
      css,
      outputPath,
      srcPath: fullPath,
      success: true,
    };
  } catch (error: unknown) {
    // Get error message safely
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Generate a minimal CSS file with error information
    const errorCss = `
/* ======================================= */
/* ERROR: Failed to compile SCSS/CSS file  */
/* Filename: ${path.basename(fullPath)}    */
/* Error: ${errorMsg}                      */
/* ======================================= */
    `;

    // Create output path even if we failed
    const outputPath = fullPath
      .replaceAll("src", CONSTANTS.buildOutputFolder)
      .replace(".scss", ".css");

    // Return error information but allow build to continue
    return {
      css: errorCss,
      outputPath,
      srcPath: fullPath,
      success: false,
      error: error instanceof Error ? error : new Error(errorMsg),
    };
  }
}

/**
 * Emits a compiled CSS file to the output path
 * @param compileResult The compilation result containing CSS and output path
 * @returns True if successful, false otherwise
 */
function emitFile(compileResult: {
  css: string;
  outputPath: string;
  srcPath: string;
  success?: boolean;
  error?: Error;
}): boolean {
  const { css, outputPath } = compileResult;
  const fileName = path.basename(outputPath);

  try {
    // Ensure the directory exists
    ensureDirectoryExistence(outputPath);

    // Write the file
    fs.writeFileSync(outputPath, css);

    // Log successful write for error cases (to show we created a CSS file despite SCSS errors)
    if (compileResult.success === false) {
      logWithBadge(
        `Generated fallback CSS for ${fileName} (contains error details)`,
        "warning"
      );
    }

    return true;
  } catch (error: unknown) {
    // Log the error but don't throw to allow other files to continue
    const errorMsg = error instanceof Error ? error.message : String(error);
    logWithBadge(`Failed to write ${fileName}: ${errorMsg}`, "error");
    return false;
  }
}

/**
 * Process all style files in parallel
 * @param serverRoot The server root directory path
 * @returns Promise that resolves when all styles are processed
 */
async function processStyles(serverRoot: string) {
  logWithBadge("Processing styles...", "info");

  const styleFiles = glob.sync(`./src/**/*.{scss,css}`, {
    cwd: serverRoot,
  });

  if (styleFiles.length === 0) {
    logWithBadge("No style files found", "info");
    return;
  }

  // Track statistics
  let processed = 0;
  let successCount = 0;
  let errorCount = 0;

  // Process in parallel with Promise.all for better performance
  await Promise.all(
    styleFiles.map(async (file) => {
      try {
        // Compile the style file
        const compileResult = compileStyleByPath(
          serverRoot,
          path.join(serverRoot, file)
        );

        // Track compilation status
        if (compileResult.success) {
          successCount++;
        } else {
          errorCount++;
          const errorMsg = compileResult.error?.message || "Unknown error";
          logWithBadge(
            `Failed to compile ${path.basename(file)}: ${errorMsg}`,
            "error"
          );
        }

        // Emit the file regardless (will contain error CSS if compilation failed)
        emitFile(compileResult);

        // Update progress
        processed++;
        logProgress(processed, styleFiles.length, "Compiling styles:");
      } catch (error: unknown) {
        // This should rarely happen since compileStyleByPath handles its own errors
        errorCount++;
        processed++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        logWithBadge(`Error processing ${file}: ${errorMsg}`, "error");
        logProgress(processed, styleFiles.length, "Compiling styles:");
      }
    })
  );

  // Log final status with success/error counts
  if (errorCount > 0) {
    logWithBadge(
      `Processed ${styleFiles.length} style files (${successCount} succeeded, ${errorCount} failed)`,
      "warning"
    );
  } else {
    logWithBadge(
      `Processed ${styleFiles.length} style files successfully`,
      "success"
    );
  }
}

// Main build function
async function buildBlueprint() {
  printHeaderBox("AssembleJS Production Build");

  // Start timing the build
  const startTime = Date.now();

  // Clear the dist directory
  try {
    rimraf.sync(path.join(serverRoot, "dist"));
    logWithBadge("Cleared dist directory", "success");
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logWithBadge(`Failed to clear dist directory: ${errorMsg}`, "error");
  }

  try {
    // 1. Process styles (compile CSS/SCSS)
    await processStyles(serverRoot);

    // 2. Build script islands
    logWithBadge("Building script islands...", "info");
    const scriptIslands = glob
      .sync(`./src/**/*.ts`, {
        cwd: serverRoot,
        ignore: ["./src/server.ts", "./src/**/*.controller.ts"],
      })
      .map((file) => path.join(serverRoot, file))
      .map((fileName) => ({
        fileName,
        baseName: path.basename(fileName),
        outputPath: path.normalize(
          path
            .relative(serverRoot, fileName)
            .replaceAll(/src/g, "./")
            .replaceAll(".ts", ".js")
        ),
      }));

    if (scriptIslands.length === 0) {
      logWithBadge("No script islands found", "info");
    } else {
      // Build script islands with progress tracking
      const buildPromises = [];
      const results = [];
      const totalIslands = scriptIslands.length;
      let completedIslands = 0;

      logProgress(0, totalIslands, "Building script islands:");

      for (const island of scriptIslands) {
        const promise = build({
          mode: "production",
          configFile: false,
          envDir: serverRoot,
          envPrefix: CONSTANTS.env.prefix.key,
          plugins: [preact()],
          logLevel: "silent", // Suppress Vite logs to keep our UI clean
          build: {
            minify: true,
            emptyOutDir: false,
            outDir: path.join(serverRoot, "dist"),
            lib: {
              entry: island.fileName,
              name: island.baseName,
              formats: ["iife"],
              fileName: island.baseName,
            },
            rollupOptions: {
              external: ["assemblejs", "preact"],
              output: {
                globals: {
                  asmbl: "AssembleJS",
                  preact: "AssembleJS.preact",
                  "preact/hooks": "AssembleJS.preact.hooks",
                  "preact/jsx-runtime": "AssembleJS.preact.runtime",
                },
                entryFileNames: island.outputPath,
              },
            },
          },
        })
          .then((result) => {
            completedIslands++;
            logProgress(
              completedIslands,
              totalIslands,
              "Building script islands:"
            );
            return { island, result, success: true };
          })
          .catch((error: unknown) => {
            completedIslands++;
            logProgress(
              completedIslands,
              totalIslands,
              "Building script islands:"
            );
            const errorMsg =
              error instanceof Error ? error.message : String(error);
            logWithBadge(
              `Failed to build ${island.baseName}: ${errorMsg}`,
              "error"
            );
            return { island, error, success: false };
          });

        buildPromises.push(promise);
      }

      results.push(...(await Promise.all(buildPromises)));

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (failCount > 0) {
        logWithBadge(
          `${successCount}/${totalIslands} islands built successfully, ${failCount} failed`,
          "warning"
        );
      } else {
        logWithBadge(
          `${successCount} script islands built successfully`,
          "success"
        );
      }
    }

    // 3. Build the server
    logWithBadge("Building server...", "info");
    const serverEntryFile = "server.ts";
    const serverEntryPath = path.join(process.cwd(), "src", serverEntryFile);

    // Create a Vite plugin to transform the server file
    const serverTransformPlugin = createServerTransformPlugin(
      serverRoot,
      "production"
    );

    // Create a spinner for server build
    logWithBadge("Compiling server...", "info");

    // Build the server with Vite
    try {
      await build({
        mode: "production",
        configFile: false,
        envDir: serverRoot,
        envPrefix: CONSTANTS.env.prefix.key,
        plugins: [serverTransformPlugin, preact()],
        logLevel: "silent", // Suppress Vite logs
        build: {
          minify: true,
          outDir: path.join(serverRoot, "dist"),
          emptyOutDir: false,
          ssr: true,
          rollupOptions: {
            input: serverEntryPath,
            output: {
              format: "esm",
              entryFileNames: "server.js",
            },
          },
        },
      });

      logWithBadge("Server built successfully", "success");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logWithBadge(`Server build failed: ${errorMsg}`, "error");
      throw error;
    }

    // Calculate build time
    const endTime = Date.now();
    const buildTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);

    // Print build summary
    printHeaderBox("Build Summary");

    logWithBadge(
      `AssembleJS production build completed in ${buildTimeSeconds}s`,
      "success"
    );
  } catch (error: unknown) {
    printHeaderBox("Build Failed", chalk.red);

    const errorMsg = error instanceof Error ? error.message : String(error);
    logWithBadge(errorMsg, "error");

    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(error.stack.split("\n").slice(1).join("\n")));
    }

    process.exit(1);
  }
}

// Run the build
buildBlueprint().catch(console.error);
