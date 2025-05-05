/**
 * Agent Configuration Initialization Script
 * Creates default configuration files for all ARLO agents if they don't exist
 */

const agentConfig = require("../api/models/agentConfig");

// Self-invoking async function to run initialization
(async () => {
  console.log("Initializing agent configurations...");

  try {
    // Initialize all agent configurations
    await agentConfig.getAllAgents();

    console.log("Agent configuration initialization complete!");
    console.log("The following agents should now have configuration files:");

    // List all default agents that were initialized
    Object.keys(agentConfig.defaultAgents).forEach((agentId) => {
      console.log(`- ${agentConfig.defaultAgents[agentId].name} (${agentId})`);
    });

    console.log("\nConfiguration files are stored in:");
    console.log("  /data/agents/*.json");
    console.log("\nSystem prompts are stored in:");
    console.log("  /data/prompts/*.prompt.txt");
  } catch (error) {
    console.error("Error initializing agent configurations:", error);
    process.exit(1);
  }
})();
