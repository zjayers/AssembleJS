/**
 * Agent Controller
 * Handles agent-specific knowledge operations
 */

const fileDB = require('../models/fileDB');

// Add knowledge to an agent's collection
const addAgentKnowledge = async (req, res) => {
  try {
    const { name } = req.params;
    const document = req.body;
    
    const result = await fileDB.addAgentKnowledge(name, document);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error adding knowledge to agent ${req.params.name}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error adding agent knowledge',
      error: error.message
    });
  }
};

// Get all knowledge for an agent
const getAgentKnowledge = async (req, res) => {
  try {
    const { name } = req.params;
    const { limit = 100 } = req.query;
    
    const knowledge = await fileDB.getAgentKnowledge(name, parseInt(limit));
    res.json(knowledge);
  } catch (error) {
    console.error(`Error getting knowledge for agent ${req.params.name}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving agent knowledge',
      error: error.message
    });
  }
};

// Query an agent's knowledge
const queryAgentKnowledge = async (req, res) => {
  try {
    const { name } = req.params;
    const { query, limit = 5 } = req.body;
    
    const results = await fileDB.queryAgentKnowledge(name, query, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error(`Error querying knowledge for agent ${req.params.name}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error querying agent knowledge',
      error: error.message
    });
  }
};

module.exports = {
  addAgentKnowledge,
  getAgentKnowledge,
  queryAgentKnowledge
};