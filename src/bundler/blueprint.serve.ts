#!/usr/bin/env node
import { getServerRoot } from "../utils/directory.utils";
import { startScriptIslandWatcher } from "./development/script.island.watcher";
import { startBlueprintDevServer } from "./development/dev.server";
import { startStyleIslandWatcher } from "./development/style.island.watcher";
import rimraf from "rimraf";
import path from "path";

// Get the server root
const serverRoot = getServerRoot();
rimraf(path.join(serverRoot, "dist"), async () => {
  console.log("Starting island watchers...");
  await startIslandWatchers();
  console.log("Starting AssembleJS dev server...");
  await startBlueprintDevServer(serverRoot);
});

/**
 * Start the Script and Style island watchers.
 * @return {Promise<void>} - The promise to await.
 * @author Zach Ayers
 */
async function startIslandWatchers() {
  await startScriptIslandWatcher(serverRoot);

  // TODO, restart style watcher for newly added style files
  startStyleIslandWatcher(serverRoot);
}
