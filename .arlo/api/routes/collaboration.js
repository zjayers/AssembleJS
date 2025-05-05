/**
 * Collaboration Routes
 * API routes for agent collaboration, messaging, and team management
 */
const express = require("express");
const router = express.Router();
const collaborationController = require("../controllers/collaborationController");

// Get all collaborations for an agent
router.get(
  "/agent/:agentId/collaborations",
  collaborationController.getCollaborations
);

// Create a new collaboration/message
router.post("/collaborations", collaborationController.createCollaboration);

// Get a specific collaboration
router.get("/collaborations/:id", collaborationController.getCollaboration);

// Update a collaboration (respond or change status)
router.put("/collaborations/:id", collaborationController.updateCollaboration);

// Delete a collaboration
router.delete(
  "/collaborations/:id",
  collaborationController.deleteCollaboration
);

// Team management
router.post("/teams", collaborationController.createTeam);
router.get("/agent/:agentId/teams", collaborationController.getAgentTeams);
router.post("/teams/suggest", collaborationController.suggestTeam);

module.exports = router;
