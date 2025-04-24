/* eslint-disable valid-jsdoc */
import chalk from "chalk";

/**
 * Creates a formatted log message with a badge
 * @param message The message to display
 * @param type The type of message (determines color and badge)
 */
export const logWithBadge = (
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
) => {
  const badges = {
    info: chalk.blue("INFO"),
    success: chalk.green("DONE"),
    warning: chalk.yellow("WARN"),
    error: chalk.red("FAIL"),
  };

  // Convert message to Sentence case for better readability
  message = message.charAt(0).toUpperCase() + message.slice(1);

  console.log(`${badges[type]} ${message}`);
};

/**
 * Creates a visual progress bar
 * @param current Current progress value
 * @param total Total progress value
 * @param size Size of the progress bar in characters
 * @returns Formatted progress bar string
 */
export const createProgressBar = (
  current: number,
  total: number,
  size = 30
): string => {
  const percent = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * size);
  const empty = size - filled;

  const filledBar = chalk.cyan("█").repeat(filled);
  const emptyBar = chalk.gray("░").repeat(empty);

  return `${filledBar}${emptyBar} ${chalk.blue(
    percent.toString().padStart(3)
  )}%`;
};

/**
 * Logs progress to the console with a progress bar
 * @param current Current progress value
 * @param total Total progress value
 * @param label Label to display before the progress bar
 */
export const logProgress = (current: number, total: number, label: string) => {
  const progressBar = createProgressBar(current, total);
  process.stdout.write(`\r${label} ${progressBar} [${current}/${total}]`);

  if (current === total) {
    process.stdout.write("\n");
  }
};

/**
 * Prints a header box to the console
 * @param title The title to display
 * @param color The color function to use (from chalk)
 */
export const printHeaderBox = (title: string, color: any = chalk.cyan) => {
  // Convert title to Sentence case for better readability
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  const width = Math.max(formattedTitle.length + 10, 45);
  const padding = " ".repeat(Math.floor((width - formattedTitle.length) / 2));

  console.log(color(`\n${"═".repeat(width)}`));
  console.log(color(`${padding}${formattedTitle}${padding}`));
  console.log(color(`${"═".repeat(width)}\n`));
};

/**
 * Adds serverRoot import if missing
 * @param code The source code
 * @returns Modified code with serverRoot import if it was missing
 */
