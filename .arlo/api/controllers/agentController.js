/**
 * Agent Controller
 * Unified controller that handles all agent-specific operations
 * including knowledge management, configuration, and system prompts
 */

const fileDB = require("../models/fileDB");
const agentConfig = require("../models/agentConfig");
const taskExecutionService = require("../services/taskExecutionService");
const { asyncHandler, requireValue } = require("../utils/errorUtils");
const {
  createNotFoundError,
  createValidationError,
} = require("../middleware/errorHandler");

// Add knowledge to an agent's collection
const addAgentKnowledge = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const document = req.body;

  // Validate required parameters
  requireValue(name, "Agent name is required");
  requireValue(document, "Document body is required");

  // Normalize the agent name for case-insensitive lookup
  const normalizedAgentName = name.toLowerCase();

  // Find the actual agent name with correct casing
  let actualAgentName = name;
  if (fileDB.agents) {
    const foundAgent = fileDB.agents.find(
      (agent) => agent.toLowerCase() === normalizedAgentName
    );
    if (foundAgent) {
      actualAgentName = foundAgent;
    }
  }

  const result = await fileDB.addAgentKnowledge(actualAgentName, document);

  if (!result.success) {
    throw createValidationError(
      result.message || "Failed to add agent knowledge",
      result.error
    );
  }

  res.json(result);
});

// Get all knowledge for an agent with pagination
const getAgentKnowledge = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const {
    limit = 100,
    page = 1,
    sortBy = "timestamp",
    sortDir = "desc",
  } = req.query;

  requireValue(name, "Agent name is required");

  // Normalize the agent name for case-insensitive lookup
  const normalizedAgentName = name.toLowerCase();

  // Find the actual agent name with correct casing
  let actualAgentName = name;
  if (fileDB.agents) {
    const foundAgent = fileDB.agents.find(
      (agent) => agent.toLowerCase() === normalizedAgentName
    );
    if (foundAgent) {
      actualAgentName = foundAgent;
    }
  }

  const result = await fileDB.getAgentKnowledge(
    actualAgentName,
    parseInt(limit),
    parseInt(page),
    sortBy,
    sortDir
  );

  res.json({
    success: true,
    ...result,
  });
});

// Query an agent's knowledge
const queryAgentKnowledge = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { query, limit = 5 } = req.body;

  requireValue(name, "Agent name is required");
  requireValue(query, "Query is required");

  // Normalize the agent name for case-insensitive lookup
  const normalizedAgentName = name.toLowerCase();

  // Find the actual agent name with correct casing
  let actualAgentName = name;
  if (fileDB.agents) {
    const foundAgent = fileDB.agents.find(
      (agent) => agent.toLowerCase() === normalizedAgentName
    );
    if (foundAgent) {
      actualAgentName = foundAgent;
    }
  }

  const results = await fileDB.queryAgentKnowledge(
    actualAgentName,
    query,
    parseInt(limit)
  );
  res.json(results);
});

// Get all agents
const getAllAgents = asyncHandler(async (req, res) => {
  const agents = await agentConfig.getAllAgents();

  // Add colors and execution configurations to each agent
  const enhancedAgents = agents.map((agent) => {
    return {
      ...agent,
      color: taskExecutionService.getAgentColor(agent.name),
      executionConfig: taskExecutionService.getAgentConfig(agent.name) || null,
    };
  });

  res.json({
    success: true,
    count: enhancedAgents.length,
    agents: enhancedAgents,
  });
});

// Get a specific agent
const getAgent = asyncHandler(async (req, res) => {
  const { name } = req.params;
  requireValue(name, "Agent name is required");

  // Normalize the agent name for case-insensitive lookup
  const normalizedAgentName = name.toLowerCase();

  // Find the actual agent name with correct casing
  let actualAgentName = name;
  if (fileDB.agents) {
    const foundAgent = fileDB.agents.find(
      (agent) => agent.toLowerCase() === normalizedAgentName
    );
    if (foundAgent) {
      actualAgentName = foundAgent;
    }
  }

  // Get agent with proper casing
  const agent = await agentConfig.getAgent(actualAgentName);

  if (!agent) {
    throw createNotFoundError(`Agent ${name} not found`);
  }

  // Add color from task execution service
  agent.color = taskExecutionService.getAgentColor(actualAgentName);

  // Add task execution config if available
  const executionConfig = taskExecutionService.getAgentConfig(actualAgentName);
  if (executionConfig) {
    agent.executionConfig = executionConfig;
  }

  res.json(agent);
});

// Get agent configuration
const getAgentConfig = asyncHandler(async (req, res) => {
  const { name } = req.params;
  requireValue(name, "Agent name is required");

  // Normalize the agent name for case-insensitive lookup
  const normalizedAgentName = name.toLowerCase();

  // Find the actual agent name with correct casing
  let actualAgentName = name;
  if (fileDB.agents) {
    const foundAgent = fileDB.agents.find(
      (agent) => agent.toLowerCase() === normalizedAgentName
    );
    if (foundAgent) {
      actualAgentName = foundAgent;
    }
  }

  const config = await agentConfig.getAgentConfig(actualAgentName);

  if (!config) {
    throw createNotFoundError(`Configuration for agent ${name} not found`);
  }

  res.json(config);
});

