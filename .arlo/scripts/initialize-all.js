/**
 * Complete Initialization Script
 * Runs all initialization processes for the ARLO system
 */

const agentConfig = require("../api/models/agentConfig");
const taskExecutionService = require("../api/services/taskExecutionService");
const path = require("path");
const fs = require("fs").promises;

// Self-invoking async function to run initialization
(async () => {
  console.log("===== ARLO System Initialization =====");

  try {
    // Create data directories if they don't exist
    const dataDir = path.join(__dirname, "../data");
    const promptsDir = path.join(dataDir, "prompts");
    const agentsDir = path.join(dataDir, "agents");

    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(promptsDir, { recursive: true });
    await fs.mkdir(agentsDir, { recursive: true });

    console.log("Data directories created/verified");

    // Initialize agent configurations
    console.log("\n-- Initializing Agent Configurations --");
    await agentConfig.getAllAgents();

    // Initialize system prompts
    console.log("\n-- Initializing System Prompts --");
    if (taskExecutionService._loadSavedSystemPrompts) {
      await taskExecutionService._loadSavedSystemPrompts();
    }

    console.log("\n===== Initialization Complete =====");
    console.log("All agent configurations and system prompts are ready.");
    console.log("\nAgent configuration files: /data/agents/*.json");
    console.log("System prompt files: /data/prompts/*.prompt.txt");
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
})();
