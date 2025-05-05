/**
 * Agent Configuration Routes
 * Routes for agent configuration and management
 */

const express = require("express");
const router = express.Router();
const agentConfigController = require("../controllers/agentConfigController");

// Get all agents with their configurations
router.get("/", agentConfigController.getAllAgents);

// Get all agent configurations
router.get("/configs", agentConfigController.getAgentConfigs);

// Get specific agent information
router.get("/:agentName", agentConfigController.getAgentInfo);

// Get agent knowledge
router.get("/:agentName/knowledge", agentConfigController.getAgentKnowledge);

// Search agent knowledge
router.post(
  "/:agentName/knowledge/search",
  agentConfigController.searchAgentKnowledge
);

// Update agent system prompt
router.put(
  "/:agentName/system-prompt",
  agentConfigController.updateAgentSystemPrompt
);

module.exports = router;
