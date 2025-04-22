#!/usr/bin/env node
import { getPackageJsonKey } from "../utils/pkg.utils.";

// Get AssembleJS's current version
try {
  const currentAssembleJSVersion = getPackageJsonKey<string>("version");
  // Only show version if it's found
  console.info(`➦  Version: ${currentAssembleJSVersion}`);
} catch (error) {
  // Silent fail - don't show version if not found
}
