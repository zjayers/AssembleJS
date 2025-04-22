import type { NodePlopAPI } from "plop";
import type { Answers } from "inquirer";
import fs from "fs";
import { CONSTANTS } from "../../constants/blueprint.constants";
import { GENERATOR_PATHS } from "../common/paths";
import { getRandomColor, getRandomSalutation } from "../common/common";
import { GENERATOR_CONFIG } from "../common/generator.config";

/**
 * Generate a new Server.
 * @param {NodePlopAPI} plop - The plop instance.
 * @author Zach Ayers
 */
export default function (plop: NodePlopAPI) {
  plop.setPartial("randomSalutation", getRandomSalutation());
  plop.setPartial("randomColor", getRandomColor());

  plop.setGenerator("AssembleJS Model", {
    description: "Generate a new data model for your application",
    prompts: (function () {
      // Return the interactive prompts with consistent order:
      // 1. Name
      // 2. (View N/A for models)
      // 3. (Registration N/A for models)
      // 4. (Language N/A for models)
      return [
        // 1. NAME - Model name
        {
          type: "input",
          name: "MODEL_NAME",
          message: "Model name (data structure definition):",
          default: "item",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Model name cannot be empty";
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return "Model name should only contain lowercase letters, numbers, and hyphens";
            }
            return true;
          },
        },
        // 2. VIEW - Not applicable for models
        // 3. REGISTRATION - Not applicable for models
        // 4. LANGUAGE - Not applicable for models
      ];
    })(),
    actions: function (answers: Answers = {}) {

      return [
        {
          type: "addMany",
          destination: GENERATOR_PATHS.MODELS_DIR(),
          base: GENERATOR_PATHS.MODEL_TEMPLATE,
          templateFiles: GENERATOR_PATHS.MODEL_TEMPLATE,
          stripExtensions: ["hbs"],
          // Add error handling for file creation
          globOptions: {
            dot: true,
          },
          // Add a transformation hook to check for directory existence
          transform: (content: string, answers: Answers) => {
            try {
              // Ensure the destination directory exists
              const destDir = GENERATOR_PATHS.MODELS_DIR();
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }

              // For models, we just need to ensure the models directory exists
              // since the output is directly in that directory (not in subdirectories)

              return content;
            } catch (err) {
              console.error(`Failed to create model directory:`, err);
              return "ERROR: Failed to create directory - see console for details";
            }
          },
        },
        // Add completion message
        (answers: Answers) => {
          const modelName = answers.MODEL_NAME;
          const modelsDir = GENERATOR_PATHS.MODELS_DIR();
          const modelPath = `${modelsDir}/${modelName}.model.ts`;

          if (GENERATOR_CONFIG.isMinimalOutput()) {
            // Minimal output - just the essentials (no separator bars)
            console.log("\n📊 Model created successfully!");
            console.log(`\n📂 Model: ${modelName}.model.ts`);
          } else {
            // Standard or verbose output with separator bars
            console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
            console.log("\n📊 Model created successfully!");

            // Display full directory path
            console.log(`\n📂 Model Location: ${modelsDir}`);

            // List created files with full paths
            console.log("\n📄 Created Files:");
            console.log(`  ${modelPath}`);

            // Print code example
            console.log("\n💡 Example Usage:");
            console.log(`  // In a controller or service
  import { ${modelName}Model } from "../models/${modelName}.model";
  
  // Create a new instance
  const my${
    modelName.charAt(0).toUpperCase() + modelName.slice(1)
  } = new ${modelName}Model({
    // Your model properties here
  });
  
  // Use the model
  console.log(my${
    modelName.charAt(0).toUpperCase() + modelName.slice(1)
  }.toJSON());`);

            // Print next steps
            console.log("\n🚀 Next steps:");
            console.log(`  1. Define properties and methods in your model`);
            console.log(
              `  2. Import and use your model in services or controllers`
            );
            console.log(`  3. Add validation logic if needed`);

            // Only show closing separator in standard/verbose mode
            console.log("\n" + CONSTANTS.welcomeBannerConsoleSeparator);
          }

          return "";
        },
      ];
    },
  });
}
