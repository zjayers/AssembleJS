import type { NodePlopAPI } from "plop";
import type { Answers } from "inquirer";
import fs from "fs";
import {
  AVAILABLE_VIEW_CHOICES,
  getRandomColor,
  getRandomSalutation,
  scanForAvailableParents,
  getFileExtensionForRenderType,
  dashToCamelCase,
} from "../common/common";
import { GENERATOR_PATHS } from "../common/paths";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { GENERATOR_CONFIG } from "../common/generator.config";

/**
 * Generate a new AssembleJS Component.
 * @description Creates a new component with client-side code and a view template.
 * Components are reusable UI elements in AssembleJS that can be embedded within
 * blueprints or other components, supporting various template languages.
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

  // Add a custom action type for updating server.ts
  plop.setActionType(
    "updateServerRegistration",
    async (answers: Answers, config) => {
      const serverPath = GENERATOR_PATHS.SERVER_FILE();
      if (!serverPath) {
        return "Server.ts not found. Registration skipped.";
      }

      let serverContent = fs.readFileSync(serverPath, "utf8");
      const nodeName = answers.NODE_NAME;
      const viewName = answers.VIEW_NAME;
      const renderType = answers.RENDER_TYPE;
      let parents = answers.PARENT_COMPONENTS || [];
      
      // If adding view to an existing component, find all places where it's already used
      if (answers.COMPONENT_ACTION === "existing") {
        // We'll scan the server file to find all references to this component
        const existingParents = findComponentUsages(serverContent, nodeName);
        if (existingParents.length > 0) {
          console.log(`Found ${existingParents.length} existing references to ${nodeName}`);
          // Use these instead of asking the user
          parents = existingParents;
        }
      }

      // 1. First, ensure the component itself is registered
      const isPreact = renderType.toLowerCase() === "preact";

      // Add imports for Preact components
      if (isPreact) {
        // Convert hyphenated names to camelCase for variable names
        const safeNodeName = dashToCamelCase(nodeName);
        const importStatement = `import { ${capitalizeFirst(
          viewName
        )} as ${capitalizeFirst(safeNodeName)}${capitalizeFirst(
          viewName
        )} } from './components/${nodeName}/${viewName}/${viewName}.view';`;

        if (!serverContent.includes(importStatement)) {
          // Add import after last import
          const lastImportIdx = serverContent.lastIndexOf("import ");
          if (lastImportIdx !== -1) {
            const endOfLine = serverContent.indexOf("\n", lastImportIdx);
            serverContent =
              serverContent.substring(0, endOfLine + 1) +
              importStatement +
              "\n" +
              serverContent.substring(endOfLine + 1);
          }
        }
      }

      // Check if component already exists
      const pathRegex = new RegExp(`path:\\s*["']${nodeName}["']`);
      const pathMatch = serverContent.match(pathRegex);

      if (pathMatch && pathMatch.index !== undefined) {
        // Component exists, find its views array
        let objectStartIdx = pathMatch.index;
        // Move backward to find the opening brace
        while (objectStartIdx >= 0 && serverContent[objectStartIdx] !== "{") {
          objectStartIdx--;
        }

        const viewsArrayMatch = serverContent
          .substring(objectStartIdx)
          .match(/views\s*:\s*\[/);

        if (viewsArrayMatch && viewsArrayMatch.index !== undefined) {
          const viewsArrayIdx =
            objectStartIdx + viewsArrayMatch.index + viewsArrayMatch[0].length;

          // Find the end of the views array
          let viewsArrayEndIdx = viewsArrayIdx;
          let braceCount = 1;
          let inString = false;
          let stringChar = "";

          while (viewsArrayEndIdx < serverContent.length) {
            const char = serverContent[viewsArrayEndIdx];

            // Handle string boundaries
            if (
              (char === '"' || char === "'") &&
              (viewsArrayEndIdx === 0 ||
                serverContent[viewsArrayEndIdx - 1] !== "\\")
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
          const viewsArrayContent = serverContent.substring(
            viewsArrayIdx,
            viewsArrayEndIdx
          );

          // Check if this view name already exists in the views array
          const viewNameRegex = new RegExp(`viewName:\\s*["']${viewName}["']`);
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
            const safeNodeName = dashToCamelCase(nodeName);
            const templateConfig = isPreact
              ? `template: ${capitalizeFirst(safeNodeName)}${capitalizeFirst(
                  viewName
                )}`
              : `templateFile: "${viewName}.view.${getFileExtensionForRenderType(
                  renderType
                )}"`;

            const newViewObj = `{
          viewName: "${viewName}",
          ${templateConfig}
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
            serverContent =
              serverContent.substring(0, viewsArrayIdx) +
              sortedViewsArray +
              serverContent.substring(viewsArrayEndIdx);
          }
        }
      } else {
        // Component doesn't exist, add it to the components array
        const safeNodeName = dashToCamelCase(nodeName);
        const templateConfig = isPreact
          ? `template: ${capitalizeFirst(safeNodeName)}${capitalizeFirst(
              viewName
            )}`
          : `templateFile: "${viewName}.view.${getFileExtensionForRenderType(
              renderType
            )}"`;

        const componentDef = `{
        path: "${nodeName}",
        views: [{
          viewName: "${viewName}",
          ${templateConfig}
        }]
      }`;

        const componentsArrayMatch = serverContent.match(/components\s*:\s*\[/);
        if (componentsArrayMatch && componentsArrayMatch.index !== undefined) {
          const insertIdx =
            componentsArrayMatch.index + componentsArrayMatch[0].length;
          serverContent =
            serverContent.substring(0, insertIdx) +
            "\n      " +
            componentDef +
            "," +
            serverContent.substring(insertIdx);
        }
      }

      // 2. Now add references to this component in any parent components
      for (const parent of parents) {
        // Find the parent definition
        const parentRegex = new RegExp(`path:\\s*["']${parent.name}["']`);
        const match = serverContent.match(parentRegex);

        if (match && match.index !== undefined) {
          // Find a view in this parent to add the component to
          const parentObjStart = findObjectStart(serverContent, match.index);
          const viewsArrayMatch = serverContent
            .substring(parentObjStart)
            .match(/views\s*:\s*\[/);

          if (viewsArrayMatch && viewsArrayMatch.index !== undefined) {
            const viewsArrayIdx =
              parentObjStart +
              viewsArrayMatch.index +
              viewsArrayMatch[0].length;
            const firstViewMatch = serverContent
              .substring(viewsArrayIdx)
              .match(/{\s*viewName/);

            if (firstViewMatch && firstViewMatch.index !== undefined) {
              const viewIdx = viewsArrayIdx + firstViewMatch.index;

              // Check if this view already has a components array
              const viewSubstring = serverContent.substring(viewIdx);
              const closingBraceIdx = findClosingBrace(viewSubstring);
              const viewContent = viewSubstring.substring(0, closingBraceIdx);

              if (viewContent.includes("components")) {
                // Has components array - add to it
                const componentsMatch =
                  viewContent.match(/components\s*:\s*\[/);
                if (componentsMatch && componentsMatch.index !== undefined) {
                  const insertIdx =
                    viewIdx + componentsMatch.index + componentsMatch[0].length;

                  // Skip if this component reference already exists
                  const componentRef = `{name: "${dashToCamelCase(
                    nodeName
                  )}", contentUrl: "/${nodeName}/${viewName}/"}`;
                  if (!viewContent.includes(componentRef)) {
                    serverContent =
                      serverContent.substring(0, insertIdx) +
                      "\n          " +
                      componentRef +
                      "," +
                      serverContent.substring(insertIdx);
                  }
                }
              } else {
                // Doesn't have components array - add it before closing brace
                const endOfViewObj = viewIdx + closingBraceIdx - 1;
                serverContent =
                  serverContent.substring(0, endOfViewObj) +
                  ",\n        components: [\n          " +
                  `{name: "${dashToCamelCase(
                    nodeName
                  )}", contentUrl: "/${nodeName}/${viewName}/"}\n` +
                  "        ]" +
                  serverContent.substring(endOfViewObj);
              }
            }
          }
        }
      }

      // Write updated content back to server.ts
      fs.writeFileSync(serverPath, serverContent);

      return `Component registered in server.ts${
        parents.length ? ` and linked to ${parents.length} parent(s)` : ""
      }`;
    }
  );

  plop.setGenerator("AssembleJS Component", {
    description:
      "Generate a new component with client-side code and view template",
    prompts: (function () {
      // Scan for available parents
      const { blueprints, components } = scanForAvailableParents();

      // Define the choices for the parent selection
      const parentChoices = [
        ...blueprints.map((b) => ({
          name: `Blueprint: ${b}`,
          value: { type: "blueprint", path: `blueprints/${b}`, name: b },
        })),
        ...components.map((c) => ({
          name: `Component: ${c}`,
          value: { type: "component", path: `components/${c}`, name: c },
        })),
      ];

      // Return the normal interactive prompts with consistent order:
      // 1. Name
      // 2. View
      // 3. Registration options
      // 4. Template language
      return [
        {
          type: "list",
          name: "COMPONENT_ACTION",
          message:
            "Would you like to create a new component or add a view to an existing one?",
          choices: () => {
            const { components } = scanForAvailableParents();

            // If there are no existing components, just create a new one
            if (components.length === 0) {
              return [{ name: "Create a new component", value: "new" }];
            }

            return [
              { name: "Create a new component", value: "new" },
              {
                name: "Add a view to an existing component",
                value: "existing",
              },
            ];
          },
        },
        // 1. NAME - Component name selection/input
        {
          type: "list",
          name: "NODE_NAME",
          message: "Select the component to add a view to:",
          choices: () => {
            const { components } = scanForAvailableParents();
            return components;
          },
          when: (answers) => answers.COMPONENT_ACTION === "existing",
        },
        {
          type: "input",
          name: "NODE_NAME",
          message: "Component name (first part of route):",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Component name cannot be empty";
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return "Component name should only contain lowercase letters, numbers, and hyphens";
            }
            return true;
          },
          when: (answers) => answers.COMPONENT_ACTION === "new",
        },
        // 2. VIEW - View name
        {
          type: "input",
          name: "VIEW_NAME",
          message: (answers: Answers) =>
            `View name (creates route: /${answers.NODE_NAME}/<view>):`,
          default: (answers: Answers) =>
            answers.NODE_NAME === "main" ? "default" : "main",
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
        // 3. REGISTRATION - Parent components selection
        {
          type: "checkbox",
          name: "PARENT_COMPONENTS",
          message:
            "Which components/blueprints should include this component? (Optional)",
          choices: parentChoices,
          when: (answers) => 
            // Only ask this question when creating a new component, not when adding a view
            answers.COMPONENT_ACTION === "new" && parentChoices.length > 0,
        },
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

      return [
        {
          type: "addMany",
          destination: GENERATOR_PATHS.COMPONENTS_DIR(),
          base: "../templates/component/{{ lowerCase RENDER_TYPE }}",
          templateFiles: "../templates/component/{{ lowerCase RENDER_TYPE }}",
          stripExtensions: ["hbs"],
          // Add error handling for file creation
          globOptions: {
            dot: true,
          },
          // Add a transformation hook to check for directory existence
          transform: (content: string, answers: Answers) => {
            try {
              // Ensure the destination directory exists
              const destDir = GENERATOR_PATHS.COMPONENTS_DIR();
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }

              // Also ensure the specific component's directory exists
              const nodeName = answers.NODE_NAME;
              const viewName = answers.VIEW_NAME;
              const componentDir = `${destDir}/${nodeName}/${viewName}`;
              const nodeDir = `${destDir}/${nodeName}`;

              if (!fs.existsSync(nodeDir)) {
                fs.mkdirSync(nodeDir, { recursive: true });
              }

              if (!fs.existsSync(componentDir)) {
                fs.mkdirSync(componentDir, { recursive: true });
              }

              return content;
            } catch (err) {
              console.error(`Failed to create component directories:`, err);
              return "ERROR: Failed to create directories - see console for details";
            }
          },
        },
        // Add server registration action
        {
          type: "updateServerRegistration",
        },
        // Add completion message
        (answers: Answers) => {
          const nodeName = answers.NODE_NAME;
          const viewName = answers.VIEW_NAME;
          const renderType = answers.RENDER_TYPE;
          const parents = answers.PARENT_COMPONENTS || [];
          const componentsDir = GENERATOR_PATHS.COMPONENTS_DIR();
          const componentPath = `${componentsDir}/${nodeName}/${viewName}`;

          if (GENERATOR_CONFIG.isMinimalOutput()) {
            // Minimal output - just the essentials (no separator bars)
            console.log("\n🧩 Component created successfully!");
            console.log(`\n📂 Component: ${nodeName}/${viewName}`);
            console.log(
              `\n🚀 Access: http://localhost:3000/${nodeName}/${viewName}/`
            );

            if (parents.length > 0) {
              console.log(`\n🔗 Used in ${parents.length} parent component(s)`);
            }
          } else {
            // Standard or verbose output with separator bars
            console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
            console.log("\n🧩 Component created successfully!");

            // Display full directory path
            console.log(`\n📂 Component Location: ${componentPath}`);

            // List created files with full paths
            console.log("\n📄 Created Files:");
            console.log(`  ${componentPath}/${viewName}.client.ts`);
            console.log(`  ${componentPath}/${viewName}.styles.scss`);
            console.log(
              `  ${componentPath}/${viewName}.view.${renderType.toLowerCase()}`
            );

            // Show parent component integration
            if (parents.length > 0) {
              console.log("\n🔗 Component Integration:");
              console.log(
                `  • Added to ${parents.length} parent component(s):`
              );
              parents.forEach((parent: { type: string; name: string }) => {
                console.log(`    - ${parent.type}: ${parent.name}`);
              });
            }

            // Print next steps for both standalone access and embedding
            console.log("\n🚀 Access your component:");
            console.log(
              `  1. Standalone URL:     http://localhost:3000/${nodeName}/${viewName}/`
            );

            if (
              GENERATOR_CONFIG.isVerboseOutput() ||
              GENERATOR_CONFIG.isStandardOutput()
            ) {
              // Show how to embed this component in other views
              console.log("\n🧩 Embed this component in other views:");
              console.log(`  <!-- In EJS views -->`);
              console.log(
                `  <%- await context.component.${nodeName}.${viewName}() %>`
              );
              console.log(`  `);
              console.log(`  <!-- With parameters -->`);
              console.log(
                `  <%- await context.component.${nodeName}.${viewName}({`
              );
              console.log(`    custom: "parameter",`);
              console.log(`    another: 123`);
              console.log(`  }) %>`);

              // Development tips
              console.log("\n💡 Development tips:");
              console.log(
                `  • Add client-side interactivity in ${viewName}.client.ts`
              );
              console.log(
                `  • Style your component in ${viewName}.styles.scss`
              );
              console.log(
                `  • Hot-reload is enabled - changes update instantly`
              );
              console.log(
                `  • Components are automatically registered - no manual imports needed`
              );
            }

            // Only show closing separator in standard/verbose mode
            console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
          }

          return "";
        },
      ];
    },
  });
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @return {string} The capitalized string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Find the start of an object in a string
 * @param {string} content - The content to search in
 * @param {number} index - The index to start searching from
 * @return {number} The index of the opening brace
 */
