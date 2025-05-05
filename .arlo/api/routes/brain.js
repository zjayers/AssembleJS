/**
 * Agent Brain Routes
 * API routes for agent brain operations
 */

const express = require("express");
const router = express.Router();
const brainController = require("../controllers/agentBrainController");

// Initialize an agent's brain
router.post("/:agent/init", brainController.initBrain);

// Entity management
router.post("/:agent/entity", brainController.registerEntity);
router.get("/:agent/entity/:entityId", brainController.getEntity);
router.get("/:agent/entities", brainController.getEntitiesByType);

// Memory management
router.post("/:agent/memory", brainController.addMemory);
router.get("/:agent/memories", brainController.getMemories);
router.post("/:agent/decision", brainController.recordDecision);
router.post("/:agent/observation", brainController.recordObservation);

// Preference management
router.put("/:agent/preference/:category/:key", brainController.setPreference);
router.get("/:agent/preferences", brainController.getPreferences);

// Rule management
router.post("/:agent/rule", brainController.addRule);
router.get("/:agent/rules", brainController.getRules);

// Metrics and task tracking
router.post("/:agent/task-completion", brainController.recordTaskCompletion);
router.get("/:agent/metrics", brainController.getMetrics);

// Knowledge retrieval
router.post(
  "/:agent/knowledge-for-task",
  brainController.retrieveKnowledgeForTask
);

module.exports = router;
