import type { NodePlopAPI } from "plop";
import type { Answers } from "inquirer";
import fs from "fs";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { GENERATOR_PATHS } from "../common/paths";
import {
  getRandomColor,
  getRandomSalutation,
  dashToCamelCase,
  scanForAvailableParents,
} from "../common/common";
import { GENERATOR_CONFIG } from "../common/generator.config";

/**
 * Generate a new AssembleJS Factory.
 * @description Creates a new factory for generating dynamic content.
 * Factories in AssembleJS provide dynamic data and content generation capabilities,
 * transforming context data into values that can be used in views.
 * @param {NodePlopAPI} plop - The plop instance for template generation.
 * @author Zach Ayers
 */
export default function (plop: NodePlopAPI) {
  plop.setPartial("randomSalutation", getRandomSalutation());
  plop.setPartial("randomColor", getRandomColor());

  // Add a custom action type for updating server.ts with factory registration
  plop.setActionType(
    "updateServerFactories",
    async (answers: Answers, config) => {
      const serverPath = GENERATOR_PATHS.SERVER_FILE();
      if (!serverPath) {
        return "Server.ts not found. Registration skipped.";
      }

      let serverContent = fs.readFileSync(serverPath, "utf8");
      const factoryName = answers.FACTORY_NAME;
      const registrationType = answers.REGISTRATION_TYPE;

      // Convert hyphenated factory names to camelCase for JavaScript identifiers
      const safeFactoryName = dashToCamelCase(factoryName);
      const factoryFileName = `${factoryName}.factory`;

      // Add import for the factory
      const importStatement = `import { ${safeFactoryName}Factory } from "./factories/${factoryFileName}";`;

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

      // Register factory based on registration type
      if (registrationType === "global") {
        // Register factory in manifest.shared.factories array
        if (!serverContent.includes(`${safeFactoryName}Factory`)) {
          // Try to find shared.factories array
          const factoriesMatch = serverContent.match(
            /shared\s*:\s*\{[^{]*factories\s*:\s*\[/
          );

          if (factoriesMatch && factoriesMatch.index !== undefined) {
            // Add the factory to the existing factories array
            const insertIdx = factoriesMatch.index + factoriesMatch[0].length;

            // Check if there are existing factories
            const hasExistingFactories =
              serverContent.substring(insertIdx, insertIdx + 20).trim().length >
              0;

            // Add to the factories array
            if (hasExistingFactories) {
              // Add with a comma since there are existing factories
              serverContent =
                serverContent.substring(0, insertIdx) +
                "\n        " +
                safeFactoryName +
                "Factory," +
                serverContent.substring(insertIdx);
            } else {
              // Add without a comma since there are no existing factories
              serverContent =
                serverContent.substring(0, insertIdx) +
                "\n        " +
                safeFactoryName +
                "Factory" +
                serverContent.substring(insertIdx);
            }
          } else {
            // If factories array doesn't exist, see if shared exists
            const sharedMatch = serverContent.match(
              /manifest\s*:\s*\{[^{]*shared\s*:\s*\{/
            );

            if (sharedMatch && sharedMatch.index !== undefined) {
              // Add factories array to existing shared object
              const insertIdx = sharedMatch.index + sharedMatch[0].length;
              serverContent =
                serverContent.substring(0, insertIdx) +
                "\n      factories: [\n        " +
                safeFactoryName +
                "Factory\n      ]," +
                serverContent.substring(insertIdx);
            } else {
              // If shared doesn't exist, find the manifest object
              const manifestMatch = serverContent.match(/manifest\s*:\s*\{/);

              if (manifestMatch && manifestMatch.index !== undefined) {
                // Add shared with factories array to the manifest
                const insertIdx = manifestMatch.index + manifestMatch[0].length;
                serverContent =
                  serverContent.substring(0, insertIdx) +
                  "\n    shared: {\n      factories: [\n        " +
                  safeFactoryName +
                  "Factory\n      ]\n    }," +
                  serverContent.substring(insertIdx);
              }
            }
          }
        }
      } else if (registrationType === "component") {
        // Component-level factory registration
        const componentName = answers.COMPONENT_NAME;

        if (componentName && componentName !== "") {
          // Find the component declaration
          const componentRegex = new RegExp(
            `path\\s*:\\s*["']${componentName}["']`
          );
          const componentMatch = serverContent.match(componentRegex);

          if (componentMatch && componentMatch.index !== undefined) {
            // Find the component object opening
            const beforeMatch = serverContent.substring(
              0,
              componentMatch.index
            );
            const componentStartIdx = beforeMatch.lastIndexOf("{");

            if (componentStartIdx !== -1) {
              // Look for shared.factories within this component
              const componentSubstring = serverContent.substring(
                componentStartIdx,
                componentMatch.index + 200
              );
              const sharedFactoriesMatch = componentSubstring.match(
                /shared\s*:\s*\{[^{]*factories\s*:\s*\[/
              );

              if (
                sharedFactoriesMatch &&
                sharedFactoriesMatch.index !== undefined
              ) {
                // Add to existing factories array
                const insertIdx =
                  componentStartIdx +
                  sharedFactoriesMatch.index +
                  sharedFactoriesMatch[0].length;

                // Check if there are existing factories
                const hasExistingFactories =
                  serverContent.substring(insertIdx, insertIdx + 20).trim()
                    .length > 0;

                // Add to the factories array
                if (hasExistingFactories) {
                  // Add with a comma since there are existing factories
                  serverContent =
                    serverContent.substring(0, insertIdx) +
                    "\n          " +
                    safeFactoryName +
                    "Factory," +
                    serverContent.substring(insertIdx);
                } else {
                  // Add without a comma since there are no existing factories
                  serverContent =
                    serverContent.substring(0, insertIdx) +
                    "\n          " +
                    safeFactoryName +
                    "Factory" +
                    serverContent.substring(insertIdx);
                }
              } else {
                // Look for shared object within this component
                const sharedMatch = componentSubstring.match(/shared\s*:\s*\{/);

                if (sharedMatch && sharedMatch.index !== undefined) {
                  // Add factories array to existing shared object
                  const insertIdx =
                    componentStartIdx +
                    sharedMatch.index +
                    sharedMatch[0].length;
                  serverContent =
                    serverContent.substring(0, insertIdx) +
                    "\n        factories: [\n          " +
                    safeFactoryName +
                    "Factory\n        ]," +
                    serverContent.substring(insertIdx);
                } else {
                  // Add shared object with factories array to the component
                  // Find a good insertion point after the path declaration
                  const pathEndIdx =
                    componentMatch.index + componentMatch[0].length;
                  const lineEndIdx = serverContent.indexOf("\n", pathEndIdx);

                  if (lineEndIdx !== -1) {
                    serverContent =
                      serverContent.substring(0, lineEndIdx + 1) +
                      "        shared: {\n          factories: [\n            " +
                      safeFactoryName +
                      "Factory\n          ]\n        },\n" +
                      serverContent.substring(lineEndIdx + 1);
                  }
                }
              }
            }
          }
        }
      }

      // Write updated content back to server.ts
      fs.writeFileSync(serverPath, serverContent);

      return `Factory ${safeFactoryName}Factory registered in server.ts (${registrationType} level)`;
    }
  );

  plop.setGenerator("AssembleJS Factory", {
    description: "Generate a new factory for dynamic content generation",
    prompts: (function () {
      // Scan for available components to attach the factory to
      const { components } = scanForAvailableParents();

      // Return the interactive prompts with consistent order:
      // 1. Name
      // 2. (View N/A for factories)
      // 3. Registration options
      // 4. (Language N/A for factories)
      return [
        // 1. NAME - Factory name
        {
          type: "input",
          name: "FACTORY_NAME",
          message: "Factory name (generates dynamic content):",
          default: "data",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Factory name cannot be empty";
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return "Factory name should only contain lowercase letters, numbers, and hyphens";
            }
            return true;
          },
        },
        // 2. VIEW - Not applicable for factories

        // 3. REGISTRATION - Server registration options
        {
          type: "confirm",
          name: "REGISTER_FACTORY",
          message: "Register factory in server.ts?",
          default: true,
        },
        {
          type: "list",
          name: "REGISTRATION_TYPE",
          message: "How would you like to register this factory?",
          choices: [
            { name: "Global (available to all components)", value: "global" },
            {
              name: "Component-level (available to a specific component)",
              value: "component",
            },
          ],
          when: (answers) => answers.REGISTER_FACTORY,
        },
        {
          type: "list",
          name: "COMPONENT_NAME",
          message: "Select the component to attach this factory to:",
          choices: components,
          when: (answers) =>
            answers.REGISTER_FACTORY &&
            answers.REGISTRATION_TYPE === "component",
        },
        // 4. LANGUAGE - Not applicable for factories
      ];
    })(),
    actions: (function (answers: Answers = {}) {
      const actions = [
        {
          type: "addMany",
          destination: GENERATOR_PATHS.FACTORIES_DIR(),
          base: GENERATOR_PATHS.FACTORY_TEMPLATE,
          templateFiles: GENERATOR_PATHS.FACTORY_TEMPLATE,
          stripExtensions: ["hbs"],
          // Add error handling for file creation
          globOptions: {
            dot: true,
          },
          // Add a transformation hook to check for directory existence
          transform: (content: string, answers: Answers) => {
            try {
              // Ensure the destination directory exists
              const destDir = GENERATOR_PATHS.FACTORIES_DIR();
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }

              // For factories, we just need to ensure the factories directory exists
              // since the output is directly in that directory (not in subdirectories)

              return content;
            } catch (err) {
              console.error(`Failed to create factory directory:`, err);
              return "ERROR: Failed to create directory - see console for details";
            }
          },
        },
      ];

      // Add server registration action if requested
      if (answers.REGISTER_FACTORY) {
        // Use 'add' type as a workaround for TypeScript check
        // The actual action type is processed by plop dynamically
        actions.push({
          type: "updateServerFactories",
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
        const factoryName = answers.FACTORY_NAME;
        const factoriesDir = GENERATOR_PATHS.FACTORIES_DIR();
        const factoryPath = `${factoriesDir}/${factoryName}.factory.ts`;

        // Convert to camelCase for class name
        const safeFactoryName = dashToCamelCase(factoryName);

        if (GENERATOR_CONFIG.isMinimalOutput()) {
          // Minimal output - just the essentials (no separator bars)
          console.log("\n🏭 Factory created successfully!");
          console.log(`\n📂 Factory: ${factoryName}.factory.ts`);

          if (answers.REGISTER_FACTORY) {
            console.log(
              `\n✅ Registered in server.ts as ${safeFactoryName}Factory`
            );
            if (answers.REGISTRATION_TYPE === "component") {
              console.log(
                `   Attached to component: ${answers.COMPONENT_NAME}`
              );
            } else {
              console.log(`   Registered globally for all components`);
            }
          }
        } else {
          // Standard or verbose output with separator bars
          console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
          console.log("\n🏭 Factory created successfully!");

          // Display full directory path
          console.log(`\n📂 Factory Location: ${factoriesDir}`);

          // List created files with full paths
          console.log("\n📄 Created Files:");
          console.log(`  ${factoryPath}`);

          // Show registration status
          if (answers.REGISTER_FACTORY) {
            console.log("\n✅ Registration:");
            console.log(`  • Factory automatically registered in server.ts`);
            console.log(`  • Factory name: ${safeFactoryName}Factory`);
            if (answers.REGISTRATION_TYPE === "component") {
              console.log(
                `  • Attached to component: ${answers.COMPONENT_NAME}`
              );
            } else {
              console.log(`  • Registered globally for all components`);
            }
          } else {
            console.log("\n🔧 Manual Registration:");
            console.log(`  // In server.ts - Import your factory`);
            console.log(
              `  import { ${safeFactoryName}Factory } from "./factories/${factoryName}.factory";`
            );
            console.log(`  `);
            console.log(`  // Register globally for all components:`);
            console.log(`  manifest: {`);
            console.log(`    shared: {`);
            console.log(`      factories: [${safeFactoryName}Factory],`);
            console.log(`    }`);
            console.log(`  }`);
            console.log(`  `);
            console.log(`  // OR register for a specific component:`);
            console.log(`  components: [`);
            console.log(`    {`);
            console.log(`      path: "your-component",`);
            console.log(`      shared: {`);
            console.log(`        factories: [${safeFactoryName}Factory],`);
            console.log(`      },`);
            console.log(`      views: [...]`);
            console.log(`    }`);
            console.log(`  ]`);
          }

          // Print code example
          console.log("\n💡 Example Usage:");
          console.log(`  // In your EJS/HTML/Preact view file
  <% 
  // Get data from your factory
  const data = context.factories.${factoryName}({
    // Your factory parameters here
  });
  %>
  
  <!-- Use the dynamic data -->
  <div><%= data.someProperty %></div>`);

          // Print next steps
          console.log("\n🚀 Next steps:");
          if (!answers.REGISTER_FACTORY) {
            console.log(`  1. Register your factory in server.ts`);
            console.log(
              `  2. Edit ${factoryName}.factory.ts to add your dynamic content logic`
            );
          } else {
            console.log(
              `  1. Edit ${factoryName}.factory.ts to add your dynamic content logic`
            );
          }
          console.log(
            `  ${
              answers.REGISTER_FACTORY ? "2" : "3"
            }. Use your factory in a component or blueprint view`
          );
          console.log(
            `  ${
              answers.REGISTER_FACTORY ? "3" : "4"
            }. Restart your server with: npm run dev`
          );

          // Only show closing separator in standard/verbose mode
          console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
        }

        return "";
      }) as any);

      return actions;
    })(),
  });
}
