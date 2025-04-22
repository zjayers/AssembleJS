#!/usr/bin/env node

/**
 * REDLINE - AssembleJS Code Quality Tool
 *
 * This script runs ESLint and Prettier using AssembleJS configurations.
 * It's designed to provide a consistent code style across projects.
 *
 * Usage:
 *   npm run lint                    - Run linting checks
 *   npm run lint -- --fix           - Fix issues automatically
 *   npm run lint -- --eslint-only   - Run only ESLint
 *   npm run lint -- --prettier-only - Run only Prettier
 *   npm run lint -- --no-custom-config - Skip AssembleJS ESLint config (use defaults)
 */

import path from "path";
import { execSync } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// In ESM modules, __filename and __dirname aren't available, so we need to create them
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create require function for resolving package.json
const require = createRequire(import.meta.url);

// ANSI color codes for prettier terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

// Terminal graphics
const REDLINE_LOGO = `${colors.red}                                                                  ${colors.reset}
${colors.red}                                                                             ${colors.reset}
${colors.red}${colors.bright}${colors.red}██████${colors.reset}${colors.red}╗ ${colors.bright}${colors.red}███████${colors.reset}${colors.red}╗${colors.bright}${colors.red}██████${colors.reset}${colors.red}╗ ${colors.bright}${colors.red}██${colors.reset}${colors.red}╗     ${colors.bright}${colors.red}██${colors.reset}${colors.red}╗${colors.bright}${colors.red}███${colors.reset}${colors.red}╗  ${colors.bright}${colors.red} ██${colors.reset}${colors.red}╗${colors.bright}${colors.red}███████${colors.reset}${colors.red}╗     ${colors.reset}
${colors.red}${colors.bright}${colors.red}██${colors.reset}${colors.red}╔══${colors.bright}${colors.red}██${colors.reset}${colors.red}╗${colors.bright}${colors.red}██${colors.reset}${colors.red}╔════╝${colors.bright}${colors.red}██${colors.reset}${colors.red}╔══${colors.bright}${colors.red}██${colors.reset}${colors.red}╗${colors.bright}${colors.red}██${colors.reset}${colors.red}║     ${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}████${colors.reset}${colors.red}╗ ${colors.bright}${colors.red} ██${colors.reset}${colors.red}║${colors.bright}${colors.red}██${colors.reset}${colors.red}╔════╝     ${colors.reset}
${colors.red}${colors.bright}${colors.red}██████${colors.reset}${colors.red}╔╝${colors.bright}${colors.red}█████${colors.reset}${colors.red}╗  ${colors.bright}${colors.red}██${colors.reset}${colors.red}║  ${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}██${colors.reset}${colors.red}║     ${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}██${colors.reset}${colors.red}╔${colors.bright}${colors.red}██${colors.reset}${colors.red}╗${colors.bright}${colors.red} ██${colors.reset}${colors.red}║${colors.bright}${colors.red}█████${colors.reset}${colors.red}╗       ${colors.reset}
${colors.red}${colors.bright}${colors.red}██${colors.reset}${colors.red}╔══${colors.bright}${colors.red}██${colors.reset}${colors.red}╗${colors.bright}${colors.red}██${colors.reset}${colors.red}╔══╝  ${colors.bright}${colors.red}██${colors.reset}${colors.red}║  ${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}██${colors.reset}${colors.red}║     ${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}██${colors.reset}${colors.red}║╚${colors.bright}${colors.red}██${colors.reset}${colors.red}╗${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}██${colors.reset}${colors.red}╔══╝       ${colors.reset}
${colors.red}${colors.bright}${colors.red}██${colors.reset}${colors.red}║  ${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}███████${colors.reset}${colors.red}╗${colors.bright}${colors.red}██████${colors.reset}${colors.red}╔╝${colors.bright}${colors.red}███████${colors.reset}${colors.red}╗${colors.bright}${colors.red}██${colors.reset}${colors.red}║${colors.bright}${colors.red}██${colors.reset}${colors.red}║ ╚${colors.bright}${colors.red}████${colors.reset}${colors.red}║${colors.bright}${colors.red}███████${colors.reset}${colors.red}╗     ${colors.reset}
${colors.red}╚═╝  ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝     ${colors.reset}
${colors.red}                                                                  ${colors.reset}`;

// Helper functions for better output
const printHeader = (text) => {
  console.log(`\n${colors.bright}${text}${colors.reset}`);
};

