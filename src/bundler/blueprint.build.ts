#!/usr/bin/env node

import { startBlueprintDevServer } from "./development/dev.server";
import { getServerRoot } from "../utils/directory.utils";

// TODO: Finish build pipeline
// Get the server root
const serverRoot = getServerRoot();

void startBlueprintDevServer(serverRoot);
