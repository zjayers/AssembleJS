#!/usr/bin/env node
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

function compileStyleByPath(serverRoot: any, fullPath: any) {
  const fileContent = fs.readFileSync(fullPath, "utf8");
  const scopeInjector = buildCssScopeInjector(serverRoot, fullPath);
  const wrappedContent = scopeInjector.injector + "{" + fileContent + "}";
  const outputPath = fullPath
    .replaceAll("src", CONSTANTS.buildOutputFolder)
    .replace(".scss", ".css");

  const result = sass.compileString(wrappedContent, {
    style: "compressed",
    sourceMapIncludeSources: true,
    sourceMap: true,
    verbose: true,
  });

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

function emitFile(compileResult: { css: any; outputPath: any; srcPath?: any }) {
  const { css, outputPath } = compileResult;
  ensureDirectoryExistence(outputPath);
  console.log("Compiling: " + path.basename(outputPath));
  fs.writeFileSync(outputPath, css);
}

// Process styles without watching
function processStyles(serverRoot: string) {
  console.log("Processing styles...");
  const styleFiles = glob.sync(`./src/**/*.{scss,css}`, {
    cwd: serverRoot,
  });

  styleFiles.forEach((file) => {
    const compileResult = compileStyleByPath(
      serverRoot,
      path.join(serverRoot, file)
    );
    emitFile(compileResult);
  });

  console.log(`Processed ${styleFiles.length} style files`);
}

// Main build function
async function buildBlueprint() {
  console.log("Starting AssembleJS production build...");

  // Clear the dist directory
  rimraf.sync(path.join(serverRoot, "dist"));
  console.log("Cleared dist directory");

  try {
    // 1. Process styles (compile CSS/SCSS)
    processStyles(serverRoot);

    // 2. Build script islands
    console.log("Building script islands...");
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

    // Build script islands
    const buildPromises = [];
    for (const island of scriptIslands) {
      buildPromises.push(
        build({
          mode: "production",
          configFile: false,
          envDir: serverRoot,
          envPrefix: CONSTANTS.env.prefix.key,
          plugins: [preact()],
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
      );
    }

    await Promise.allSettled(buildPromises);

    // 3. Build the server
    console.log("Building server...");
    const serverEntryFile = "server.ts";
    const serverEntryPath = path.join(process.cwd(), "src", serverEntryFile);

    await build({
      mode: "production",
      configFile: false,
      envDir: serverRoot,
      envPrefix: CONSTANTS.env.prefix.key,
      plugins: [preact()],
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

    console.log("AssembleJS production build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

// Run the build
buildBlueprint().catch(console.error);