const printSuccess = (text) => {
  console.log(`${colors.green}✓ ${text}${colors.reset}`);
};

const printInfo = (text) => {
  console.log(`${colors.blue}ℹ ${text}${colors.reset}`);
};

const printWarning = (text) => {
  console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`);
};

const printError = (text) => {
  console.log(`${colors.red}✖ ${text}${colors.reset}`);
};

const printTip = (text) => {
  console.log(`${colors.cyan}💡 ${text}${colors.reset}`);
};

/**
 * Main function that runs the linting process
 */
async function main() {
  // Show logo
  console.log(REDLINE_LOGO);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const isFixMode = args.includes("--fix");
  const isPrettierOnly = args.includes("--prettier-only");
  const isEslintOnly = args.includes("--eslint-only");
  const isDebugMode = args.includes("--debug");
  const skipCustomConfig = args.includes("--no-custom-config");

  // Print mode
  if (isFixMode) {
    printInfo(`Running in FIX mode - will attempt to fix issues automatically`);
  } else {
    printInfo(`Running in CHECK mode - will report issues without fixing`);
  }

  if (isPrettierOnly) {
    printInfo(`Running Prettier only (skipping ESLint)`);
  } else if (isEslintOnly) {
    printInfo(`Running ESLint only (skipping Prettier)`);
  }

  // Default paths for linting files
  let pathsToLint = args.filter(arg => !arg.startsWith("--")).length > 0
    ? args.filter(arg => !arg.startsWith("--")).join(" ")
    : "src/**/*.{js,jsx,ts,tsx}";

  // Add a separator line for visual clarity
  console.log(`\n${colors.reset}${colors.cyan}${"═".repeat(70)}${colors.reset}`);

  printHeader("Looking for configurations...");

  // Find the configuration files
  const eslintConfigPath = path.resolve(__dirname, "../config/eslint.config.js");
  const prettierConfigPath = path.resolve(__dirname, "../config/prettier.config.js");

  // Check if configs exist
  const hasEslintConfig = fs.existsSync(eslintConfigPath);
  const hasPrettierConfig = fs.existsSync(prettierConfigPath);

  // Report which configs were found
  if (hasEslintConfig) {
    printSuccess("Found AssembleJS ESLint configuration");
  } else {
    printInfo("Using ESLint defaults");
  }

  if (hasPrettierConfig) {
    printSuccess("Found AssembleJS Prettier configuration");
  } else {
    printInfo("Using Prettier defaults");
  }

  // Check if required dependencies are installed
  printHeader("Checking dependencies...");

  const checkDependencies = () => {
    // Core dependencies that must be present
    const coreDependencies = ["eslint", "prettier"];
    const missing = [];

    // Check for core dependencies
    for (const dep of coreDependencies) {
      try {
        // Check in the project's node_modules
        require.resolve(dep, { paths: [process.cwd() + "/node_modules"] });
        printSuccess(`Found ${dep} (local)`);
      } catch (e) {
        // Try to resolve through NPX
        try {
          execSync(`npx ${dep} --version`, {
            stdio: 'pipe',
            cwd: process.cwd()
          });
          printSuccess(`Found ${dep} (global)`);
        } catch (npxError) {
          missing.push(dep);
        }
      }
    }

    // Report missing dependencies
    if (missing.length > 0) {
      printWarning(`Missing dependencies: ${missing.join(", ")}`);
      printTip(`Install with: npm install --save-dev ${missing.join(" ")}`);
      printInfo("Attempting to continue anyway...");
    }
  };

  // Run dependency check
  checkDependencies();

  // Track success/failure
  let eslintSuccess = true;
  let prettierSuccess = true;

  // Run ESLint if not prettier-only
  if (!isPrettierOnly) {
    // Add a separator line for visual clarity
    console.log(`\n${colors.reset}${colors.cyan}${"═".repeat(70)}${colors.reset}`);

    printHeader("Running ESLint...");

    try {
      // Check if src directory exists
      const srcDirExists = fs.existsSync(path.join(process.cwd(), "src"));
      if (!srcDirExists) {
        throw new Error("src directory not found in the current working directory");
      }

      // Get a list of files to check
      let filesToLint = [];
      try {
        const findCommand = `find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null || true`;
        filesToLint = execSync(findCommand, { encoding: "utf8" })
          .trim()
          .split("\n")
          .filter(Boolean);

        if (filesToLint.length === 0) {
          filesToLint = [pathsToLint];
        }
      } catch (e) {
        filesToLint = [pathsToLint];
      }

      if (filesToLint.length === 0) {
        printWarning("No files found to lint. Check your project structure.");
      } else {
        printInfo(`Analyzing ${filesToLint.length} files...`);

        // Print a separator line for better readability
        console.log("\n" + "─".repeat(60));

        // Check if eslint is installed locally
        const useLocal = fs.existsSync(path.join(process.cwd(), "node_modules", ".bin", "eslint"));
        const eslintBin = useLocal ? path.join(process.cwd(), "node_modules", ".bin", "eslint") : "npx eslint";
        const filesList = filesToLint.join(" ");

        // Create ESLint command
        let eslintCommand;
        if (hasEslintConfig && !skipCustomConfig) {
          eslintCommand = `${eslintBin} --config ${eslintConfigPath} ${isFixMode ? "--fix" : ""} ${filesList}`;
          printInfo("Using AssembleJS ESLint configuration");
        } else {
          eslintCommand = `${eslintBin} ${isFixMode ? "--fix" : ""} ${filesList}`;
          if (skipCustomConfig) {
            printInfo("Using default ESLint configuration (--no-custom-config flag used)");
          }
        }

        // Execute ESLint
        try {
          // Use a more controlled approach for output
          if (isDebugMode) {
            // In debug mode, show full output
            execSync(eslintCommand, { stdio: "inherit" });
          } else {
            // Otherwise, capture output and filter it
            const output = execSync(eslintCommand, {
              stdio: ['pipe', 'pipe', 'pipe'],
              encoding: 'utf-8'
            });

            // Only show summary of issues in a pretty format
            console.log(`\n${colors.reset}${colors.bright}${colors.cyan}ESLint Results:${colors.reset}\n`);

            const lines = output.split('\n');
            const relevantLines = lines.filter(line =>
              !line.includes('schema') &&
              !line.includes('validateConfigSchema') &&
              !line.match(/^\s*at\s+/) && // Skip stack traces
              line.trim() !== '' // Skip empty lines
            );

            if (relevantLines.length > 0) {
              // Format each line to match REDLINE style
              relevantLines.forEach(line => {
                if (line.includes('error')) {
                  console.log(`  ${colors.red}✖${colors.reset} ${line.trim()}`);
                } else if (line.includes('warning')) {
                  console.log(`  ${colors.yellow}⚠${colors.reset} ${line.trim()}`);
                } else {
                  console.log(`  ${colors.blue}ℹ${colors.reset} ${line.trim()}`);
                }
              });
            } else {
              console.log(`  ${colors.green}✓${colors.reset} ${colors.green}No issues found${colors.reset}`);
            }
          }

          console.log("─".repeat(60) + "\n");
          printSuccess("ESLint passed - No issues found!");
        } catch (err) {
          eslintSuccess = false;
          console.log("─".repeat(60) + "\n");

          // Check if this is a configuration error
          if (err.message && err.message.includes("schema")) {
            printError("ESLint configuration error detected");
            printInfo("This might be due to an invalid or incompatible ESLint config");
            printTip("Try running with --no-custom-config flag to use default ESLint settings");

            if (isDebugMode) {
              // In debug mode, show the full error
              console.error(err.message);
            }
          } else {
            printError("ESLint found issues in your code");

            // Show a cleaned up version of the error in REDLINE style
            console.log(`\n${colors.reset}${colors.bright}${colors.cyan}ESLint Results:${colors.reset}\n`);

            if (!isDebugMode && err.stdout) {
              // Extract just the error summaries, not the giant schema dumps
              const lines = err.stdout.toString().split('\n');
              const relevantLines = lines.filter(line =>
                !line.includes('schema') &&
                !line.includes('validateConfigSchema') &&
                !line.match(/^\s*at\s+/) && // Skip stack traces
                line.trim() !== '' // Skip empty lines
              );

              if (relevantLines.length > 0) {
                // Format each line to match REDLINE style
                relevantLines.forEach(line => {
                  if (line.includes('error')) {
                    console.log(`  ${colors.red}✖${colors.reset} ${line.trim()}`);
                  } else if (line.includes('warning')) {
                    console.log(`  ${colors.yellow}⚠${colors.reset} ${line.trim()}`);
                  } else {
                    console.log(`  ${colors.blue}ℹ${colors.reset} ${line.trim()}`);
                  }
                });
              } else {
                console.log(`  ${colors.red}✖${colors.reset} ${colors.red}Issues found but detailed output suppressed${colors.reset}`);
              }
            } else {
              console.log(`  ${colors.red}✖${colors.reset} ${colors.red}Issues found in your code${colors.reset}`);
            }

            if (isFixMode) {
              printInfo("Automatic fixes have been applied where possible");
              printTip("Some issues may require manual fixes");
            } else {
              printTip("Run with --fix to automatically fix many issues");
            }
          }
        }
      }
    } catch (error) {
      eslintSuccess = false;
      printError(`Error running ESLint: ${error.message}`);
    }
  }

  // Run Prettier if not eslint-only
  if (!isEslintOnly) {
    // Add a separator line for visual clarity
    console.log(`\n${colors.reset}${colors.magenta}${"═".repeat(70)}${colors.reset}`);

    printHeader("Running Prettier...");

    try {
      // Check for src directory
      const srcDirExists = fs.existsSync(path.join(process.cwd(), "src"));
      if (!srcDirExists) {
        throw new Error("src directory not found in the current working directory");
      }

      // Get files to check
      let filesToCheck = [];
      try {
        const findCommand = `find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.scss" 2>/dev/null || true`;
        filesToCheck = execSync(findCommand, { encoding: "utf8" })
          .trim()
          .split("\n")
          .filter(Boolean);

        if (filesToCheck.length === 0) {
          filesToCheck = [pathsToLint];
        }
      } catch (e) {
        filesToCheck = [pathsToLint];
      }

      if (filesToCheck.length === 0) {
        printWarning("No files found to format. Check your project structure.");
      } else {
        printInfo(`Checking format on ${filesToCheck.length} files...`);

        // Print a separator line for better readability
        console.log("\n" + "─".repeat(60));

        // Check if prettier is installed locally
        const useLocal = fs.existsSync(path.join(process.cwd(), "node_modules", ".bin", "prettier"));
        const prettierBin = useLocal ? path.join(process.cwd(), "node_modules", ".bin", "prettier") : "npx prettier";
        const filesList = filesToCheck.join(" ");

        // Create Prettier command
        let prettierCommand;
        if (hasPrettierConfig && !skipCustomConfig) {
          prettierCommand = `${prettierBin} --config ${prettierConfigPath} ${isFixMode ? "--write" : "--check"} ${filesList}`;
          printInfo("Using AssembleJS Prettier configuration");
        } else {
          prettierCommand = `${prettierBin} ${isFixMode ? "--write" : "--check"} ${filesList}`;
          if (skipCustomConfig) {
            printInfo("Using default Prettier configuration (--no-custom-config flag used)");
          }
        }

        // Execute Prettier
        try {
          // Use a more controlled approach for output
          if (isDebugMode) {
            // In debug mode, show full output
            execSync(prettierCommand, { stdio: "inherit" });
          } else {
            // Otherwise, capture output and filter it
            const output = execSync(prettierCommand, {
              stdio: ['pipe', 'pipe', 'pipe'],
              encoding: 'utf-8'
            });

            // Only show summary of issues in a pretty format
            console.log(`\n${colors.reset}${colors.bright}${colors.magenta}Prettier Results:${colors.reset}\n`);

            const lines = output.split('\n');
            const relevantLines = lines.filter(line =>
              !line.includes('schema') &&
              !line.match(/^\s*at\s+/) && // Skip stack traces
              line.trim() !== '' // Skip empty lines
            );

            if (relevantLines.length > 0) {
              // Format each line to match REDLINE style
              relevantLines.forEach(line => {
                if (line.includes('All matched files use Prettier code style!')) {
                  console.log(`  ${colors.green}✓${colors.reset} ${colors.green}${line.trim()}${colors.reset}`);
                } else if (line.includes('warning') || line.includes('Warn')) {
                  console.log(`  ${colors.yellow}⚠${colors.reset} ${line.trim()}`);
                } else {
                  console.log(`  ${colors.blue}ℹ${colors.reset} ${line.trim()}`);
                }
              });
            } else {
              console.log(`  ${colors.green}✓${colors.reset} ${colors.green}No formatting issues found${colors.reset}`);
            }
          }

          console.log("─".repeat(60) + "\n");
          printSuccess("Prettier passed - Code style is consistent!");

          if (isFixMode) {
            printInfo("All files formatted according to style guidelines");
          }
        } catch (err) {
          prettierSuccess = false;
          console.log("─".repeat(60) + "\n");
          printError("Prettier found formatting inconsistencies");

          // Show a cleaned up version of the error in REDLINE style
          console.log(`\n${colors.reset}${colors.bright}${colors.magenta}Prettier Results:${colors.reset}\n`);

          if (!isDebugMode && err.stdout) {
            // Extract just the error summaries, not the giant schema dumps
            const lines = err.stdout.toString().split('\n');
            const relevantLines = lines.filter(line =>
              !line.includes('schema') &&
              !line.match(/^\s*at\s+/) && // Skip stack traces
              line.trim() !== '' // Skip empty lines
            );

            if (relevantLines.length > 0) {
              // Format each line to match REDLINE style
              let fileWithIssues = [];

              // First, collect files with issues
              relevantLines.forEach(line => {
                if (line.includes('[warn]') || line.includes('[error]')) {
                  const match = line.match(/\[(?:warn|error)\] (.+?) \(/) || line.match(/Check formatting of (.+)/);
                  if (match && match[1]) {
                    fileWithIssues.push(match[1]);
                  }
                }
              });

              // Display files with formatting issues
              if (fileWithIssues.length > 0) {
                console.log(`  ${colors.yellow}⚠${colors.reset} ${colors.yellow}Formatting issues in:${colors.reset}`);
                fileWithIssues.forEach(file => {
                  console.log(`    ${colors.red}→${colors.reset} ${file}`);
                });
              } else {
                // Display generic formatting issues
                relevantLines.forEach(line => {
                  if (line.includes('error') || line.includes('Code style issues')) {
                    console.log(`  ${colors.red}✖${colors.reset} ${line.trim()}`);
                  } else if (line.includes('warning') || line.includes('Warn')) {
                    console.log(`  ${colors.yellow}⚠${colors.reset} ${line.trim()}`);
                  } else {
                    console.log(`  ${colors.blue}ℹ${colors.reset} ${line.trim()}`);
                  }
                });
              }
            } else {
              console.log(`  ${colors.red}✖${colors.reset} ${colors.red}Formatting issues found but detailed output suppressed${colors.reset}`);
            }
          } else {
            console.log(`  ${colors.red}✖${colors.reset} ${colors.red}Formatting issues found in your code${colors.reset}`);
          }

          if (isFixMode) {
            printInfo("Files have been reformatted to match style guidelines");
          } else {
            printTip("Run with --fix to automatically format all files");
          }
        }
      }
    } catch (error) {
      prettierSuccess = false;
      printError(`Error running Prettier: ${error.message}`);
    }
  }

  // Print summary with time info
  const endTime = new Date();
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

  // Summary header with separator
  console.log("\n" + "═".repeat(70));
  printHeader("REDLINE SUMMARY");
  console.log("─".repeat(30));

  // Show elapsed time
  printInfo(`Time: ${elapsedTime}s`);

  // Show status of each tool
  if (!isPrettierOnly) {
    if (eslintSuccess) {
      printSuccess("ESLint: PASS");
    } else {
      printError("ESLint: FAIL");
    }
  }

  if (!isEslintOnly) {
    if (prettierSuccess) {
      printSuccess("Prettier: PASS");
    } else {
      printError("Prettier: FAIL");
    }
  }

  console.log("─".repeat(30));

  // Overall result
  if (eslintSuccess && prettierSuccess) {
    console.log(`\n${colors.green}${colors.bright}✨ SUCCESS: All checks passed!${colors.reset}`);
    if (isFixMode) {
      printInfo("Code has been formatted and linted successfully!");
    }
  } else {
    console.log(`\n${colors.red}${colors.bright}⚠️ ATTENTION: Issues were found${colors.reset}`);
    if (!isFixMode) {
      printTip(`Run with --fix flag to attempt automatic fixes: npm run lint -- --fix`);
    } else {
      printInfo("Some issues were fixed automatically, but manual fixes are still needed");
    }
  }

  console.log("═".repeat(70));
}

// Handle errors
process.on('unhandledRejection', (reason) => {
  console.error('Error:', reason.message);
  process.exit(1);
});

// Track start time for performance measurement
const startTime = new Date();

// Execute main function
main().catch(err => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});