/**
 * Agent Configuration Model
 * Manages agent metadata and configuration settings
 */

const fileDB = require("./fileDB");
const path = require("path");
const fs = require("fs").promises;

// Path to agent configurations
const configDirectory = path.join(__dirname, "../../data/agents");

// Default agent configurations
const defaultAgents = {
  admin: {
    id: "admin",
    name: "Admin",
    role: "Project coordinator and workflow orchestrator",
    description:
      "Serves as the central hub for task management and agent coordination.",
    icon: "admin-icon.png",
    specialization: "coordination",
    model: "claude-3-opus",
    priority: "high",
  },
  analyzer: {
    id: "analyzer",
    name: "Analyzer",
    role: "Performance optimization specialist",
    description:
      "Specializes in analyzing and improving performance in the /src/analyzer/ directory.",
    icon: "analyzer-icon.png",
    specialization: "performance",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  browser: {
    id: "browser",
    name: "Browser",
    role: "Frontend architecture expert",
    description:
      "Specializes in client-side code, UI components, and frontend architecture.",
    icon: "browser-icon.png",
    specialization: "codebase",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  bundler: {
    id: "bundler",
    name: "Bundler",
    role: "Build system specialist",
    description:
      "Focuses on build systems and code in the /src/bundler/ directory.",
    icon: "bundler-icon.png",
    specialization: "infrastructure",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  config: {
    id: "config",
    name: "Config",
    role: "Configuration expert",
    description:
      "Manages configuration and system settings for the AssembleJS framework.",
    icon: "config-icon.png",
    specialization: "configuration",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  developer: {
    id: "developer",
    name: "Developer",
    role: "Development tooling expert",
    description:
      "Specializes in development tools and utilities in the /src/developer/ directory.",
    icon: "developer-icon.png",
    specialization: "tooling",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  generator: {
    id: "generator",
    name: "Generator",
    role: "Code scaffolding specialist",
    description:
      "Creates and maintains code generators and templates in the /src/generator/ directory.",
    icon: "generator-icon.png",
    specialization: "scaffolding",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  git: {
    id: "git",
    name: "Git",
    role: "Repository management expert",
    description: "Handles version control, commits, and pull requests.",
    icon: "git-icon.png",
    specialization: "infrastructure",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  pipeline: {
    id: "pipeline",
    name: "Pipeline",
    role: "CI/CD workflow manager",
    description: "Manages GitHub Actions workflows and CI/CD pipeline systems.",
    icon: "pipeline-icon.png",
    specialization: "infrastructure",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  docs: {
    id: "docs",
    name: "Docs",
    role: "Documentation specialist",
    description: "Focuses on creating and maintaining documentation.",
    icon: "docs-icon.png",
    specialization: "documentation",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  server: {
    id: "server",
    name: "Server",
    role: "Backend architecture expert",
    description:
      "Specializes in server-side code, API design, and backend infrastructure.",
    icon: "server-icon.png",
    specialization: "codebase",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  testbed: {
    id: "testbed",
    name: "Testbed",
    role: "Testbed project manager",
    description:
      "Manages testbed projects and code in the /testbed/ directory.",
    icon: "testbed-icon.png",
    specialization: "testing",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  types: {
    id: "types",
    name: "Types",
    role: "Type system design specialist",
    description:
      "Designs and manages type definitions in the /src/types/ directory.",
    icon: "types-icon.png",
    specialization: "types",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  utils: {
    id: "utils",
    name: "Utils",
    role: "Utility function expert",
    description:
      "Manages utility functions, helpers, and common code patterns.",
    icon: "utils-icon.png",
    specialization: "codebase",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  validator: {
    id: "validator",
    name: "Validator",
    role: "Quality assurance specialist",
    description: "Performs code reviews, testing, and validation.",
    icon: "validator-icon.png",
    specialization: "testing",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  version: {
    id: "version",
    name: "Version",
    role: "Package versioning specialist",
    description:
      "Manages package versioning and dependencies for the AssembleJS framework.",
    icon: "version-icon.png",
    specialization: "infrastructure",
    model: "claude-3-sonnet",
    priority: "normal",
  },
  arlo: {
    id: "arlo",
    name: "ARLO",
    role: "Self-maintenance specialist",
    description:
      "Dedicated to self-maintenance and enhancement of the ARLO system itself.",
    icon: "arlo-icon.png",
    specialization: "meta",
    model: "claude-3-sonnet",
    priority: "normal",
  },
};

// Default configuration template
const defaultConfigTemplate = {
  // Model settings
  temperature: 0.7,
  contextWindow: 100000,
  reasoningDepth: "standard",
  verbosity: "standard",

  // Access permissions
  systemAccess: true,
  gitAccess: true,
  fileWriteAccess: true,
  apiAccess: true,

  // Knowledge management
  knowledgeSources: ["codebase", "documentation"],
  knowledgeUpdateFrequency: "daily",
  autoLearnFromTasks: true,
  enableMemory: true,
  memoryRetention: "week",

  // Collaboration settings
  collaborators: [
    "admin",
    "analyzer",
    "browser",
    "bundler",
    "config",
    "developer",
    "generator",
    "git",
    "pipeline",
    "docs",
    "server",
    "testbed",
    "types",
    "utils",
    "validator",
    "version",
    "arlo",
  ],
  collaborationMode: "reactive",

  // Custom attributes
  customAttributes: {},
};

/**
 * Ensure the configuration directory exists
 */
async function ensureConfigDirectory() {
  try {
    await fs.mkdir(configDirectory, { recursive: true });
  } catch (error) {
    console.error("Error creating agent config directory:", error);
  }
}

/**
 * Initialize agent configurations if they don't exist
 */
async function initializeAgentConfigs() {
  await ensureConfigDirectory();

  // Check if agent configs exist
  try {
    const agents = Object.keys(defaultAgents);
    console.log(`Checking configurations for ${agents.length} agents...`);

    for (const agentId of agents) {
      const configPath = path.join(configDirectory, `${agentId}.json`);

      try {
        // Check if config exists
        await fs.access(configPath);
        // Config exists, log this for debugging
        console.log(`Config exists for agent: ${agentId}`);
      } catch (err) {
        // Config doesn't exist, create it
        const baseAgent = defaultAgents[agentId];

        // Get all collaborators except this agent
        const collaborators = Object.keys(defaultAgents).filter(
          (id) => id !== agentId
        );

        // Create a complete configuration
        const config = {
          ...baseAgent,
          ...defaultConfigTemplate,
          // Customize collaborators to exclude self
          collaborators,
        };

        // Save the config
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log(`Created default configuration for agent: ${agentId}`);
      }
    }

    console.log(`Agent configuration initialization complete`);
    return true;
  } catch (error) {
    console.error("Error initializing agent configurations:", error);
    return false;
  }
}

/**
 * Get all agents
 * @return {Promise<Array>} List of all agents with basic information
 */
async function getAllAgents() {
  await initializeAgentConfigs();

  try {
    const agentFiles = await fs.readdir(configDirectory);
    const agents = [];

    for (const file of agentFiles) {
      if (file.endsWith(".json")) {
        const configPath = path.join(configDirectory, file);
        const configData = await fs.readFile(configPath, "utf8");
        const config = JSON.parse(configData);

        // Extract basic agent information
        agents.push({
          id: config.id,
          name: config.name,
          role: config.role,
          description: config.description,
          icon: config.icon,
          specialization: config.specialization,
          model: config.model,
          priority: config.priority,
        });
      }
    }

    return agents;
  } catch (error) {
    console.error("Error getting all agents:", error);
    return [];
  }
}

/**
 * Get a specific agent
 * @param {string} agentId - The agent ID to retrieve
 * @return {Promise<Object>} The agent information
 */
async function getAgent(agentId) {
  await initializeAgentConfigs();

  try {
    const configPath = path.join(configDirectory, `${agentId}.json`);
    const configData = await fs.readFile(configPath, "utf8");
    const agent = JSON.parse(configData);

    // Extract and return basic agent information
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      description: agent.description,
      icon: agent.icon,
      specialization: agent.specialization,
      model: agent.model,
      priority: agent.priority,
    };
  } catch (error) {
    console.error(`Error getting agent ${agentId}:`, error);
    return null;
  }
}

/**
 * Get agent configuration
 * @param {string} agentId - The agent ID to retrieve configuration for
 * @return {Promise<Object>} The agent's configuration
 */
async function getAgentConfig(agentId) {
  await initializeAgentConfigs();

  try {
    const configPath = path.join(configDirectory, `${agentId}.json`);
    const configData = await fs.readFile(configPath, "utf8");
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Error getting configuration for agent ${agentId}:`, error);
    return null;
  }
}

/**
 * Update agent configuration
 * @param {string} agentId - The agent ID to update configuration for
 * @param {Object} config - The new configuration
 * @return {Promise<Object>} Result of the operation
 */
async function updateAgentConfig(agentId, config) {
  await initializeAgentConfigs();

  try {
    // Normalize the agent ID to lowercase
    const normalizedAgentId = agentId.toLowerCase();

    // Check if it's a valid agent ID
    if (!Object.keys(defaultAgents).includes(normalizedAgentId)) {
      console.warn(`Unknown agent ID being configured: ${agentId}`);
      // Continue anyway in case it's a new agent
    }

    // Get existing config
    const configPath = path.join(configDirectory, `${agentId}.json`);
    let existingConfig;

    try {
      const configData = await fs.readFile(configPath, "utf8");
      existingConfig = JSON.parse(configData);
    } catch (error) {
      // If config doesn't exist, use default
      existingConfig = {
        ...defaultAgents[agentId],
        ...defaultConfigTemplate,
      };
    }

    // Merge the new config with existing, preserving ID
    const updatedConfig = {
      ...existingConfig,
      ...config,
      id: agentId, // Ensure the ID doesn't change
    };

    // Save the updated config
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));

    return {
      success: true,
      message: `Configuration for agent ${agentId} updated successfully`,
    };
  } catch (error) {
    console.error(`Error updating configuration for agent ${agentId}:`, error);
    return {
      success: false,
      message: "Error updating agent configuration",
      error: error.message,
    };
  }
}

/**
 * Reset agent configuration to defaults
 * @param {string} agentId - The agent ID to reset configuration for
 * @return {Promise<Object>} Result of the operation
 */
async function resetAgentConfig(agentId) {
  try {
    // Normalize the agent ID to lowercase
    const normalizedAgentId = agentId.toLowerCase();

    // Check if it's a valid agent ID
    if (!Object.keys(defaultAgents).includes(normalizedAgentId)) {
      console.warn(`Unknown agent ID being reset: ${agentId}`);
      // Continue anyway in case it's a new agent
    }

    // Create default config
    const defaultConfig = {
      ...defaultAgents[agentId],
      ...defaultConfigTemplate,
      // Customize some settings based on agent role
      collaborators: Object.keys(defaultAgents).filter((id) => id !== agentId),
    };

    // Save the default config
    const configPath = path.join(configDirectory, `${agentId}.json`);
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));

    return {
      success: true,
      message: `Configuration for agent ${agentId} reset to defaults`,
    };
  } catch (error) {
    console.error(`Error resetting configuration for agent ${agentId}:`, error);
    return {
      success: false,
      message: "Error resetting agent configuration",
      error: error.message,
    };
  }
}

// Initialize on module load
initializeAgentConfigs().catch(console.error);

module.exports = {
  getAllAgents,
  getAgent,
  getAgentConfig,
  updateAgentConfig,
  resetAgentConfig,
  defaultAgents,
  initializeAgentConfigs,
};
