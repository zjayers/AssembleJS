import type { NodePlopAPI } from "plop";
import type { Answers } from "inquirer";
import fs from "fs";
import path from "path";
import {
  AVAILABLE_VIEW_CHOICES,
  getRandomColor,
  getRandomSalutation,
  scanForAvailableParents,
  getFileExtensionForRenderType,
} from "../common/common";
import { GENERATOR_PATHS } from "../common/paths";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { GENERATOR_CONFIG } from "../common/generator.config";

/**
 * Generate a new AssembleJS Blueprint.
 * @description Creates a new blueprint with client-side code and a view implementation.
 * Blueprints are the high-level UI containers in AssembleJS that represent entire pages
 * or major features, each with potentially multiple view implementations.
 * @param {NodePlopAPI} plop - The plop instance for template generation.
 * @author Zach Ayers
 */
export default function (plop: NodePlopAPI) {
  plop.setPartial("randomSalutation", getRandomSalutation());
  plop.setPartial("randomColor", getRandomColor());

  plop.setHelper("lowerCase", function (text: string) {
    return text ? text.toLowerCase() : "";
  });

  // Add additional common string manipulation helpers
  plop.setHelper("upperCase", function (text: string) {
    return text ? text.toUpperCase() : "";
  });

  plop.setHelper("capitalize", function (text: string) {
    return text
      ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      : "";
  });

  // Helper for comparing values in templates
  plop.setHelper("eq", function (a, b) {
    return a === b;
  });

  plop.setGenerator("AssembleJS Blueprint", {
    description: "Generate a new blueprint with a specific view implementation",
    prompts: (function () {
      // Return the interactive prompts with consistent order:
      // 1. Name
      // 2. View
      // 3. Registration options (N/A for blueprints)
      // 4. Template language
      return [
        {
          type: "list",
          name: "BLUEPRINT_ACTION",
          message:
            "Would you like to create a new blueprint or add a view to an existing one?",
          choices: () => {
            const { blueprints } = scanForAvailableParents();

            // If there are no existing blueprints, just create a new one
            if (blueprints.length === 0) {
              return [{ name: "Create a new blueprint", value: "new" }];
            }

            return [
              { name: "Create a new blueprint", value: "new" },
              {
                name: "Add a view to an existing blueprint",
                value: "existing",
              },
            ];
          },
        },
        // 1. NAME - Blueprint name selection/input
        {
          type: "list",
          name: "NODE_NAME",
          message: "Select the blueprint to add a view to:",
          choices: () => {
            const { blueprints } = scanForAvailableParents();
            return blueprints;
          },
          when: (answers) => answers.BLUEPRINT_ACTION === "existing",
        },
        {
          type: "input",
          name: "NODE_NAME",
          message: "Blueprint name (first part of route):",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Blueprint name cannot be empty";
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return "Blueprint name should only contain lowercase letters, numbers, and hyphens";
            }
            return true;
          },
          when: (answers) => answers.BLUEPRINT_ACTION === "new",
        },
        // 2. VIEW - View name
        {
          type: "input",
          name: "VIEW_NAME",
          message: "View name (display context):",
          default: "main",
          validate: (input: string) => {
            if (!input.trim()) {
              return "View name cannot be empty";
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return "View name should only contain lowercase letters, numbers, and hyphens";
            }
            return true;
          },
        },
        // 3. REGISTRATION - Not applicable for blueprints
        
        // 4. LANGUAGE - Template language selection
        {
          type: "list",
          name: "RENDER_TYPE",
          message:
            "What template language would you like to use for your view?",
          choices: AVAILABLE_VIEW_CHOICES,
        },
      ];
    })(),
    actions: function (answers: Answers = {}) {

      const actions = [
        {
          type: "addMany",
          destination: GENERATOR_PATHS.BLUEPRINTS_DIR(),
          base: "../templates/component/{{ lowerCase RENDER_TYPE }}",
          templateFiles: "../templates/component/{{ lowerCase RENDER_TYPE }}",
          stripExtensions: ["hbs"],
          // Add error handling for file creation
          globOptions: {
            dot: true,
          },
          // Add a transformation hook to check for directory existence
          transform: (content: string, answers: Answers = {}) => {
            try {
              // Ensure the destination directory exists
              const destDir = GENERATOR_PATHS.BLUEPRINTS_DIR();
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }

              // Ensure the blueprint directory exists
              const blueprintDir = path.join(destDir, answers.NODE_NAME);
              if (!fs.existsSync(blueprintDir)) {
                fs.mkdirSync(blueprintDir, { recursive: true });
              }

              // Ensure the view directory exists
              const viewDir = path.join(blueprintDir, answers.VIEW_NAME);
              if (!fs.existsSync(viewDir)) {
                fs.mkdirSync(viewDir, { recursive: true });
              }

              return content;
            } catch (err) {
              console.error(
                `Failed to create blueprint directory structure:`,
                err
              );
              return "ERROR: Failed to create directory - see console for details";
            }
          },
        },

        // Custom action to modify server.ts and handle alphabetical sorting
        {
          type: "modify",
          path: GENERATOR_PATHS.SERVER_FILE(),
          transform: (content: string, answers: any) => {
            const nodeName = answers.NODE_NAME;
            const viewName = answers.VIEW_NAME;
            const renderType = answers.RENDER_TYPE;

            // Get the appropriate file extension based on the render type
            let fileExtension = getFileExtensionForRenderType(renderType);

            // Check if a component with this path already exists
            const pathRegex = new RegExp(`path:\\s*["']${nodeName}["']`);
            const pathMatch = content.match(pathRegex);

            if (pathMatch && pathMatch.index !== undefined) {
              // Component exists, find its views array
              let objectStartIdx = pathMatch.index;
              // Move backward to find the opening brace
              while (objectStartIdx >= 0 && content[objectStartIdx] !== "{") {
                objectStartIdx--;
              }

              const viewsArrayMatch = content
                .substring(objectStartIdx)
                .match(/views\s*:\s*\[/);

              if (viewsArrayMatch && viewsArrayMatch.index !== undefined) {
                const viewsArrayIdx =
                  objectStartIdx +
                  viewsArrayMatch.index +
                  viewsArrayMatch[0].length;

                // Find the end of the views array
                let viewsArrayEndIdx = viewsArrayIdx;
                let braceCount = 1;
                let inString = false;
                let stringChar = "";

                while (viewsArrayEndIdx < content.length) {
                  const char = content[viewsArrayEndIdx];

                  // Handle string boundaries
                  if (
                    (char === '"' || char === "'") &&
                    (viewsArrayEndIdx === 0 ||
                      content[viewsArrayEndIdx - 1] !== "\\")
                  ) {
                    if (!inString) {
                      inString = true;
                      stringChar = char;
                    } else if (char === stringChar) {
                      inString = false;
                    }
                  }

                  // Only count braces outside of strings
                  if (!inString) {
                    if (char === "[") braceCount++;
                    if (char === "]") {
                      braceCount--;
                      if (braceCount === 0) break;
                    }
                  }

                  viewsArrayEndIdx++;
                }

                // Extract the current views array content
                const viewsArrayContent = content.substring(
                  viewsArrayIdx,
                  viewsArrayEndIdx
                );

                // Check if this view name already exists in the views array
                const viewNameRegex = new RegExp(
                  `viewName:\\s*["']${viewName}["']`
                );
                if (!viewNameRegex.test(viewsArrayContent)) {
                  // Parse existing views
                  const viewObjects = [];
                  let currentViewStart = 0;
                  let currentBraceCount = 0;
                  let inStringView = false;
                  let stringCharView = "";

                  // Extract individual view objects
                  for (let i = 0; i < viewsArrayContent.length; i++) {
                    const char = viewsArrayContent[i];

                    // Handle string boundaries for view parsing
                    if (
                      (char === '"' || char === "'") &&
                      (i === 0 || viewsArrayContent[i - 1] !== "\\")
                    ) {
                      if (!inStringView) {
                        inStringView = true;
                        stringCharView = char;
                      } else if (char === stringCharView) {
                        inStringView = false;
                      }
                    }

                    // Only count braces outside of strings
                    if (!inStringView) {
                      if (char === "{") {
                        if (currentBraceCount === 0) currentViewStart = i;
                        currentBraceCount++;
                      }
                      if (char === "}") {
                        currentBraceCount--;
                        if (currentBraceCount === 0) {
                          // Found a complete view object
                          viewObjects.push(
                            viewsArrayContent.substring(currentViewStart, i + 1)
                          );
                        }
                      }
                    }
                  }

                  // Add the new view
                  const newViewObj = `{
          exposeAsBlueprint: true,
          viewName: '${viewName}',
          templateFile: '${viewName}.view.${fileExtension}',
        }`;
                  viewObjects.push(newViewObj);

                  // Sort views alphabetically by viewName
                  viewObjects.sort((a, b) => {
                    const viewNameA =
                      a.match(/viewName:\s*["']([^"']+)["']/)?.[1] || "";
                    const viewNameB =
                      b.match(/viewName:\s*["']([^"']+)["']/)?.[1] || "";
                    return viewNameA.localeCompare(viewNameB);
                  });

                  // Join with commas
                  const sortedViewsArray = viewObjects.join(", ");

                  // Replace the views array
                  content =
                    content.substring(0, viewsArrayIdx) +
                    sortedViewsArray +
                    content.substring(viewsArrayEndIdx);
                }
              }
            } else {
              // Component doesn't exist, add it to the components array
              const componentsArrayMatch = content.match(/components\s*:\s*\[/);
              if (
                componentsArrayMatch &&
                componentsArrayMatch.index !== undefined
              ) {
                const insertIdx =
                  componentsArrayMatch.index + componentsArrayMatch[0].length;
                const componentTemplate = `
      {
        path: '${nodeName}',
        views: [{
          exposeAsBlueprint: true,
          viewName: '${viewName}',
          templateFile: '${viewName}.view.${fileExtension}',
        }],
      },`;

                content =
                  content.substring(0, insertIdx) +
                  componentTemplate +
                  content.substring(insertIdx);
              }
            }

            return content;
          },
        },
        // Add completion message
        (answers: Answers = {}) => {
          const nodeName = answers.NODE_NAME;
          const viewName = answers.VIEW_NAME;
          const renderType = answers.RENDER_TYPE;
          const blueprintsDir = GENERATOR_PATHS.BLUEPRINTS_DIR();
          const blueprintPath = `${blueprintsDir}/${nodeName}/${viewName}`;

          if (GENERATOR_CONFIG.isMinimalOutput()) {
            // Minimal output - just the essentials (no separator bars)
            console.log("\n🔍 Blueprint created successfully!");
            console.log(`\n📂 Blueprint: ${nodeName}/${viewName}`);
            console.log(
              `\n🚀 Access: http://localhost:3000/${nodeName}/${viewName}/`
            );
          } else {
            // Standard or verbose output with separator bars
            console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
            console.log("\n🔍 Blueprint created successfully!");

            // Display full directory path
            console.log(`\n📂 Blueprint Location: ${blueprintPath}`);

            // List created files with full paths
            console.log("\n📄 Created Files:");
            console.log(`  ${blueprintPath}/${viewName}.client.ts`);
            console.log(`  ${blueprintPath}/${viewName}.styles.scss`);
            console.log(
              `  ${blueprintPath}/${viewName}.view.${renderType.toLowerCase()}`
            );

            // Print access URL
            console.log("\n🌐 Access URL:");
            console.log(`  http://localhost:3000/${nodeName}/${viewName}/`);

            // Blueprint specific information
            console.log("\n✨ Blueprint features:");
            console.log(`  • Blueprints are pages or major page sections`);
            console.log(`  • URL matches the blueprint + view path`);
            console.log(
              `  • Perfect for implementing complete features or page layouts`
            );

            // Provide component embedding example for this specific blueprint
            console.log("\n🧩 Embed components in your blueprint:");
            console.log(
              `  <!-- In your ${viewName}.view.${renderType.toLowerCase()} file -->`
            );

            if (renderType.toLowerCase() === "ejs") {
              console.log(`  <%- await context.component.greeting.main() %>`);
              console.log(`  `);
              console.log(`  <!-- With parameters -->`);
              console.log(`  <%- await context.component.greeting.main({`);
              console.log(`    message: "Welcome to your new blueprint!"`);
              console.log(`  }) %>`);
            } else if (renderType.toLowerCase() === "preact") {
              console.log(`  <div className="blueprint-container">`);
              console.log(
                `    <GreetingMain message="Welcome to your new blueprint!" />`
              );
              console.log(`  </div>`);
            } else {
              // Generic example for HTML or Markdown
              console.log(
                `  <!-- Components will be rendered in your ${renderType.toLowerCase()} view -->`
              );
              console.log(
                `  <!-- See documentation for ${renderType.toLowerCase()}-specific syntax -->`
              );
            }

            // Development tips
            console.log("\n💡 Development tips:");
            console.log(
              `  • Hot-reload will update your blueprint as you save changes`
            );
            console.log(`  • Use client.ts for blueprint-specific JavaScript`);
            console.log(
              `  • Create multiple views to support different devices/contexts`
            );
            console.log(`  • Blueprint routes are automatically registered`);

            // Only show closing separator in standard/verbose mode
            console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
          }

          return "";
        },
      ];

      return actions;
    },
  });
}