export const ensureServerRootImport = (code: string): string => {
  // Check if serverRoot is already defined
  if (!code.includes("serverRoot:")) {
    // Find the blueprint config
    const blueprintConfigMatch = code.match(
      /createBlueprintServer\s*\(\s*{[\s\S]*?}\s*\)/
    );

    if (blueprintConfigMatch) {
      const configCode = blueprintConfigMatch[0];

      // Add serverRoot to the configuration
      const updatedConfigCode = configCode.replace(
        /createBlueprintServer\s*\(\s*{/,
        "createBlueprintServer({\n  serverRoot: import.meta.url,"
      );

      return code.replace(configCode, updatedConfigCode);
    }
  }

  return code;
};

/**
 * Creates a plugin to transform server.ts for development/production
 * @param serverRoot The server root directory
 * @param mode 'development' or 'production'
 * @returns A Vite plugin for server transformation
 */
export const createServerTransformPlugin = (
  serverRoot: string,
  mode: "development" | "production"
) => {
  const serverEntryFile = "server.ts";

  return {
    name: `server-${mode}-transform`,
    transform(code: string, id: string) {
      // Only transform the server entry file
      if (!id.endsWith(serverEntryFile)) {
        return null;
      }

      logWithBadge(`Preparing server.ts for ${mode} mode...`, "info");

      // Ensure serverRoot is defined
      code = ensureServerRootImport(code);

      if (mode === "development") {
        // Development mode transformations

        // Check if the code already has the vavite imports
        const hasVaviteImports =
          code.includes("vavite/vite-dev-server") &&
          code.includes("vavite/http-dev-server");

        // If imports are missing, add them
        if (!hasVaviteImports) {
          const importMatch = code.match(/import.*from.*?;/g);

          if (importMatch) {
            // Add after existing imports
            const lastImport = importMatch[importMatch.length - 1];
            const importIndex =
              code.lastIndexOf(lastImport) + lastImport.length;

            code =
              code.slice(0, importIndex) +
              "\nimport viteDevServer from 'vavite/vite-dev-server';\n" +
              "import vaviteHttpServer from 'vavite/http-dev-server';\n" +
              code.slice(importIndex);
          } else {
            // No existing imports, add to beginning
            code =
              "import viteDevServer from 'vavite/vite-dev-server';\n" +
              "import vaviteHttpServer from 'vavite/http-dev-server';\n" +
              code;
          }
        }

        // Check if httpServer and devServer are configured
        const blueprintConfigMatch = code.match(
          /createBlueprintServer\s*\(\s*{[\s\S]*?}\s*\)/
        );

        if (blueprintConfigMatch) {
          const configCode = blueprintConfigMatch[0];
          let updatedConfigCode = configCode;

          // Add httpServer if missing
          if (!updatedConfigCode.includes("httpServer:")) {
            updatedConfigCode = updatedConfigCode.replace(
              /(serverRoot:.*?,|serverRoot:.*?$)/,
              "$1\n  httpServer: vaviteHttpServer,"
            );
          } else if (!updatedConfigCode.includes("vaviteHttpServer")) {
            // Replace existing httpServer with vaviteHttpServer
            updatedConfigCode = updatedConfigCode.replace(
              /httpServer\s*:\s*[^,}]+/,
              "httpServer: vaviteHttpServer"
            );
          }

          // Add devServer if missing
          if (!updatedConfigCode.includes("devServer:")) {
            updatedConfigCode = updatedConfigCode.replace(
              /(httpServer:.*?,|httpServer:.*?$)/,
              "$1\n  devServer: viteDevServer,"
            );
          } else if (!updatedConfigCode.includes("viteDevServer")) {
            // Replace existing devServer with viteDevServer
            updatedConfigCode = updatedConfigCode.replace(
              /devServer\s*:\s*[^,}]+/,
              "devServer: viteDevServer"
            );
          }

          // Replace the configuration in the code
          if (updatedConfigCode !== configCode) {
            code = code.replace(configCode, updatedConfigCode);
            logWithBadge(
              "Added development servers to Blueprint configuration",
              "success"
            );
          }
        }
      } else if (mode === "production") {
        // Always transform for production mode, not just when vavite imports are present
        logWithBadge(
          "Transforming server.ts for production HTTP server support...",
          "info"
        );

        // Start with the common imports
        let result = `import { createBlueprintServer } from "asmbl";
import { createServer } from "http";

// Define styled console logging
const cyan = (text) => \`\\x1b[36m\${text}\\x1b[0m\`;

// Simple production HTTP server
const server = createServer();
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(cyan(\`AssembleJS server is running on port: \${PORT}\`));
});

`;

        // Extract the blueprint configuration object
        const configMatch = code.match(
          /createBlueprintServer\s*\(\s*{[\s\S]*?}\s*\)/
        );
        if (configMatch) {
          let configCode = configMatch[0];

          // Ensure serverRoot is defined
          if (!configCode.includes("serverRoot:")) {
            configCode = configCode.replace(
              /createBlueprintServer\s*\(\s*{/,
              "createBlueprintServer({\n  serverRoot: import.meta.url,"
            );
          }

          // Handle httpServer and devServer references
          if (configCode.includes("httpServer:")) {
            // Replace httpServer reference with our server
            configCode = configCode.replace(
              /httpServer\s*:\s*[^,}]+/,
              "httpServer: server"
            );
          } else {
            // If no httpServer defined, add one before the manifest or other properties
            if (configCode.includes("manifest:")) {
              configCode = configCode.replace(
                /(manifest\s*:)/,
                "httpServer: server,\n  $1"
              );
            } else {
              // No manifest, add after serverRoot
              configCode = configCode.replace(
                /(serverRoot:.*?,|serverRoot:.*?$)/,
                "$1\n  httpServer: server,"
              );
            }
          }

          // Remove devServer reference - instead of just removing it, replace with null to prevent errors
          // In production mode, we need to provide a mock/dummy dev server object to prevent early exit
          // Simple object with minimal properties to pass the undefined check
          if (configCode.includes("devServer:")) {
            configCode = configCode.replace(
              /devServer\s*:\s*[^,}]+/,
              "devServer: {}"
            );
          } else {
            // Add devServer: {} if it doesn't exist (after httpServer)
            configCode = configCode.replace(
              /(httpServer:.*?,|httpServer:.*?$)/,
              "$1\n  devServer: {},"
            );
          }

          // Clean up any trailing commas before closing brace
          configCode = configCode.replace(/,\s*}/g, " }");

          // Add the transformed blueprint configuration
          result += `// Initialize the Blueprint server
${configCode.trim()}
.then(() => {
  // Server initialized
})
.catch(err => {
  console.error(\`ERROR: Server initialization failed:\`, err);
});`;

          return {
            code: result,
            map: null,
          };
        } else {
          // If we couldn't extract the configuration, create a basic one
          logWithBadge(
            "Creating default production server configuration",
            "warning"
          );
          const result = `import { createBlueprintServer } from "asmbl";
import { createServer } from "http";

// Define styled console logging
const cyan = (text) => \`\\x1b[36m\${text}\\x1b[0m\`;

// Simple production HTTP server
const server = createServer();
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(cyan(\`AssembleJS server is running on port: \${PORT}\`));
});

// Initialize the Blueprint server
createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: server,
  devServer: {},
  manifest: {
    components: []
  }
})
.then(() => {
  // Server initialized
})
.catch(err => {
  console.error(\`ERROR: Server initialization failed:\`, err);
});`;

          return {
            code: result,
            map: null,
          };
        }
      }

      return {
        code: code,
        map: null,
      };
    },
  };
};
