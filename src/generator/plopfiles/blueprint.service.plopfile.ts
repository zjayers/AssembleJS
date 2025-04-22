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
 * Generate a new AssembleJS Service.
 * @description Creates a new service for business logic, API communication, and data operations.
 * Services in AssembleJS provide the business logic layer that connects your controllers
 * to external systems (APIs) and data storage (databases).
 * @param {NodePlopAPI} plop - The plop instance for template generation.
 * @author Zach Ayers
 */
export default function (plop: NodePlopAPI) {
  plop.setPartial("randomSalutation", getRandomSalutation());
  plop.setPartial("randomColor", getRandomColor());

  // Add a custom action type for updating server.ts with service registration
  plop.setActionType(
    "updateServerServices",
    async (answers: Answers, config) => {
      const serverPath = GENERATOR_PATHS.SERVER_FILE();
      if (!serverPath) {
        return "Server.ts not found. Registration skipped.";
      }

      let serverContent = fs.readFileSync(serverPath, "utf8");
      const serviceName = answers.SERVICE_NAME;
      const serviceToken = answers.SERVICE_TOKEN;

      // Convert hyphenated service names to proper class names (PascalCase)
      const safeServiceName = dashToCamelCase(serviceName);
      const serviceClassName =
        safeServiceName.charAt(0).toUpperCase() +
        safeServiceName.slice(1) +
        "Service";

      // 1. Add import for the service
      const importStatement = `import { ${serviceClassName} } from "./services/${serviceName}.service";`;

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

      // 2. Add service to manifest.services object
      if (!serverContent.includes(`${serviceClassName}`)) {
        // Look for services object in the manifest
        const servicesMatch = serverContent.match(/services\s*:\s*\{/);

        if (servicesMatch && servicesMatch.index !== undefined) {
          // Add the service to the existing services object
          const insertIdx = servicesMatch.index + servicesMatch[0].length;

          // Check if there are existing services
          const hasExistingServices =
            serverContent.substring(insertIdx, insertIdx + 20).trim().length >
            0;

          // Add to the services object
          if (hasExistingServices) {
            // Add with a comma since there are existing services
            serverContent =
              serverContent.substring(0, insertIdx) +
              `\n      "${serviceToken}": ${serviceClassName},` +
              serverContent.substring(insertIdx);
          } else {
            // Add without a comma since there are no existing services
            serverContent =
              serverContent.substring(0, insertIdx) +
              `\n      "${serviceToken}": ${serviceClassName}` +
              serverContent.substring(insertIdx);
          }
        } else {
          // If services object doesn't exist, see if manifest exists
          const manifestMatch = serverContent.match(/manifest\s*:\s*\{/);

          if (manifestMatch && manifestMatch.index !== undefined) {
            // Check if there's a trailing comma needed
            const segmentToCheck = serverContent.substring(
              manifestMatch.index + manifestMatch[0].length,
              manifestMatch.index + manifestMatch[0].length + 500
            );
            // Find the closing brace of the manifest object
            const endOfManifest = segmentToCheck.lastIndexOf("}");

            if (endOfManifest !== -1) {
              // Check if there's content before the closing brace
              const contentBeforeClosingBrace =
                segmentToCheck.substring(0, endOfManifest).trim().length > 0;

              // Add services object to the manifest
              const insertIdx = manifestMatch.index + manifestMatch[0].length;

              if (contentBeforeClosingBrace) {
                // Add with comma as there's other content
                serverContent =
                  serverContent.substring(0, insertIdx) +
                  `\n    services: {\n      "${serviceToken}": ${serviceClassName}\n    },` +
                  serverContent.substring(insertIdx);
              } else {
                // No other content, no comma needed
                serverContent =
                  serverContent.substring(0, insertIdx) +
                  `\n    services: {\n      "${serviceToken}": ${serviceClassName}\n    }` +
                  serverContent.substring(insertIdx);
              }
            }
          }
        }
      }

      // Write updated content back to server.ts
      fs.writeFileSync(serverPath, serverContent);

      return `Service ${serviceClassName} registered in server.ts with token "${serviceToken}"`;
    }
  );

  plop.setGenerator("AssembleJS Service", {
    description:
      "Generate a new service for business logic, API calls, and data operations",
    prompts: (function () {
      // Return the interactive prompts with consistent order:
      // 1. Name
      // 2. (View N/A for services)
      // 3. Registration options
      // 4. (Language N/A for services)
      return [
        // 1. NAME - Service name
        {
          type: "input",
          name: "SERVICE_NAME",
          message: "Service name (business logic provider):",
          default: "user",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Service name cannot be empty";
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return "Service name should only contain lowercase letters, numbers, and hyphens";
            }
            return true;
          },
        },
        // 2. VIEW - Not applicable for services
        
        // 3. REGISTRATION - Server registration options
        {
          type: "confirm",
          name: "REGISTER_SERVICE",
          message: "Register service in server.ts?",
          default: true,
        },
        {
          type: "input",
          name: "SERVICE_TOKEN",
          message: "Service token (used to retrieve service instance):",
          default: (answers: Answers) => answers.SERVICE_NAME + "Service",
          when: (answers: Answers) => answers.REGISTER_SERVICE,
          validate: (input: string) => {
            if (!input.trim()) {
              return "Service token cannot be empty";
            }
            if (!/^[a-zA-Z0-9_]+$/.test(input)) {
              return "Service token should only contain letters, numbers, and underscores";
            }
            return true;
          },
        },
        // 4. LANGUAGE - Not applicable for services
      ];
    })(),
    actions: (function (answers: Answers = {}) {

      const actions = [
        {
          type: "addMany",
          destination: GENERATOR_PATHS.SERVICES_DIR(),
          base: GENERATOR_PATHS.SERVICE_TEMPLATE,
          templateFiles: GENERATOR_PATHS.SERVICE_TEMPLATE,
          stripExtensions: ["hbs"],
          // Add error handling for file creation
          globOptions: {
            dot: true,
          },
          // Add a transformation hook to check for directory existence
          transform: (content: string, answers: Answers) => {
            try {
              // Ensure the destination directory exists
              const destDir = GENERATOR_PATHS.SERVICES_DIR();
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }

              // For services, we just need to ensure the services directory exists
              // since the output is directly in that directory (not in subdirectories)

              return content;
            } catch (err) {
              console.error(`Failed to create service directory:`, err);
              return "ERROR: Failed to create directory - see console for details";
            }
          },
        },
      ];

      // Add server registration action if requested
      if (answers.REGISTER_SERVICE) {
        actions.push({
          type: "updateServerServices",
        } as any);
      }

      // Add completion message
      actions.push(((answers: Answers) => {
        const serviceName = answers.SERVICE_NAME;
        const servicesDir = GENERATOR_PATHS.SERVICES_DIR();
        const servicePath = `${servicesDir}/${serviceName}.service.ts`;

        // Convert to PascalCase for class name
        const safeServiceName = dashToCamelCase(serviceName);
        const serviceClassName =
          safeServiceName.charAt(0).toUpperCase() +
          safeServiceName.slice(1) +
          "Service";

        if (GENERATOR_CONFIG.isMinimalOutput()) {
          // Minimal output - just the essentials (no separator bars)
          console.log("\n⚙️ Service created successfully!");
          console.log(`\n📂 Service: ${serviceName}.service.ts`);

          if (answers.REGISTER_SERVICE) {
            console.log(`\n✅ Registered in server.ts as ${serviceClassName}`);
            console.log(`   Available via token: "${answers.SERVICE_TOKEN}"`);
          }
        } else {
          // Standard or verbose output with separator bars
          console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
          console.log("\n⚙️ Service created successfully!");

          // Display full directory path
          console.log(`\n📂 Service Location: ${servicesDir}`);

          // List created files with full paths
          console.log("\n📄 Created Files:");
          console.log(`  ${servicePath}`);

          // Show registration status
          if (answers.REGISTER_SERVICE) {
            console.log("\n✅ Registration:");
            console.log(`  • Service automatically registered in server.ts`);
            console.log(`  • Class name: ${serviceClassName}`);
            console.log(`  • Service token: "${answers.SERVICE_TOKEN}"`);
          } else {
            console.log("\n🔧 Manual Registration:");
            console.log(`  // In server.ts - Import your service`);
            console.log(
              `  import { ${serviceClassName} } from "./services/${serviceName}.service";`
            );
            console.log(`  `);
            console.log(`  // Register in the manifest services object`);
            console.log(`  manifest: {`);
            console.log(`    services: {`);
            console.log(`      "${serviceName}Service": ${serviceClassName}`);
            console.log(`    }`);
            console.log(`  }`);
          }

          // Print code example
          console.log("\n💡 Example Usage:");
          console.log(`  // In your controller file
  class YourController extends BlueprintController {
    private ${safeServiceName}Service: ${serviceClassName};
    
    constructor() {
      super();
      this.${safeServiceName}Service = this.getService<${serviceClassName}>("${
            answers.REGISTER_SERVICE
              ? answers.SERVICE_TOKEN
              : serviceName + "Service"
          }");
    }
    
    public register(app: Assembly): void {
      app.get('/api/example', async (req, reply) => {
        // Use the service
        const data = await this.${safeServiceName}Service.getData();
        return reply.send(data);
      });
    }
  }`);

          // Print next steps
          console.log("\n🚀 Next steps:");
          if (!answers.REGISTER_SERVICE) {
            console.log(`  1. Register your service in server.ts`);
            console.log(
              `  2. Edit ${serviceName}.service.ts to add your business logic`
            );
          } else {
            console.log(
              `  1. Edit ${serviceName}.service.ts to add your business logic`
            );
          }
          console.log(
            `  ${
              answers.REGISTER_SERVICE ? "2" : "3"
            }. Inject and use the service in your controllers`
          );
          console.log(
            `  ${
              answers.REGISTER_SERVICE ? "3" : "4"
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
