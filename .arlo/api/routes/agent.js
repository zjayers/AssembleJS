/**
 * Agent Routes
 * Unified API routes for all agent operations including knowledge management,
 * configuration, and system prompts
 */

const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");

// ===== Agent information routes =====

// Get all agents with basic info
router.get("/", agentController.getAllAgents);

// Get all agent configurations at once
router.get("/configs", agentController.getAgentConfigs);

// Get a specific agent with basic info
router.get("/:name", agentController.getAgent);

// Get detailed agent information (includes knowledge count, etc)
router.get("/:name/info", agentController.getAgentInfo);

// ===== Configuration routes =====

// Get agent configuration
router.get("/:name/config", agentController.getAgentConfig);

// Update agent configuration
router.put("/:name/config", agentController.updateAgentConfig);

// Reset agent configuration to defaults
router.post("/:name/config/reset", agentController.resetAgentConfig);

// Update agent system prompt
router.put("/:name/system-prompt", agentController.updateAgentSystemPrompt);

// ===== Knowledge management routes =====

// Add knowledge to agent collection
router.post("/:name/knowledge", agentController.addAgentKnowledge);

// Get agent knowledge (with pagination)
router.get("/:name/knowledge", agentController.getAgentKnowledge);

// Query agent knowledge
router.post("/:name/query", agentController.queryAgentKnowledge);

// Search agent knowledge
router.post("/:name/knowledge/search", agentController.searchAgentKnowledge);

module.exports = router;
