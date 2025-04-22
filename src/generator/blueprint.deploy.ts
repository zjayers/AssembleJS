#!/usr/bin/env node

/**
 * ██████╗ ██╗██╗   ██╗███████╗████████╗
 * ██╔══██╗██║██║   ██║██╔════╝╚══██╔══╝
 * ██████╔╝██║██║   ██║█████╗     ██║
 * ██╔══██╗██║╚██╗ ██╔╝██╔══╝     ██║
 * ██║  ██║██║ ╚████╔╝ ███████╗   ██║
 * ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝   ╚═╝
 *
 * RIVET - AssembleJS Enterprise Deployment System
 * v1.0.0
 *
 * A professional-grade deployment solution for AssembleJS applications
 * that streamlines configuration, containerization, and CI/CD integration.
 *
 * @license MIT
 */

import path, { dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { Plop, run } from "plop";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import "./plopfiles/blueprint.deploy.plopfile";

// Get the directory name
const __dirname = dirname(fileURLToPath(import.meta.url));

// Display logo
const displayLogo = () => {
  console.log(
    chalk.cyan(`
██████╗ ██╗██╗   ██╗███████╗████████╗
██╔══██╗██║██║   ██║██╔════╝╚══██╔══╝
██████╔╝██║██║   ██║█████╗     ██║   
██╔══██╗██║╚██╗ ██╔╝██╔══╝     ██║   
██║  ██║██║ ╚████╔╝ ███████╗   ██║   
╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝   ╚═╝   
                                     
RIVET - AssembleJS Enterprise Deployment System
v1.0.0
  `)
  );
};

/**
 * Load deployment plopfile and run specified generator
 * @param {string[]} args - Command line arguments
 */
const runDeployGenerator = async (args: string[] = []) => {
  try {
    displayLogo();

    // Parse command line args
    const argv = await yargs(hideBin(process.argv))
      .option("target", {
        alias: "t",
        type: "string",
        description: "Deployment target (docker, aws, netlify, etc.)",
      })
      .option("ci", {
        type: "string",
        description: "CI/CD platform (github, gitlab, circle, jenkins, none)",
      })
      .option("non-interactive", {
        alias: "y",
        type: "boolean",
        description: "Run in non-interactive mode (requires --target)",
      })
      .help().argv;

    const spinner = ora("Preparing deployment configuration...").start();

    // Path to our deployment plopfile
    const plopfilePath = path.join(
      __dirname,
      "plopfiles/blueprint.deploy.plopfile.js"
    );

    // Set up environment variables if running in non-interactive mode
    if (argv.nonInteractive && argv.target) {
      process.env.ASMGEN_NON_INTERACTIVE = "true";
      process.env.ASMGEN_ARGS = JSON.stringify({
        target: argv.target,
        cicd: argv.ci || "none",
        useDefaults: true,
      });
      spinner.succeed("Running in non-interactive mode");
    } else {
      process.env.ASMGEN_NON_INTERACTIVE = "false";
      process.env.ASMGEN_ARGS = "";
      spinner.succeed("Ready to configure deployment");
    }

    // Prepare the plop runner
    Plop.prepare(
      {
        cwd: process.cwd(),
        configPath: plopfilePath,
        preload: [],
        completion: undefined, // Using undefined instead of false to match the type
      },
      (env) => Plop.execute(env, run as never)
    );

    console.log(
      "\n" +
        chalk.green("✓") +
        chalk.bold(" Deployment configuration complete!")
    );
    console.log("\nTo deploy your application:");
    console.log(chalk.cyan("  $ npm run deploy"));
    console.log("\nFor comprehensive documentation, visit:");
    console.log(chalk.cyan("  $ assemblejs.com/developer/deployment"));
  } catch (error) {
    console.error(chalk.red("Error:"), error);
    process.exit(1);
  }
};

// Run the generator
runDeployGenerator(process.argv.slice(2));