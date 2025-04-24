#!/usr/bin/env node
import { getServerRoot } from "../utils/directory.utils";
import { startScriptIslandWatcher } from "./development/script.island.watcher";
import { startBlueprintDevServer } from "./development/dev.server";
import { startStyleIslandWatcher } from "./development/style.island.watcher";
import rimraf from "rimraf";
import path from "path";
import { logWithBadge, printHeaderBox } from "./common/visual.utils";

// Get the server root
const serverRoot = getServerRoot();

/**
 * Start the AssembleJS development environment
 */
async function startDevelopment() {
  printHeaderBox("AssembleJS Development");

  // Clear the dist directory
  try {
    rimraf.sync(path.join(serverRoot, "dist"));
    logWithBadge("Cleared dist directory", "success");
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logWithBadge(`Failed to clear dist directory: ${errorMsg}`, "error");
  }

  // Start the island watchers
  logWithBadge("Starting Island Watchers...", "info");
  await startIslandWatchers();

  // Start the dev server
  await startBlueprintDevServer(serverRoot);
}

/**
 * Start the Script and Style island watchers.
 * @return {Promise<void>} - The promise to await.
 */
async function startIslandWatchers() {
  logWithBadge("Starting Script Island Watcher...", "info");
  await startScriptIslandWatcher(serverRoot);

  logWithBadge("Starting Style Island Watcher...", "info");
  startStyleIslandWatcher(serverRoot);

  logWithBadge("All Island Watchers running", "success");
}

// Run the development environment
startDevelopment().catch((error: unknown) => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  printHeaderBox("Development Startup Failed", require("chalk").red);
  logWithBadge(errorMsg, "error");
  process.exit(1);
});
