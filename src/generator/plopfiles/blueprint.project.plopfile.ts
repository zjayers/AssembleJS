import type { NodePlopAPI } from "plop";
import type { Answers } from "inquirer";
import path from "path";
import fs from "fs";
import { spawnCommand } from "../blueprint.spawn";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { getRandomColor, getRandomSalutation } from "../common/common";
import { getPackageJsonKey } from "../../utils/pkg.utils.";
import { GENERATOR_CONFIG } from "../common/generator.config";

/**
 * Generate a new AssembleJS Project.
 * @param {NodePlopAPI} plop - The plop instance.
 * @author Zach Ayers
 */
export default function (plop: NodePlopAPI) {
  plop.setPartial("randomSalutation", getRandomSalutation());
  plop.setPartial("randomColor", getRandomColor());

  plop.setGenerator("AssembleJS Project", {
    description: "Generate a base AssembleJS Project",
    prompts: [
      // 1. NAME - Project name
      {
        type: "input",
        name: "PROJECT_NAME",
        message: "What is the name of your project?",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Project name cannot be empty";
          }
          if (!/^[a-z0-9-]+$/.test(input)) {
            return "Project name should only contain lowercase letters, numbers, and hyphens";
          }
          return true;
        },
      },
      // 2. VIEW - Not applicable for projects
      // 3. REGISTRATION - Not applicable for projects
      // 4. LANGUAGE - Not applicable for projects
    ],
    actions: function (answers: Answers = {}) {
      return [
        // Project Files
        {
          type: "addMany",
          destination: path.join(process.cwd(), "{{ PROJECT_NAME}}"),
          base: "../templates/project",
          templateFiles: "../templates/project",
          stripExtensions: ["hbs"],
          globOptions: {
            dot: true,
          },
          // Add a transformation hook to check for directory existence and create it if needed
          transform: (content: string, answers: Answers) => {
            try {
              // Ensure the project directory exists
              const projectDir = path.join(process.cwd(), answers.PROJECT_NAME);

              // This will create the project directory if it doesn't exist
              // The recursive option will create parent directories if they don't exist
              if (!fs.existsSync(projectDir)) {
                fs.mkdirSync(projectDir, { recursive: true });
              }

              return content;
            } catch (err) {
              console.error(`Failed to create project directory:`, err);
              return "ERROR: Failed to create project directory - see console for details";
            }
          },
        },
        // Local ENV file
        {
          type: "add",
          path: path.join(process.cwd(), "{{PROJECT_NAME}}", ".env.local"),
          template: Object.keys(CONSTANTS.env)
            .filter((key) => CONSTANTS.env[key].value !== undefined)
            .map((key) => {
              return CONSTANTS.env[key].key + "=" + CONSTANTS.env[key].value;
            })
            .join("\n"),
        },
        (answers: Answers) => {
          const projectName = answers.PROJECT_NAME;
          const projectDir = path.join(process.cwd(), projectName);

          // Get the current package version
          let version = "latest";
          let npmTag = "latest";

          try {
            version = getPackageJsonKey<string>("version");

            // Determine if this is a prerelease version (contains a hyphen)
            const isPrerelease = version.includes("-");

            // Use the appropriate tag based on version
            npmTag = isPrerelease ? "next" : "latest";

            console.log(
              `Installing AssembleJS ${version} with tag @${npmTag}...`
            );
          } catch (error) {
            console.log(`Installing AssembleJS with tag @${npmTag}...`);
          }

          spawnCommand(
            `cd ${projectName} && npm install asmbl@${npmTag} --save-exact`
          );

          if (GENERATOR_CONFIG.isMinimalOutput()) {
            // Minimal output - just essentials (no separator bars)
            console.log("\n🎉 Project created successfully!");
            console.log(`\n📂 Project: ${projectName}`);
            console.log(`📦 Version: ${version}`);

            // Minimal next steps
            console.log("\n🚀 Next steps:");
            console.log(`  cd ${projectName} && npm run dev`);
          } else {
            // Standard or Verbose output with separator bars
            console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
            console.log("\n🎉 Project created successfully!");

            // Display full directory path
            console.log(`\n📂 Project Location: ${projectDir}`);
            console.log(`📦 AssembleJS Version: ${version}`);

            // List created files with full paths
            console.log("\n📄 Created Files:");
            console.log(`  ${path.join(projectDir, "package.json")}`);
            console.log(`  ${path.join(projectDir, "tsconfig.json")}`);
            console.log(`  ${path.join(projectDir, ".env.local")}`);
            console.log(`  ${path.join(projectDir, "src", "server.ts")}`);

            // Print created directories
            console.log("\n📁 Created Directories:");
            console.log(`  ${path.join(projectDir, "src")}`);
            console.log(
              `  ${path.join(projectDir, "src", "blueprints")} (empty)`
            );
            console.log(
              `  ${path.join(projectDir, "src", "components")} (empty)`
            );
            console.log(
              `  ${path.join(projectDir, "src", "controllers")} (empty)`
            );
            console.log(
              `  ${path.join(projectDir, "src", "factories")} (empty)`
            );

            // Print next steps with detailed instructions
            console.log("\n🚀 Next steps:");
            console.log(`  1. Navigate to your project:   cd ${projectName}`);
            console.log(`  2. Start development server:   npm run dev`);
            console.log(`  3. Create your first blueprint: npx asmgen`);
            console.log(
              `  4. Access your site at:         http://localhost:3000`
            );

            if (
              GENERATOR_CONFIG.isVerboseOutput() ||
              GENERATOR_CONFIG.isStandardOutput()
            ) {
              // Print additional development commands
              console.log("\n⚙️ Available Commands:");
              console.log(`  npm run dev        - Start development server`);
              console.log(`  npm run build      - Build for production`);
              console.log(`  npm run start      - Run production build`);
              console.log(
                `  npx asmgen         - Generate AssembleJS components`
              );

              // Print documentation links
              console.log("\n📚 Resources:");
              console.log("  Documentation: https://docs.assemblejs.com");
              console.log("  Website: https://assemblejs.com");
              console.log("  GitHub: https://github.com/zjayers/assemblejs");
              console.log(
                "  Issues: https://github.com/zjayers/assemblejs/issues"
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