// Update agent configuration
const updateAgentConfig = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const config = req.body;

  requireValue(name, "Agent name is required");
  requireValue(config, "Configuration is required");

  const result = await agentConfig.updateAgentConfig(name, config);

  if (!result.success) {
    throw createValidationError(
      result.message || "Failed to update agent configuration",
      result.error
    );
  }

  res.json(result);
});

// Reset agent configuration to defaults
const resetAgentConfig = asyncHandler(async (req, res) => {
  const { name } = req.params;
  requireValue(name, "Agent name is required");

  const result = await agentConfig.resetAgentConfig(name);

  if (!result.success) {
    throw createValidationError(
      result.message || "Failed to reset agent configuration",
      result.error
    );
  }

  res.json(result);
});

// Update an agent's system prompt
const updateAgentSystemPrompt = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { systemPrompt } = req.body;

  requireValue(name, "Agent name is required");
  requireValue(systemPrompt, "System prompt is required");

  try {
    let success;

    // Check if this is a reset to default request
    if (systemPrompt === "DEFAULT_RESET") {
      // Reset to default system prompt
      success = taskExecutionService.resetAgentSystemPrompt(name);
    } else {
      // Check prompt validity
      if (typeof systemPrompt !== "string" || systemPrompt.trim().length < 10) {
        throw createValidationError(
          "System prompt must be a string of at least 10 characters"
        );
      }

      // Update the system prompt using the task execution service
      success = taskExecutionService.updateAgentSystemPrompt(
        name,
        systemPrompt
      );
    }

    if (!success) {
      throw createValidationError(
        `Failed to update system prompt for agent ${name}`
      );
    }

    // Get the updated agent configuration
    const executionConfig = taskExecutionService.getAgentConfig(name);

    // Get the updated agent configuration to return in response
    const updatedAgent = {
      name,
      systemPrompt: executionConfig?.systemPrompt || systemPrompt,
      color: taskExecutionService.getAgentColor(name),
      executionConfig,
    };

    res.json({
      success: true,
      message:
        systemPrompt === "DEFAULT_RESET"
          ? `System prompt reset to default for agent ${name}`
          : `System prompt updated for agent ${name}`,
      agent: updatedAgent,
    });
  } catch (error) {
    throw createValidationError(
      error.message || `Failed to update system prompt for agent ${name}`,
      error
    );
  }
});

// Get specific agent info with more details
const getAgentInfo = asyncHandler(async (req, res) => {
  const { name } = req.params;

  // Normalize the agent name for case-insensitive lookup
  const normalizedAgentName = name.toLowerCase();

  // Find the agent using case-insensitive matching
  let actualAgentName = null;
  if (fileDB.agents) {
    actualAgentName = fileDB.agents.find(
      (agent) => agent.toLowerCase() === normalizedAgentName
    );
  }

  // If no match found, try to use the provided name
  if (!actualAgentName) {
    // Check if it might be a direct match despite case differences
    const agentExists = fileDB.agents && fileDB.agents.includes(name);
    if (!agentExists) {
      throw createNotFoundError(`Agent '${name}' not found`);
    }
    actualAgentName = name;
  }

  // Get agent config using the correct case
  const config = taskExecutionService.getAgentConfig(actualAgentName);

  // Get agent color using the correct case
  const color = taskExecutionService.getAgentColor(actualAgentName);

  // Get agent knowledge count (if available)
  const collectionName = `agent_${actualAgentName}`;
  const collections = await fileDB.listCollections();
  const collection = collections.find((c) => c.name === collectionName);
  const knowledgeCount = collection ? collection.count : 0;

  res.json({
    success: true,
    agent: {
      name: actualAgentName, // Return the correctly cased name
      color,
      config,
      knowledgeCount,
    },
  });
});

// Get all agent system configurations
const getAgentConfigs = asyncHandler(async (req, res) => {
  // Get all agent configs from task execution service
  const configs = {};

  if (fileDB.agents) {
    for (const agent of fileDB.agents) {
      configs[agent] = taskExecutionService.getAgentConfig(agent);
    }
  }

  res.json({
    success: true,
    configs,
  });
});

// Search agent knowledge
const searchAgentKnowledge = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { query, limit = 5 } = req.body;

  requireValue(query, "Search query is required");

  // Normalize the agent name for case-insensitive lookup
  const normalizedAgentName = name.toLowerCase();

  // Find the actual agent name with correct casing
  let actualAgentName = null;
  if (fileDB.agents) {
    const foundAgent = fileDB.agents.find(
      (agent) => agent.toLowerCase() === normalizedAgentName
    );
    if (foundAgent) {
      actualAgentName = foundAgent;
    }
  }

  // If no match found, throw error
  if (!actualAgentName) {
    throw createNotFoundError(`Agent '${name}' not found`);
  }

  // Search agent knowledge
  const results = await fileDB.queryAgentKnowledge(
    actualAgentName,
    query,
    parseInt(limit)
  );

  res.json({
    success: true,
    count: results.length,
    results,
  });
});

module.exports = {
  // Knowledge operations
  addAgentKnowledge,
  getAgentKnowledge,
  queryAgentKnowledge,
  searchAgentKnowledge,

  // Agent information
  getAllAgents,
  getAgent,
  getAgentInfo,

  // Configuration operations
  getAgentConfig,
  getAgentConfigs,
  updateAgentConfig,
  resetAgentConfig,

  // System prompt operations
  updateAgentSystemPrompt,
};
