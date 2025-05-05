/**
 * Agent Configuration Controller
 * Handles getting and updating agent configuration
 */

const taskExecutionService = require("../services/taskExecutionService");
const fileDB = require("../models/fileDB");
const { asyncHandler, requireValue } = require("../utils/errorUtils");
const {
  createValidationError,
  createNotFoundError,
} = require("../middleware/errorHandler");

/**
 * Get all agents information
 */
const getAllAgents = asyncHandler(async (req, res) => {
  // Get all agents from fileDB
  const agents = fileDB.agents;

  // Map to include colors and configuration
  const agentsWithDetails = agents.map((agent) => ({
    name: agent,
    color: taskExecutionService.getAgentColor(agent),
    config: taskExecutionService.getAgentConfig(agent) || null,
  }));

  res.json({
    success: true,
    count: agentsWithDetails.length,
    agents: agentsWithDetails,
  });
});

/**
 * Get specific agent information
 */
const getAgentInfo = asyncHandler(async (req, res) => {
  const { agentName } = req.params;

  // Check if agent exists
  const agentExists = fileDB.agents.includes(agentName);
  if (!agentExists) {
    throw createNotFoundError(`Agent '${agentName}' not found`);
  }

  // Get agent config
  const config = taskExecutionService.getAgentConfig(agentName);

  // Get agent color
  const color = taskExecutionService.getAgentColor(agentName);

  // Get agent knowledge count (if available)
  const collectionName = `agent_${agentName}`;
  const collections = await fileDB.listCollections();
  const collection = collections.find((c) => c.name === collectionName);
  const knowledgeCount = collection ? collection.count : 0;

  res.json({
    success: true,
    agent: {
      name: agentName,
      color,
      config,
      knowledgeCount,
    },
  });
});

/**
 * Get all agent system configurations
 */
const getAgentConfigs = asyncHandler(async (req, res) => {
  // Get all agent configs from task execution service
  const configs = {};

  for (const agent of fileDB.agents) {
    configs[agent] = taskExecutionService.getAgentConfig(agent);
  }

  res.json({
    success: true,
    configs,
  });
});

/**
 * Get agent knowledge with pagination
 */
const getAgentKnowledge = asyncHandler(async (req, res) => {
  const { agentName } = req.params;
  const {
    limit = 100,
    page = 1,
    sortBy = "timestamp",
    sortDir = "desc",
  } = req.query;

  // Check if agent exists
  const agentExists = fileDB.agents.includes(agentName);
  if (!agentExists) {
    throw createNotFoundError(`Agent '${agentName}' not found`);
  }

  // Get agent knowledge with pagination
  const result = await fileDB.getAgentKnowledge(
    agentName,
    parseInt(limit),
    parseInt(page),
    sortBy,
    sortDir
  );

  res.json({
    success: true,
    count: result.documents.length,
    totalCount: result.totalCount,
    page: result.page,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
    knowledge: result.documents,
  });
});

/**
 * Search agent knowledge
 */
const searchAgentKnowledge = asyncHandler(async (req, res) => {
  const { agentName } = req.params;
  const { query, limit = 5 } = req.body;

  requireValue(query, "Search query is required");

  // Check if agent exists
  const agentExists = fileDB.agents.includes(agentName);
  if (!agentExists) {
    throw createNotFoundError(`Agent '${agentName}' not found`);
  }

  // Search agent knowledge
  const results = await fileDB.queryAgentKnowledge(
    agentName,
    query,
    parseInt(limit)
  );

  res.json({
    success: true,
    count: results.length,
    results,
  });
});

/**
 * Update agent system prompt
 */
const updateAgentSystemPrompt = asyncHandler(async (req, res) => {
  const { agentName } = req.params;
  const { systemPrompt } = req.body;

  requireValue(systemPrompt, "System prompt is required");

  // Check if agent exists
  const agentExists = fileDB.agents.includes(agentName);
  if (!agentExists) {
    throw createNotFoundError(`Agent '${agentName}' not found`);
  }

  // Update agent config in task execution service
  try {
    taskExecutionService.updateAgentSystemPrompt(agentName, systemPrompt);

    // Return updated config
    const updatedConfig = taskExecutionService.getAgentConfig(agentName);

    res.json({
      success: true,
      message: `Updated system prompt for agent '${agentName}'`,
      config: updatedConfig,
    });
  } catch (error) {
    throw createValidationError(
      `Failed to update agent system prompt: ${error.message}`
    );
  }
});

module.exports = {
  getAllAgents,
  getAgentInfo,
  getAgentConfigs,
  getAgentKnowledge,
  searchAgentKnowledge,
  updateAgentSystemPrompt,
};
