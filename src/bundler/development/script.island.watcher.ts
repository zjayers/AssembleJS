/* eslint-disable valid-jsdoc */
import path from "path";
import { build } from "vite";
import glob from "glob";
import preact from "@preact/preset-vite";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { logWithBadge, logProgress } from "../common/visual.utils";

/**
 * Start the script island watcher to compile and watch TS files
 * @param serverRoot The server root directory
 */
export const startScriptIslandWatcher = async (serverRoot: string) => {
  // Find all script islands
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
    return;
  }

  logWithBadge(`Found ${scriptIslands.length} script islands to watch`, "info");

  // Track build statistics
  const buildPromises = [];
  const results = [];
  let completedIslands = 0;
  const totalIslands = scriptIslands.length;

  // Initialize progress bar
  logProgress(0, totalIslands, "Building script islands:");

  // Start building each island
  for (const island of scriptIslands) {
    const promise = build({
      mode: "development",
      configFile: false,
      envDir: serverRoot,
      envPrefix: CONSTANTS.env.prefix.key,
      plugins: [
        preact({
          babel: {
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                { runtime: "automatic", importSource: "preact" },
              ],
            ],
          },
        }),
      ],
      logLevel: "silent", // Suppress Vite logs to keep our UI clean
      optimizeDeps: {
        include: [
          "preact/devtools",
          "preact/debug",
          "preact/jsx-runtime",
          "preact",
          "preact/hooks",
        ],
      },
      build: {
        sourcemap: true,
        emptyOutDir: false,
        ssr: true,
        watch: {
          include: ["./src/**/*.ts", "./src/**/*.tsx"],
          buildDelay: 100,
        },
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
              "preact/devtools": "AssembleJS.preact.devtools",
              "preact/hooks": "AssembleJS.preact.hooks",
              "preact/jsx-runtime": "AssembleJS.preact.runtime",
              "preact/debug": "AssembleJS.preact.debug",
            },
            entryFileNames: island.outputPath,
          },
        },
      },
    })
      .then((result) => {
        completedIslands++;
        logProgress(completedIslands, totalIslands, "Building script islands:");
        return { island, result, success: true };
      })
      .catch((error: unknown) => {
        completedIslands++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        logProgress(completedIslands, totalIslands, "Building script islands:");
        logWithBadge(
          `Failed to build ${island.baseName}: ${errorMsg}`,
          "error"
        );
        return { island, error, success: false };
      });

    buildPromises.push(promise);
  }

  // Wait for all builds to complete
  results.push(...(await Promise.all(buildPromises)));

  // Report build results
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
    logWithBadge(`Script watcher active - watching for changes`, "info");
  }
};