function findObjectStart(content: string, index: number): number {
  // Find the opening brace of the object containing the index
  while (index >= 0 && content[index] !== "{") {
    index--;
  }
  return index;
}

/**
 * Find the closing brace that matches the opening brace at the start of the content
 * @param {string} content - The content to search in (should start with an opening brace)
 * @return {number} The index of the matching closing brace
 */
function findClosingBrace(content: string): number {
  // Find the matching closing brace
  let braceCount = 1;
  let index = 1;

  while (braceCount > 0 && index < content.length) {
    if (content[index] === "{") braceCount++;
    if (content[index] === "}") braceCount--;
    index++;
  }

  return index;
}

/**
 * Find all places where a component is used in blueprints or other components
 * @param {string} serverContent The content of the server.ts file
 * @param {string} componentName The name of the component to find usages of
 * @return {Array<{ type: string, name: string, path: string }>} An array of parent objects with type, name, and path properties
 */
function findComponentUsages(serverContent: string, componentName: string): Array<{ type: string, name: string, path: string }> {
  const parents = [];
  
  // Find contentUrl references to this component in the server file
  const contentUrlPattern = new RegExp(`contentUrl:\\s*["']/+${componentName}/[^"']+["']`, 'g');
  let match;
  
  while ((match = contentUrlPattern.exec(serverContent)) !== null) {
    // For each match, try to find the parent component/blueprint
    const matchPos = match.index;
    
    // Find the nearest path property before this match, which defines the parent component
    const pathRegex = /path:\s*["']([^"']+)["']/g;
    let pathMatch;
    let lastPathBeforeMatch = null;
    
    while ((pathMatch = pathRegex.exec(serverContent)) !== null) {
      if (pathMatch.index < matchPos) {
        lastPathBeforeMatch = {
          index: pathMatch.index,
          name: pathMatch[1]
        };
      } else {
        // Stop once we've gone past the match position
        break;
      }
    }
    
    if (lastPathBeforeMatch) {
      // Determine if this is a blueprint or component based on the directory structure
      const isBlueprint = serverContent.substring(
        Math.max(0, lastPathBeforeMatch.index - 100), 
        lastPathBeforeMatch.index
      ).includes('blueprints');
      
      parents.push({
        type: isBlueprint ? 'blueprint' : 'component',
        name: lastPathBeforeMatch.name,
        path: isBlueprint ? `blueprints/${lastPathBeforeMatch.name}` : `components/${lastPathBeforeMatch.name}`
      });
    }
  }
  
  // Remove duplicates (a component might be referenced multiple times in the same parent)
  const uniqueParents = [];
  const seen = new Set();
  
  for (const parent of parents) {
    const key = `${parent.type}:${parent.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueParents.push(parent);
    }
  }
  
  return uniqueParents;
}
