#!/usr/bin/env node
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import minimist from "minimist";
import { Plop, run } from "plop";
import inquirer from "inquirer";
import fs from "fs";
import "./plopfiles/blueprint.project.plopfile";
import "./plopfiles/blueprint.controller.plopfile";
import "./plopfiles/blueprint.component.plopfile";
import "./plopfiles/blueprint.factory.plopfile";
import "./plopfiles/blueprint.blueprint.plopfile";
import "./plopfiles/blueprint.service.plopfile";
import { CONSTANTS } from "../constants/blueprint.constants";
// import { simpleLogger } from "../utils/logger.utils"; // Removed unused import
import { getPackageJsonKey } from "../utils/pkg.utils.";
import { checkVersion, formatUpdateMessage } from "../utils/version.utils";
import { GENERATOR_CONFIG, OutputVerbosity } from "./common/generator.config";

// Define the cwdInsideProject function first to avoid the TS error
const cwdInsideProject = () =>
  fs.existsSync(path.join(process.cwd(), "package.json"));

// Show Welcome Messages - use console directly to avoid TS errors
console.info("\n" + CONSTANTS.welcomeBannerLogoOnly);

console.info("\n" + CONSTANTS.welcomeBannerSlim);

// Get version from package.json, but don't display if not found
try {
  // Get the version from the package.json of the CLI tool itself, not the current directory
  const version = getPackageJsonKey<string>("version");
  // Only display version if we could retrieve it
  console.debug(`➦  Version: ${version}`, "\n");
} catch (error) {
  // Silently handle error - don't display version at all
}

// Check for updates (async)
checkVersion()
  .then((versionInfo) => {
    if (!versionInfo.isLatest) {
      console.info("\n" + formatUpdateMessage(versionInfo));
    }
  })
  .catch(() => {
    // Silent fail on version check errors
  });

// Read the Process ARGS
const args = process.argv.slice(2);



const argv = minimist(args, {
  string: [
    "output",
    "type",
    "name",
    "view",
    "template",
    "parents",
    "registration-type",
    "component-name",
    "service-token",
  ],
  boolean: ["help", "register"],
  alias: {
    o: "output",
    standard: "s",
    verbose: "v",
    help: "h",
    t: "type",
    n: "name",
    v: "view",
    tpl: "template",
    rt: "registration-type",
    cn: "component-name",
    st: "service-token",
  },
  default: {
    output: "minimal",
    help: false,
  },
});

// Display help message if requested
if (argv.help || argv.h) {
  console.info(`
AssembleJS Generator (asmgen)

Usage: npx asmgen [options]

Options:
  -s, --standard       Use standard output (more detailed than default)
  -v, --verbose        Use verbose output (maximum information and examples)
  -o, --output=MODE    Set output mode [minimal|standard|verbose] (default: minimal)
  -h, --help           Display this help message


Examples:
  npx asmgen                                    # Run with minimal output (default)
  npx asmgen --standard                         # Run with standard output
  npx asmgen --verbose                          # Run with verbose output
  npx asmgen --output=standard                  # Run with standard output
  npx asmgen -s                                 # Run with standard output (shorthand)
  
For more information, visit: https://docs.assemblejs.com/cli/asmgen
`);
  process.exit(0);
}

// Set output verbosity based on command line arguments
// Default is already MINIMAL from generator.config.ts
if (argv.standard || argv.s) {
  GENERATOR_CONFIG.setOutputVerbosity(OutputVerbosity.STANDARD);
} else if (argv.verbose || argv.v) {
  GENERATOR_CONFIG.setOutputVerbosity(OutputVerbosity.VERBOSE);
} else if (argv.output) {
  // Handle explicit output option setting
  const outputValue = argv.output.toLowerCase();
  if (outputValue === "standard") {
    GENERATOR_CONFIG.setOutputVerbosity(OutputVerbosity.STANDARD);
  } else if (outputValue === "verbose") {
    GENERATOR_CONFIG.setOutputVerbosity(OutputVerbosity.VERBOSE);
  } else {
    // Default to minimal for any other value
    GENERATOR_CONFIG.setOutputVerbosity(OutputVerbosity.MINIMAL);
  }
}

// Display output level in welcome message for clarity
const outputMode = GENERATOR_CONFIG.outputVerbosity;

// Add visual indicators for non-minimal output modes
if (outputMode === OutputVerbosity.STANDARD) {
  console.info(`\n📋 STANDARD OUTPUT MODE 📋`);
  console.info(`   More detailed information will be displayed`);
  console.info(`   Use default mode for minimal output`);
} else if (outputMode === OutputVerbosity.VERBOSE) {
  console.info(`\n📚 VERBOSE OUTPUT MODE 📚`);
  console.info(`   Maximum information and examples will be displayed`);
  console.info(`   Use default mode for minimal output`);
}

// Get the dirname of this file
const __dirname = dirname(fileURLToPath(import.meta.url));

// Set up choices based on existence of package.json
const choices = cwdInsideProject()
  ? {
      // Inside a project - show all options EXCEPT Project
      Blueprint: "./plopfiles/blueprint.blueprint.plopfile.js",
      Component: "./plopfiles/blueprint.component.plopfile.js",
      Factory: "./plopfiles/blueprint.factory.plopfile.js",
      Controller: "./plopfiles/blueprint.controller.plopfile.js",
      Model: "./plopfiles/blueprint.model.plopfile.js",
      Service: "./plopfiles/blueprint.service.plopfile.js",
    }
  : {
      // No package.json exists - only show Project option
      Project: "./plopfiles/blueprint.project.plopfile.js",
    };

// Create an object to store the answers
const componentTypeAnswer = await inquirer.prompt([
  {
    type: "list",
    name: "COMPONENT_TYPE",
    message: "What would you like to generate with AssembleJS?",
    choices: Object.keys(choices),
  },
]);

// Clear any existing environment variables
process.env.ASMGEN_ARGS = "";
process.env.ASMGEN_NON_INTERACTIVE = "false";

// Prepare the plop runner
Plop.prepare(
  {
    cwd: argv.cwd,
    configPath: path.join(
      __dirname,
      // @ts-expect-error
      choices[componentTypeAnswer.COMPONENT_TYPE]
    ),
    preload: argv.preload || [],
    completion: argv.completion,
  },
  (env) => Plop.execute(env, run as never)
);
