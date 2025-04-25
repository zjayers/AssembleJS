/**
 * Agent Routes
 * API routes for agent-specific knowledge operations
 */

const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// Add knowledge to agent collection
router.post('/:name/knowledge', agentController.addAgentKnowledge);

// Get agent knowledge
router.get('/:name/knowledge', agentController.getAgentKnowledge);

// Query agent knowledge
router.post('/:name/query', agentController.queryAgentKnowledge);

module.exports = router;