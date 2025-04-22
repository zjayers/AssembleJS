import type { NodePlopAPI } from "plop";
import type { Answers } from "inquirer";
import fs from "fs";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { GENERATOR_PATHS } from "../common/paths";
import {
  getRandomColor,
  getRandomSalutation,
  dashToCamelCase,
} from "../common/common";
import { GENERATOR_CONFIG } from "../common/generator.config";

/**
 * Generate a new AssembleJS Controller.
 * @description Creates a new controller for handling HTTP routes and requests.
 * Controllers in AssembleJS manage routing, handle API requests, and provide
 * backend functionality for components and blueprints.
 * @param {NodePlopAPI} plop - The plop instance for template generation.
 * @author Zach Ayers
 */
export default function (plop: NodePlopAPI) {
  plop.setPartial("randomSalutation", getRandomSalutation());
  plop.setPartial("randomColor", getRandomColor());

  // Add a custom action type for updating server.ts with controller registration
  plop.setActionType(
    "updateServerControllers",
    async (answers: Answers, config) => {
      const serverPath = GENERATOR_PATHS.SERVER_FILE();
      if (!serverPath) {
        return "Server.ts not found. Registration skipped.";
      }

      let serverContent = fs.readFileSync(serverPath, "utf8");
      const controllerName = answers.CONTROLLER_NAME;

      // Convert hyphenated controller names to proper class names (PascalCase)
      const safeControllerName = dashToCamelCase(controllerName);
      const controllerClassName =
        safeControllerName.charAt(0).toUpperCase() +
        safeControllerName.slice(1) +
        "Controller";

      // 1. Add import for the controller
      const importStatement = `import { ${controllerClassName} } from "./controllers/${controllerName}.controller";`;

      if (!serverContent.includes(importStatement)) {
        // Add import after last import
        const lastImportIdx = serverContent.lastIndexOf("import ");
        if (lastImportIdx !== -1) {
          const endOfLine = serverContent.indexOf("\n", lastImportIdx);
          if (endOfLine !== -1) {
            serverContent =
              serverContent.substring(0, endOfLine + 1) +
              importStatement +
              "\n" +
              serverContent.substring(endOfLine + 1);
          }
        }
      }

      // 2. Add controller to manifest.controllers array
      if (!serverContent.includes(`${controllerClassName}`)) {
        // Find the controllers array in the manifest
        const controllersMatch = serverContent.match(/controllers\s*:\s*\[/);

        if (controllersMatch && controllersMatch.index !== undefined) {
          // Add the controller to the array
          const insertIdx = controllersMatch.index + controllersMatch[0].length;

          // Check if there are existing controllers
          const hasExistingControllers =
            serverContent.substring(insertIdx, insertIdx + 20).trim().length >
            0;

          // Add to the controllers array
          if (hasExistingControllers) {
            // Add with a comma since there are existing controllers
            serverContent =
              serverContent.substring(0, insertIdx) +
              "\n      " +
              controllerClassName +
              "," +
              serverContent.substring(insertIdx);
          } else {
            // Add without a comma since there are no existing controllers
            serverContent =
              serverContent.substring(0, insertIdx) +
              "\n      " +
              controllerClassName +
              serverContent.substring(insertIdx);
          }
        } else {
          // If controllers array doesn't exist, find the manifest object
          const manifestMatch = serverContent.match(/manifest\s*:\s*{/);

          if (manifestMatch && manifestMatch.index !== undefined) {
            // Add the controllers array to the manifest
            const insertIdx = manifestMatch.index + manifestMatch[0].length;
            serverContent =
              serverContent.substring(0, insertIdx) +
              "\n    controllers: [\n      " +
              controllerClassName +
              "\n    ]," +
              serverContent.substring(insertIdx);
          }
        }
      }

      // Write updated content back to server.ts
      fs.writeFileSync(serverPath, serverContent);

      return `Controller ${controllerClassName} registered in server.ts`;
    }
  );

  plop.setGenerator("AssembleJS Controller", {
    description:
      "Generate a new controller for handling HTTP routes and requests",
    prompts: (function () {
      // Return the interactive prompts with consistent order:
      // 1. Name
      // 2. (View N/A for controllers)
      // 3. Registration options
      // 4. (Language N/A for controllers)
      return [
        // 1. NAME - Controller name
        {
          type: "input",
          name: "CONTROLLER_NAME",
          message: "Controller name (handles routes and API):",
          default: "api",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Controller name cannot be empty";
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return "Controller name should only contain lowercase letters, numbers, and hyphens";
            }
            return true;
          },
        },
        // 2. VIEW - Not applicable for controllers

        // 3. REGISTRATION - Server registration option
        {
          type: "confirm",
          name: "REGISTER_CONTROLLER",
          message: "Register controller in server.ts?",
          default: true,
        },
        // 4. LANGUAGE - Not applicable for controllers
      ];
    })(),
    actions: (function (answers: Answers = {}) {
      const actions = [
        {
          type: "addMany",
          destination: GENERATOR_PATHS.CONTROLLERS_DIR(),
          base: GENERATOR_PATHS.CONTROLLER_TEMPLATE,
          templateFiles: GENERATOR_PATHS.CONTROLLER_TEMPLATE,
          stripExtensions: ["hbs"],
          // Add error handling for file creation
          globOptions: {
            dot: true,
          },
          // Add a transformation hook to check for directory existence
          transform: (content: string, answers: Answers) => {
            try {
              // Ensure the destination directory exists
              const destDir = GENERATOR_PATHS.CONTROLLERS_DIR();
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }

              // For controllers, we just need to ensure the controllers directory exists
              // since the output is directly in that directory (not in subdirectories)

              return content;
            } catch (err) {
              console.error(`Failed to create controller directory:`, err);
              return "ERROR: Failed to create directory - see console for details";
            }
          },
        },
      ];

      // Add server registration action if requested
      if (answers.REGISTER_CONTROLLER) {
        // Use 'add' type as a workaround for TypeScript check
        // The actual action type is processed by plop dynamically
        actions.push({
          type: "updateServerControllers",
          // Add required properties with dummy values to satisfy TypeScript
          destination: "",
          base: "",
          templateFiles: "",
          stripExtensions: [],
          globOptions: { dot: true },
          transform: (content: string, _: Answers) => content,
        } as any);
      }

      // Add completion message action - needs to be cast to any
      // since plop accepts functions directly
      actions.push(((answers: Answers) => {
        const controllerName = answers.CONTROLLER_NAME;
        const controllersDir = GENERATOR_PATHS.CONTROLLERS_DIR();
        const controllerPath = `${controllersDir}/${controllerName}.controller.ts`;

        // Convert to PascalCase for class name
        const safeControllerName = dashToCamelCase(controllerName);
        const controllerClassName =
          safeControllerName.charAt(0).toUpperCase() +
          safeControllerName.slice(1) +
          "Controller";

        if (GENERATOR_CONFIG.isMinimalOutput()) {
          // Minimal output - just the essentials (no separator bars)
          console.log("\n🎮 Controller created successfully!");
          console.log(`\n📂 Controller: ${controllerName}.controller.ts`);

          if (answers.REGISTER_CONTROLLER) {
            console.log(
              `\n✅ Registered in server.ts as ${controllerClassName}`
            );
          }
        } else {
          // Standard or verbose output with separator bars
          console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
          console.log("\n🎮 Controller created successfully!");

          // Display full directory path
          console.log(`\n📂 Controller Location: ${controllersDir}`);

          // List created files with full paths
          console.log("\n📄 Created Files:");
          console.log(`  ${controllerPath}`);

          // Show registration status
          if (answers.REGISTER_CONTROLLER) {
            console.log("\n✅ Registration:");
            console.log(`  • Controller automatically registered in server.ts`);
            console.log(`  • Class name: ${controllerClassName}`);
          } else {
            console.log("\n🔧 Manual Registration:");
            console.log(`  // In server.ts`);
            console.log(
              `  import { ${controllerClassName} } from "./controllers/${controllerName}.controller";`
            );
            console.log(`  `);
            console.log(`  // Register your controller`);
            console.log(`  manifest: {`);
            console.log(`    controllers: [${controllerClassName}],`);
            console.log(`  }`);
          }

          // Print next steps with detailed information
          console.log("\n🚀 Next steps:");
          if (!answers.REGISTER_CONTROLLER) {
            console.log(`  1. Register your controller in server.ts`);
          }
          console.log(
            `  ${
              answers.REGISTER_CONTROLLER ? "1" : "2"
            }. Add routes to your controller`
          );
          console.log(
            `  ${
              answers.REGISTER_CONTROLLER ? "2" : "3"
            }. Restart your server with: npm run dev`
          );

          // Add controller-specific tips
          console.log("\n🔧 Controller tips:");
          console.log(`  • Controllers use Fastify under the hood`);
          console.log(`  • Use GET, POST, PUT, DELETE methods for REST APIs`);
          console.log(`  • Add middleware with onRequest, preHandler hooks`);
          console.log(`  • All routes are prefixed with your controller name`);
          console.log(
            `  • Example: /${controllerName}/users will be available at http://localhost:3000/${controllerName}/users`
          );

          // API examples
          console.log("\n🌐 Example API endpoints:");
          console.log(`  GET    /${controllerName}/items     - List all items`);
          console.log(
            `  GET    /${controllerName}/items/:id - Get a single item`
          );
          console.log(
            `  POST   /${controllerName}/items     - Create a new item`
          );
          console.log(`  PUT    /${controllerName}/items/:id - Update an item`);
          console.log(`  DELETE /${controllerName}/items/:id - Delete an item`);

          // Only show closing separator in standard/verbose mode
          console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
        }

        return "";
      }) as any);

      return actions;
    })(),
  });
}
